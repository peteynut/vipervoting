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
                .setMaxValue(100000)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('removeuser')
                .setDescription('Remove a user from the database of coins')
                .addUserOption(option => option.setName('target').setDescription('The user')))
		
,
	async execute(interaction,client,currency,admins) {
        // Do nothing, this holds the commands but no execution   
    }
};