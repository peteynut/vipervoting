/* eslint-disable no-redeclare */
// Initialize dotenv
require('dotenv').config({path:__dirname+'/.env2'});
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js')
const sharp = require('sharp')
const fs = require('fs')
const downloadclient = require('https')
const cloudinary = require('cloudinary').v2

var player1_string
var player2_string
var player1_tagged = false
var player2_tagged = false
var player1_votes = 0
var player2_votes = 0
var player1_bets = 0
var player2_bets = 0
var total_bets = 0
var p1_return_ratio = 1
var p2_return_ratio = 1
var total_votes = 0
var p1_votes_taken = {}
var p2_votes_taken = {}
var payout_dict = {}
var winning_player = 0
var timeleft = 0
var p1_percent = 50
var p2_percent = 50
var favourite_player = "Draw"
var favourite_player_id
var voters
var embed_spacer = "\u200B"
var update_embed
const embed_colour = 'DarkGreen'
var p1_vote_display = ''
var p2_vote_display = ''
var base_path = './files/'
var battle_pic = base_path + 'battle_pic.webp'
var battle_pic_p1 = base_path + 'p1_default.webp'
var battle_pic_p2 = base_path + 'p2_default.webp'
var battle_pic_background = base_path + 'battle_background.webp'
// internal toggle for turning on or off the slider bar
var gambleting_bar = false
var attachment_file_url = 'http://res.cloudinary.com/dgipqso5p/image/upload/v1672971542/battle_pic.webp'
var image_uploaded = false
let image_file_urls = []
var main_bet_interaction


cloudinary.config({
	secure: true
})

const uploadImage = async (imagePath,options) => {

    // Use the uploaded file's name as the asset's public ID and 
    // allow overwriting the asset with new versions
    try {
      // Upload the image
    const result = await cloudinary.uploader.upload(imagePath, options);
		attachment_file_url = result.secure_url
		image_file_urls[0] = result.secure_url
      return result.secure_url;
    } catch (error) {
      console.error(error);
    }
};
const uploadfinal_Image = async (imagePath,options,pid) => {

    // Use the uploaded file's name as the asset's public ID and 
    // allow overwriting the asset with new versions
try {
      // Upload the image
	const result = await cloudinary.uploader.upload(imagePath, options);
		
	image_file_urls[pid] = result.secure_url
		
      return result.secure_url;
} catch (error) {
      console.error(error);
}
};

function gamble_calculate (p1,p2){
	let total_bet_amount = p1 + p2
	if(total_bet_amount == 0){
		total_bet_amount = 2
		p1 = 1
		p2 = 1
		p1_percent = p1 / total_bet_amount * 100;
		p2_percent = p2 / total_bet_amount * 100;
		p1_return_ratio = 1
		p2_return_ratio = 1
		return(p1_percent,p2_percent);
	}

	p1_return_ratio = (total_bet_amount / p1).toFixed(2)
	p2_return_ratio = (total_bet_amount / p2).toFixed(2);
	p1_percent = p1 / total_bet_amount * 100;
	p2_percent = p2 / total_bet_amount * 100;
	p1_vote_display = '';

	// Legacy, dynamic bar display of bet percentage
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

	if(p1_percent <= p2_percent){
		favourite_player = player2_string
		favourite_player_id = 2
	}
	else if(p2_percent <= p1_percent){
		favourite_player = player1_string
		favourite_player_id = 1
	}
	return(p1_percent,p2_percent);
}

// Embed builder for showing winner
function embed_payout(){
	// Legacy percentage bar if clause
	if(gambleting_bar == true){
		var p1_embed_string = parseFloat(p1_percent).toFixed(2) + '% \n' + p1_vote_display + '\n|-------------|'
		var p2_embed_string = parseFloat(p2_percent).toFixed(2) + '% \n' + p2_vote_display + '\n|-------------|'
	}
	else{
		var p1_embed_string = parseFloat(p1_percent).toFixed(2) + '%' + '\nTotal Bets: ' + player1_bets.toString() + '\nOdds: ' + p1_return_ratio.toString() + '\nCount: ' + player1_votes.toString()
		var p2_embed_string = parseFloat(p2_percent).toFixed(2) + '%' + '\nTotal Bets: ' + player2_bets.toString() + '\nOdds: ' + p2_return_ratio.toString() + '\nCount: ' + player2_votes.toString()
	}
	var return_rate = 'bets failed'
	if(winning_player === 0){
		return_rate = 'bets returned due to draw'
	}
	else if(winning_player === 1){
		return_rate = p1_return_ratio + ' to 1'
		favourite_player = player1_string
		favourite_player_id = 1
	}
	else if(winning_player === 2){
		return_rate = p2_return_ratio + ' to 1'
		favourite_player = player2_string
		favourite_player_id = 2
	}
	var close_embed = new EmbedBuilder()
	.setColor(embed_colour)
	.setTitle('Bets Paid Out')
	.setImage(image_file_urls[favourite_player_id])
	.addFields(
		{ name: player1_string, value: p1_embed_string, inline: true },
		{ name: '\u200B', value: embed_spacer, inline: true },
		{ name: player2_string, value: p2_embed_string, inline: true },
		{ name: '\u200B', value: '\u200B' },
		{ name: 'The winner is:  ', value: favourite_player + ' paid out at a return of ' + return_rate},
		{ name: '\u200B', value: '\u200B' })
		return(close_embed);
		
}

