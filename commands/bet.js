const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const fs = require('fs');

var player1_string = 'Player 1'
var player2_string = 'Player 2'
var player1_votes = 0
var player2_votes = 0
var total_votes = 0
var timeleft = 0
var p1_percent = 0
var p2_percent = 0
var winning_player = "Draw"
var winning_percentage = "50"
var voters
var battle_info_file ={
	"player1": 'Player 1',
	"player2": 'Player 2',
	"winner": 'Draw',
	"bypercent": 50,}
var bets_open = false
var embed_spacer = "|-----VS-----|"
var update_embed
const embed_colour = 'DarkGreen'
var p1_vote_display = ''
var p2_vote_display = ''
var embed_width_image = 'https://i.ibb.co/b7Hxj7t/500x1-00000000.png'


// internal toggle for turning on or off the slider bar
var betting_bar = false

function bet_calculate (p1,p2){
	var total_percent = p1 + p2
	if(total_percent == 0){
		total_percent = 2
		p1 = 1
		p2 = 1
	}
	
	p1_percent = p1 / total_percent * 100;
	p2_percent = p2 / total_percent * 100;
	p1_vote_display = '';
	for(let i= 1;i <= Math.floor(p1_percent/10);i++){
		p1_vote_display+='0'
	}
	for(let i= 1;i <= (10-Math.floor(p1_percent/10));i++){
		p1_vote_display+=''
	}
	p2_vote_display = ''
	for(let i= 1;i <= Math.floor(p2_percent/10);i++){
		p2_vote_display+='0'
	}
	for(let i= 1;i <= (10-Math.floor(p2_percent/10));i++){
		p2_vote_display+=''
	}

	if(p1_percent == p2_percent){
		winning_player = "Draw"
		winning_percentage = 50
	}
	else if(p1_percent <= p2_percent){
		winning_player = player2_string
		winning_percentage = p2_percent
	}
	else if(p2_percent <= p1_percent){
		winning_player = player1_string
		winning_percentage = p1_percent
	}
	update_battlefile();
	return(p1_percent,p2_percent);
}

// Function for writing battle info to json file
function update_battlefile(){
	battle_info_file = {
		"player1": player1_string,
		"player2": player2_string,
		"winner": winning_player,
		"bypercent": parseFloat(winning_percentage).toFixed(2),
	}
	
	fs.writeFile('./files/battle_info_file.json',JSON.stringify(battle_info_file),'utf8',function (err) {
		if (err) {
			console.log("An error occured while writing JSON Object to File.");
			return console.log(err);
		}
	});
}

// Embed builder for votes closed
function embed_closed(){
	if(betting_bar == true){
		var p1_embed_string = parseFloat(p1_percent).toFixed(2) + '% \n' + p1_vote_display + '\n|-------------|'
		var p2_embed_string = parseFloat(p2_percent).toFixed(2) + '% \n' + p2_vote_display + '\n|-------------|'
	}
	else{
		var p1_embed_string = parseFloat(p1_percent).toFixed(2) + '%'
		var p2_embed_string = parseFloat(p2_percent).toFixed(2) + '%'
	}
	var close_embed = new EmbedBuilder()
	.setColor(embed_colour)
	.setTitle('Vote Closed')
	//.setImage(embed_width_image)
	.addFields(
		{ name: player1_string, value: p1_embed_string, inline: true },
		{ name: '\u200B', value: embed_spacer, inline: true },
		{ name: player2_string, value: p2_embed_string, inline: true },
		{ name: '\u200B', value: '\u200B' },
		{ name: 'The favourite is:  ', value: winning_player},
		{ name: '\u200B', value: '\u200B' })
		return(close_embed);
		
}

// Embed builder for voting in progress
function embed_update(){
	total_votes = player1_votes + player2_votes;
	if(betting_bar == true){
		var p1_embed_string = parseFloat(p1_percent).toFixed(2) + '% \n' + p1_vote_display + '\n|-------------|'
		var p2_embed_string = parseFloat(p2_percent).toFixed(2) + '% \n' + p2_vote_display + '\n|-------------|'
	}
	else{
		var p1_embed_string = parseFloat(p1_percent).toFixed(2) + '%'
		var p2_embed_string = parseFloat(p2_percent).toFixed(2) + '%'
	}
	var update_embed = new EmbedBuilder()
	.setColor(embed_colour)
	.setTitle('Voting in Progress')
	.addFields(
	{ name: '\u200B', value: 'Betting open'},
	{ name: player1_string, value: p1_embed_string, inline: true },
	{ name: '\u200B', value: embed_spacer, inline: true },
	{ name: player2_string, value: p2_embed_string, inline: true },
	{ name: '\u200B', value: '\u200B' },
	{ name: 'Total Bets: ', value: total_votes.toString()},
	{ name: '\u200B', value: '\u200B' },
	{ name: 'Time remaining ', value: timeleft.toString() + ' seconds'})
	//.setImage(embed_width_image)
	return(update_embed)
}
// Embed builder for pre voting
function embed_prebet(){
	const bet_embed = new EmbedBuilder()
	.setColor(embed_colour)
	.setTitle('VOTE NOW')
	.addFields(
		{ name: 'Vote for who you think will win', value: 'Betting open'},
		{ name: '\u200B', value: '\u200B' },
		{ name: player1_string, value: 'Vote Now', inline: true },
		{ name: '\u200B', value: embed_spacer, inline: true },
		{ name: player2_string, value: 'Vote Now', inline: true },
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Time remaining ', value: timeleft.toString() + ' seconds'},
	)
	//.setImage(embed_width_image)
	return(bet_embed)
}

