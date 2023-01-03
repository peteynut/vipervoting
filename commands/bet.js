const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bet')
		.setDescription('Start bet for a battle'),
	async execute(interaction) {
		await interaction.reply('Vote now for who you think will win. Type p1 or p2 to set your bet');
	},
};