// Embed builder for bets closed
function embed_closed(){
	make_battle_pic()
	if(gambleting_bar == true){
		var p1_embed_string = parseFloat(p1_percent).toFixed(2) + '% \n' + p1_vote_display + '\n|-------------|'
		var p2_embed_string = parseFloat(p2_percent).toFixed(2) + '% \n' + p2_vote_display + '\n|-------------|'
	}
	else{
		var p1_embed_string = parseFloat(p1_percent).toFixed(2) + '%' + '\nTotal Bets: ' + player1_bets.toString() + '\nOdds: ' + p1_return_ratio.toString() + '\nCount: ' + player1_votes.toString()
		var p2_embed_string = parseFloat(p2_percent).toFixed(2) + '%' + '\nTotal Bets: ' + player2_bets.toString() + '\nOdds: ' + p2_return_ratio.toString() + '\nCount: ' + player2_votes.toString()
	}
	var update_embed = new EmbedBuilder()
	.setColor(embed_colour)
	.setTitle('Bets Closed')
	.addFields(
	{ name: 'Total bets: ', value: total_bets.toString()},
	{ name: '\u200B', value: '\u200B' },
	{ name: player1_string, value: p1_embed_string, inline: true },
	{ name: '\u200B', value: embed_spacer, inline: true },
	{ name: player2_string, value: p2_embed_string, inline: true }
	)
	.setImage(attachment_file_url)
	return(update_embed)
}

// Embed builder for voting in progress
function embed_update(){
	make_battle_pic()
	// gambleting bar lol (find and replace artifact), deprecated idea left in for future retweaking if can be bothered
	if(gambleting_bar == true){
		var p1_embed_string = parseFloat(p1_percent).toFixed(2) + '% \n' + p1_vote_display + '\n|-------------|'
		var p2_embed_string = parseFloat(p2_percent).toFixed(2) + '% \n' + p2_vote_display + '\n|-------------|'
	}
	else{
		var p1_embed_string = parseFloat(p1_percent).toFixed(2) + '%' + '\nTotal Bets: ' + player1_bets.toString() + '\nOdds: ' + p1_return_ratio.toString() + '\nCount: ' + player1_votes.toString()
		var p2_embed_string = parseFloat(p2_percent).toFixed(2) + '%' + '\nTotal Bets: ' + player2_bets.toString() + '\nOdds: ' + p2_return_ratio.toString() + '\nCount: ' + player2_votes.toString()
	}
	var update_embed = new EmbedBuilder()
	.setColor(embed_colour)
	.setTitle('Voting in Progress')
	.addFields(
	{ name: 'Time remaining ', value: timeleft.toString() + ' seconds'},
	{ name: 'Total amount bet: ', value: total_bets.toString()},
	{ name: '\u200B', value: '\u200B' },
	{ name: player1_string, value: p1_embed_string, inline: true },
	{ name: '\u200B', value: embed_spacer, inline: true },
	{ name: player2_string, value: p2_embed_string, inline: true }
	)
	.setImage(attachment_file_url)
	return(update_embed)
}
// Embed builder for pre voting
function embed_pregamble(){
	const gamble_embed = new EmbedBuilder()
	.setColor(embed_colour)
	.setTitle('VOTE NOW')
	.addFields(
		{ name: 'Bet for who you think will win', value: 'betting open'},
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Time remaining ', value: timeleft.toString() + ' seconds'},
		{ name: '\u200B', value: '\u200B' },
		{ name: player1_string, value: 'Bet Now', inline: true },
		{ name: '\u200B', value: embed_spacer, inline: true },
		{ name: player2_string, value: 'Bet Now', inline: true },
		
	)
	.setImage(attachment_file_url)
	return(gamble_embed)
}

