/* eslint-disable no-redeclare */
// Initialize dotenv
require('dotenv').config({path:__dirname+'/.env2'});
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder } = require('discord.js')
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
var total_votes = 0
var timeleft = 0
var p1_percent = 0
var p2_percent = 0
var winning_player = "Draw"
var winning_player_id
// eslint-disable-next-line no-unused-vars
var winning_percentage = "50"
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
var betting_bar = false
var attachment_file_url = 'http://res.cloudinary.com/dgipqso5p/image/upload/v1672971542/battle_pic.webp'
var image_uploaded = false
let image_file_urls = []


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

console.log(cloudinary.config())

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
		winning_player_id = 0
	}
	else if(p1_percent <= p2_percent){
		winning_player = player2_string
		winning_player_id = 2
		winning_percentage = p2_percent
	}
	else if(p2_percent <= p1_percent){
		winning_player = player1_string
		winning_player_id = 1
		winning_percentage = p1_percent
	}
	return(p1_percent,p2_percent);
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
	.setImage(image_file_urls[winning_player_id])
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
	make_battle_pic()
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
	{ name: '\u200B', value: '\u200B' },
	{ name: 'Time remaining ', value: timeleft.toString() + ' seconds'},
	{ name: 'Total Bets: ', value: total_votes.toString()},
	{ name: '\u200B', value: '\u200B' },
	{ name: player1_string, value: p1_embed_string, inline: true },
	{ name: '\u200B', value: embed_spacer, inline: true },
	{ name: player2_string, value: p2_embed_string, inline: true }
	)
	.setImage(attachment_file_url)
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
		{ name: 'Time remaining ', value: timeleft.toString() + ' seconds'},
		{ name: '\u200B', value: '\u200B' },
		{ name: player1_string, value: 'Vote Now', inline: true },
		{ name: '\u200B', value: embed_spacer, inline: true },
		{ name: player2_string, value: 'Vote Now', inline: true },
		
	)
	.setImage(attachment_file_url)
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
			.setLabel('| ------------ |')
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
		

	async execute(interaction,client) {
		voters = []
		image_file_urls = []
		player1_votes = 0
		player2_votes = 0
		player1_tagged = false
		player2_tagged = false
		winning_player = 'Draw'
		winning_percentage = 50
		winning_player_id = 0
		player1_string = interaction.options.getString('player1') ?? ' - ';
		player2_string = interaction.options.getString('player2') ?? ' - ';
		battle_pic_p1 = base_path + 'p1_default.webp'
		battle_pic_p2 = base_path + 'p2_default.webp'
		image_uploaded = false
		
		if(interaction.options.getString('player1').startsWith('<@')){
			// is a user id, user was tagged in input
			player1_tagged = true
			player1_string = interaction.options.getString('player1');
			var end_bound = player1_string.length - 1;
			player1_string = player1_string.substring(2,end_bound);

			let serverMembers = client.guilds.cache.get(process.env.guildId).members;
			let matchedMember = serverMembers.cache.find(m => m.id === player1_string);
			
			battle_pic_p1 = base_path + player1_string + '.webp'

			download_battle_pic(matchedMember.user.avatarURL(),base_path + player1_string + '.webp')
			.then(make_battle_pic())
			.catch(console.error)		
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

			download_battle_pic(matchedMember.user.avatarURL(),base_path + player2_string + '.webp')
			.then(make_battle_pic())
			.catch(console.error)		
			// Get user object, then define variable with username
			player2_string = matchedMember.displayName;
			// pull user avatar and create image file
		}
		make_battle_pic()
		upload_pics()
		bet_calculate(player1_votes,player2_votes);
		timeleft = interaction.options.getInteger('time');

		var downloadTimer = setInterval(function(){
		if(timeleft <= 0){
			clearInterval(downloadTimer);
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
					.setLabel('| ------------ |')
					.setDisabled(true)
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('btn_p2vote')
					.setLabel('Vote ' + player2_string)
					.setStyle(ButtonStyle.Danger),
			);

        await interaction.reply({ embeds: [bet_embed], components: [row]});
	},
	async updatebet(interaction,player_option,user_id){
	
	// Check if user has voted before
	if(voters.includes(user_id)){
		// Send ephemereal reply noting that vote already cast
		await interaction.reply({content: 'You have already cast a vote in this battle', ephemeral: true})
		return;
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
