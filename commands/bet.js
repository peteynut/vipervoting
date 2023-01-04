const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder, moveElementInArray, messageLink } = require('discord.js');

var player1_string = 'Player 1'
var player2_string = 'Player 2'
var player1_votes = 0
var player2_votes = 0
var newDateObj = new Date()
var timeleft = 0
var p1_percent = 0
var p2_percent = 0
var winning_player = "Draw"
var bets_open = false

function bet_calculate (p1,p2){
	var total_percent = p1 + p2
	p1_percent = p1 / total_percent * 100;
	p2_percent = p2 / total_percent * 100;
	if(p1_percent == p2_percent){
		winning_player = "Draw"
	}
	else if(p1_percent <= p2_percent){
		winning_player = player2_string
	}
	else if(p2_percent <= p1_percent){
		winning_player = player1_string
	}
	return(p1_percent,p2_percent);
}

// Function for creating output after bets are closed
function embed_closed(){
	var close_embed = new EmbedBuilder()
			.setTitle('Vote Closed')
			.addFields(
				{ name: '-', value: 'Betting closed'},
				{ name: player1_string, value: 'Player 1', inline: true },
				{ name: 'VS', value: '\u200B', inline: true },
				{ name: player2_string, value: 'Player 2', inline: true },
				{ name: '\u200B', value: parseFloat(p1_percent).toFixed(2) + '%', inline: true },
				{ name: '\u200B', value: '\u200B', inline: true },
				{ name: '\u200B', value: parseFloat(p2_percent).toFixed(2) + '%', inline: true },
				{ name: '\u200B', value: '\u200B' },
				{ name: 'The favourite is:  ', value: winning_player},
				{ name: '\u200B', value: '\u200B' },
				{ name: 'Betting closed ', value: '\u200B'})
				return(close_embed);
}

// Function for creating output from a bet placement
function embed_placebet(){
	var total_votes = player1_votes + player2_votes;
	var update_embed = new EmbedBuilder()
	.setTitle('Viper Voting - in progress')
	.addFields(
	{ name: '\u200B', value: 'Betting open'},
	{ name: player1_string, value: 'Player 1', inline: true },
	{ name: 'VS', value: '\u200B', inline: true },
	{ name: player2_string, value: 'Player 2', inline: true },
	{ name: '\u200B', value: parseFloat(p1_percent).toFixed(2) + '%', inline: true },
	{ name: '\u200B', value: '\u200B', inline: true },
	{ name: '\u200B', value: parseFloat(p2_percent).toFixed(2) + '%', inline: true },
	{ name: '\u200B', value: '\u200B' },
	{ name: 'Total Bets: ', value: total_votes.toString()},
	{ name: '\u200B', value: '\u200B' },
	{ name: 'Betting closes at ', value: newDateObj.toLocaleString()})
	return(update_embed)
}
module.exports = {
	data: new SlashCommandBuilder()
		.setName('bet')
		.setDescription('Start bet for a battle')
		.addIntegerOption(option =>
			option.setName('time')
			.setDescription('Time limit for votes')
			.setRequired(true)
			.addChoices(
			{name: '30 seconds', value: 30},
			{name: '1 minute', value: 60},
			{name: '3 minutes', value: 180},
			{name: '5 minutes', value: 300},))
		.addStringOption(option => 
			option.setName('player1')
			.setDescription('Name of Player 1'))
		.addStringOption(option =>
			option.setName('player2')
			.setDescription('Name of Player 2')),
		

	async execute(interaction) {
		bets_open = true
		player1_votes = 0
		player2_votes = 0
		player1_string = interaction.options.getString('player1') ?? ' - ';
		player2_string = interaction.options.getString('player2') ?? ' - ';

		timeleft = interaction.options.getInteger('time');
		console.log(timeleft)

		var downloadTimer = setInterval(function(){
		if(timeleft <= 0){
			clearInterval(downloadTimer);
			// update interaction, disable/remove buttons and update embed with results
		} 
		else{
			console.log(timeleft);
		}
		timeleft -= 1;
		}, 1000);
		
		var oldDateObj = new Date();
		newDateObj = new Date(oldDateObj.getTime() + timeleft);
		

		const bet_embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle('Viper Voting')
		.addFields(
			{ name: 'Vote for who you think will win', value: 'Betting open'},
			{ name: '\u200B', value: '\u200B' },
			{ name: player1_string, value: 'Player 1', inline: true },
			{ name: 'VS', value: '\u200B', inline: true },
			{ name: player2_string, value: 'Player 2', inline: true },
			{ name: '\u200B', value: '\u200B' },
			{ name: 'Betting closes at ', value: newDateObj.toLocaleString() },
		)
        const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('btn_p1vote')
					.setLabel('Vote P1')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('btn_refresh')
					.setLabel('| Refresh |')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('btn_p2vote')
					.setLabel('Vote P2')
					.setStyle(ButtonStyle.Primary),
			);

        await interaction.reply({ embeds: [bet_embed], components: [row] });
	},
	async updatebet(interaction,player_option){
		
	console.log(timeleft)
		
	if(timeleft<=1)
	{
		//do closed display
		bet_calculate(player1_votes,player2_votes)
		console.log('Betting closed time is up!')
		var close_embed = embed_closed();	
		await interaction.update({ embeds: [close_embed]})
		return;
	}
	else{
			// add vote if still time remaining
			if(player_option==1){
				player1_votes++
				console.log('Vote for P1')
			}
			else if(player_option==2){
				player2_votes++
				console.log('Vote for P2')
			}
			else if(player_option==0){
				console.log('Refresh stats')
			}
			bet_calculate(player1_votes,player2_votes)
			// Update embed display
			var update_embed = new embed_placebet();

			await interaction.update({ embeds: [update_embed]})
			//await interaction.reply({ content: 'Thanks for voting!', ephemeral: true });
			
			
			
	}},
    
};
/*


var timeleft = 0
Time remaining calculator not used
var display_time_minutes = Math.floor(timeleft / 60);
			var display_time_seconds = timeleft - display_time_minutes * 60;
			var formatted_seconds = ("0" + display_time_seconds).slice(-2)
			var time_remaining_message = display_time_minutes.toString() + ' : ' + formatted_seconds;



*/