function close_gambles(interaction){
	update_embed = embed_closed();
	const closed_row = new ActionRowBuilder()
	.addComponents(
		new ButtonBuilder()
			.setCustomId('btn_p1bet_payout')
			.setLabel(player1_string + ' + Payout')
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId('btn_draw_payout')
			.setLabel('| ----DRAW---- |')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('btn_p2bet_payout')
			.setLabel(player2_string + ' + Payout')
			.setStyle(ButtonStyle.Danger),
	);
	interaction.editReply({ embeds: [update_embed], components: [closed_row]})
	// update interaction, disable/remove buttons and update embed with results
}

function update_gambles(interaction){

	if(total_votes == 0){
		update_embed = embed_pregamble();
	}
	else{
		update_embed = embed_update();
	}
	interaction.editReply({ embeds: [update_embed]})
}

async function make_battle_pic(){
	try {
		sharp.cache(false);
		if(player1_tagged == false){
			battle_pic_p1 = base_path + 'p1_default.webp'
		}
		if(player2_tagged==false){
			battle_pic_p2 = base_path + 'p2_default.webp'
		}
		await sharp(battle_pic_background)
		.composite([{ input: battle_pic_p1, gravity: 'northwest'}, { input: battle_pic_p2, gravity: 'northeast'}])
		.toFile(base_path + 'battle_pic.webp')
	}
	catch(error){
		console.log(error);
	}
	var file_string = player1_string + player2_string + 'battle'
	file_string = file_string.replace(/\s+/g, '');
	var options = {
		public_id: file_string,
		unique_filename: true,
		overwrite: true,
	};
	if(image_uploaded==false){
		
		uploadImage(battle_pic,options)
		.then(result=>result.secure_url)
		image_uploaded=true
		
	}
	
}
async function upload_pics(){
	
	
	var file_string = player1_string + 'battle'
	file_string = file_string.replace(/\s+/g, '');
	var options = {
		public_id: file_string,
		unique_filename: true,
		overwrite: true,
	};
	uploadfinal_Image(battle_pic_p1,options,1)
	.then()


	var file_string = player2_string + 'battle'
	file_string = file_string.replace(/\s+/g, '');
	var options = {
		public_id: file_string,
		unique_filename: true,
		overwrite: true,
	};
	uploadfinal_Image(battle_pic_p2,options,2)
	.then()
	
}
function download_battle_pic(avatar_url,filepath){
	return new Promise((resolve, reject) =>{
		downloadclient.get(avatar_url,(res) => {
			if (res.statusCode === 200){
				res.pipe(fs.createWriteStream(filepath));
			}
			else {
				// Consume response data to free up memory
				res.resume();
				reject(new Error('Request failed with a status code: ${res.statusCode}'));
			}
		})
	})
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bet')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescription('Start gamble for a battle')
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
		
		

	async execute(interaction,client) {
		// Reset global variables for new bet
		main_bet_interaction = interaction
		voters = []
		image_file_urls = []
		attachment_file_url = 'http://res.cloudinary.com/dgipqso5p/image/upload/v1672971542/battle_pic.webp'
		player1_votes = 0
		player2_votes = 0
		total_bets = 0
		player1_bets = 0
		player2_bets = 0
		p1_votes_taken = []
		p2_votes_taken = []
		player1_tagged = false
		player2_tagged = false
		favourite_player = 'Draw'
		favourite_player_id = 0
		player1_string = interaction.options.getString('player1') ?? ' - ';
		player2_string = interaction.options.getString('player2') ?? ' - ';
		battle_pic_p1 = base_path + 'p1_default.webp'
		battle_pic_p2 = base_path + 'p2_default.webp'
		image_uploaded = false
		
		if(interaction.options.getString('player1').startsWith('<@')){
			// is a user id, user was tagged in input
			player1_tagged = true;
			player1_string = interaction.options.getString('player1');
			var end_bound = player1_string.length - 1;
			player1_string = player1_string.substring(2,end_bound);

			let serverMembers = client.guilds.cache.get(process.env.guildId).members;
			let matchedMember = serverMembers.cache.find(m => m.id === player1_string);
			
			battle_pic_p1 = base_path + player1_string + '.webp'
			if (matchedMember.user.avatarURL() === null){
				// NO avatar pic
				player1_tagged = false

			}
			else{
				download_battle_pic(matchedMember.user.avatarURL(),base_path + player1_string + '.webp')
			}
			// Get user object, then define variable with username
			player1_string = matchedMember.displayName;
			// pull user avatar and create image file
		}
		if(interaction.options.getString('player2').startsWith('<@')){
			// is a user id, user was tagged in input
			player2_tagged = true
			player2_string = interaction.options.getString('player2');
			var end_bound = player2_string.length - 1;
			player2_string = player2_string.substring(2,end_bound);

			let serverMembers = client.guilds.cache.get(process.env.guildId).members;
			let matchedMember = serverMembers.cache.find(m => m.id === player2_string);
			
			battle_pic_p2 = base_path + player2_string + '.webp'

			if (matchedMember.user.avatarURL() === null){
				// NO avatar pic
				player2_tagged = false

			}
			else{
				download_battle_pic(matchedMember.user.avatarURL(),base_path + player2_string + '.webp')
			}
			// Get user object, then define variable with username
			player2_string = matchedMember.displayName;
			// pull user avatar and create image file
		}
		make_battle_pic()
		upload_pics()
		gamble_calculate(player1_bets,player2_bets);
		timeleft = interaction.options.getInteger('time');

		var downloadTimer = setInterval(function(){
		if(timeleft <= 0){
			clearInterval(downloadTimer);
			close_gambles(interaction);
		} 
		else if(timeleft <= (interaction.options.getInteger('time')-1)){
			// Update embed for timer, check if votes counted for different displays
			total_votes = player1_votes + player2_votes;
			update_gambles(interaction);
		}
		timeleft -= 1;
		}, 1000);
		
		
		
		const gamble_embed = embed_pregamble();

        const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('btn_p1bet')
					.setLabel('Vote ' + player1_string)
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('btn_refresh')
					.setLabel('| ------------ |')
					.setDisabled(true)
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('btn_p2bet')
					.setLabel('Vote ' + player2_string)
					.setStyle(ButtonStyle.Danger),
			);

        await interaction.reply({ embeds: [gamble_embed], components: [row]});
	},
	async updategamble(interaction,player_option,user_id,bet_amount){
	// Check if user has bet before
	if(voters.includes(user_id)){
		// Send ephemereal reply noting that vote already cast
		await interaction.reply({content: 'You have already cast a vote in this battle', ephemeral: true})
		return;
	}
	else{
		if(timeleft<=1)
		{
			//do closed display
			gamble_calculate(player1_bets,player2_bets)
			return;
		}
		else{
			// add vote if still time remaining
			if(player_option==1){
				player1_votes++
				p1_votes_taken[user_id] = bet_amount
				player1_bets += bet_amount
				total_bets += bet_amount
			}
			else if(player_option==2){
				player2_votes++
				p2_votes_taken[user_id] = bet_amount
				player2_bets += bet_amount
				total_bets += bet_amount
			}
			gamble_calculate(player1_bets,player2_bets,)

			// Update embed display
			//update_embed = new embed_update();
			//await interaction.editReply({ embeds: [update_embed]})
				
		}
	}
	},
	async post_winner(interaction,winner_option,) {
		winning_player = winner_option
		if(winner_option === 0){
			// Was a draw, return bets
			for(let bet in p1_votes_taken){
				payout_dict[bet] = p1_votes_taken[bet]
			}
			for(let bet in p2_votes_taken){
				payout_dict[bet] = p2_votes_taken[bet]
			}
		}
		else if(winner_option === 1){
			// Payout all player 1 bets
			for(let bet in p1_votes_taken){
				let payout = total_bets * (p1_votes_taken[bet] / player1_bets)
				payout_dict[bet] = payout
			}
		}
		else if(winner_option === 2){
			// Payout all player 2 bets
			for(let bet in p2_votes_taken){
				let payout = total_bets * (p2_votes_taken[bet] / player2_bets)
				payout_dict[bet] = payout
			}
		}
		const payout_embed = embed_payout()
        const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('btn_disabled')
					.setLabel('| ------------ |')
					.setDisabled(true)
					.setStyle(ButtonStyle.Secondary),
			);
        await main_bet_interaction.editReply({ embeds: [payout_embed], components: [row]});
		await interaction.reply({content: 'Paid out bets.'})
		return(payout_dict)
	}
    
};