function close_bets(interaction){
	update_embed = embed_closed();
	const closed_row = new ActionRowBuilder()
	.addComponents(
		new ButtonBuilder()
			.setCustomId('btn_p1vote')
			.setLabel(player1_string)
			.setDisabled(true)
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId('btn_refresh')
			.setLabel('| ----- |')
			.setDisabled(true)
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('btn_p2vote')
			.setLabel(player2_string)
			.setDisabled(true)
			.setStyle(ButtonStyle.Danger),
	);
	interaction.editReply({ embeds: [update_embed], components: [closed_row]})
	// update interaction, disable/remove buttons and update embed with results
}

function update_bets(interaction){

	if(total_votes == 0){
		update_embed = embed_prebet();
	}
	else{
		update_embed = embed_update();
	}
	interaction.editReply({ embeds: [update_embed]})
}
module.exports = {
	data: new SlashCommandBuilder()
		.setName('bet')
		.setDefaultMemberPermissions(0)
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
		voters = []
		bets_open = true
		player1_votes = 0
		player2_votes = 0
		winning_player = 'Draw'
		winning_percentage = 50
		player1_string = interaction.options.getString('player1') ?? ' - ';
		player2_string = interaction.options.getString('player2') ?? ' - ';
		bet_calculate(player1_votes,player2_votes);
		timeleft = interaction.options.getInteger('time');
		update_battlefile();

		var downloadTimer = setInterval(function(){
		if(timeleft <= 0){
			clearInterval(downloadTimer);
			bets_open = false
			close_bets(interaction);
		} 
		else if(timeleft <= (interaction.options.getInteger('time')-1)){
			// Update embed for timer, check if votes counted for different displays
			total_votes = player1_votes + player2_votes;
			update_bets(interaction);
		}
		timeleft -= 1;
		}, 1000);
		
		

		const bet_embed = embed_prebet();

        const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('btn_p1vote')
					.setLabel('Vote ' + player1_string)
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('btn_refresh')
					.setLabel('| ----- |')
					.setDisabled(true)
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('btn_p2vote')
					.setLabel('Vote ' + player2_string)
					.setStyle(ButtonStyle.Danger),
			);

        await interaction.reply({ embeds: [bet_embed], components: [row] });
	},
	async updatebet(interaction,player_option,user_id){
	
	// Check if user has voted before
	if(voters.includes(user_id)){
		
		// Check for refresh button
		if (player_option == 0){
			bet_calculate(player1_votes,player2_votes)
			update_embed = new embed_update();
			await interaction.update({ embeds: [update_embed]})
			return;
		}
		else{
			// Send ephemereal reply noting that vote already cast
			await interaction.reply({content: 'You have already cast a vote in this battle', ephemeral: true})
			return;
		}

	}
	else{
		// Add user id to list of voters then continue (temp disabled)
		voters.push(user_id);

		if(timeleft<=1)
		{
		//do closed display
		bet_calculate(player1_votes,player2_votes)
		var close_embed = embed_closed();	
		await interaction.update({ embeds: [close_embed]})
		return;
		}
		else{
			// add vote if still time remaining
			if(player_option==1){
				player1_votes++
			}
			else if(player_option==2){
				player2_votes++
			}
			bet_calculate(player1_votes,player2_votes)
			// Update embed display
			update_embed = new embed_update();
			await interaction.update({ embeds: [update_embed]})
				
		}
	}
	},
    
};
/*


var timeleft = 0
Time remaining calculator not used
var display_time_minutes = Math.floor(timeleft / 60);
			var display_time_seconds = timeleft - display_time_minutes * 60;
			var formatted_seconds = ("0" + display_time_seconds).slice(-2)
			var time_remaining_message = display_time_minutes.toString() + ' : ' + formatted_seconds;



*/