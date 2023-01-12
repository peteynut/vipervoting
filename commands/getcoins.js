const { SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getcoins')
		.setDescription('Get coin balance')
        .addUserOption(option => option.setName('target').setDescription('The user')),
    
    async execute(interaction,balance){
        const target = interaction.options.getUser('target') ?? interaction.user;

		await interaction.reply({content: `${target} has $${balance} 💰`, ephemeral: true});
    }
};