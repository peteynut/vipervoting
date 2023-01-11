require('dotenv').config({path:__dirname+'/.env2'});
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

async function addBalance(id, currency, amount) {
	// Add currency
	const user = currency.get(id);

	if (user) {
		user.balance += Number(amount);
		return user.save();
	}

}

function getBalance(id, currency) {
	const user = currency.get(id);
	console.log(user)
	if (user) {
		console.log('recognised user')
		return user ? user.balance : 0;
	}
	
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('manage')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescription('Manage Viper Voting')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add_admin_user')
                .setDescription('Add Priveledge User')
                .addUserOption(option => option.setName('target').setDescription('The user')))
        .addSubcommand(subcommand =>
                subcommand
                .setName('remove_admin_user')
                .setDescription('Remove Priveledge User')
                .addUserOption(option => option.setName('target').setDescription('The user'))) 
        .addSubcommand(subcommand =>
            subcommand
                .setName('setbalance')
                .setDescription('Set a users coin balance')
                .addUserOption(option => option.setName('target').setDescription('The user'))
                .addIntegerOption(option => option.setName('amount').setDescription('How many coins to set?')
                .setMinValue(0)
                .setMaxValue(22)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('removeuser')
                .setDescription('Remove a user from the database of coins')
                .addUserOption(option => option.setName('target').setDescription('The user')))
		
,
	async execute(interaction,client,currency,admins) {
        let user_id = interaction.options.getUser('target').id
        let serverMembers = client.guilds.cache.get(process.env.guildId).members;
		let matchedMember = serverMembers.cache.find(m => m.id === user_id);
        if (interaction.options.getSubcommand() === 'add_admin_user') {
            await interaction.reply({content: 'Added ' + matchedMember.displayName + ' to priveledged users.', ephemeral: true});
        }
        else if (interaction.options.getSubcommand() === 'remove_admin_user'){
            await interaction.reply({content: 'Removed ' + matchedMember.displayName + ' from priveledged users.', ephemeral: true});
        }
        else if (interaction.options.getSubcommand() === 'setbalance'){
            let old_balance = getBalance(user_id,currency);
            let new_balance = interaction.options.getInteger('amount');
            await interaction.reply({content: 'Set ' + matchedMember.displayName + ' coin balance from ' + old_balance + 'to ' + new_balance, ephemeral: true});
        }
        else if (interaction.options.getSubcommand() === 'removeuser'){
            await interaction.reply({content: 'Removed ' + matchedMember.displayName + ' from currency database.', ephemeral: true});
        }
    },
};