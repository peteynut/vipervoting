const { SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getcoins')
		.setDescription('Get coin balance'),
    
    async execute(interaction,balance){
        const target = interaction.options.getUser('user') ?? interaction.user;

		await interaction.reply({content: `${target.tag} has ${balance}💰`, ephemeral: true});
    }
};