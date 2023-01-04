// Initialize dotenv
require('dotenv').config({path:__dirname+'/.env'});

const fs = require('node:fs');
const path = require('node:path');

const { Client, Collection, Events, GatewayIntentBits} = require('discord.js');
const { updatebet } = require('./commands/bet.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));


// Variables for battle
var player1
var player2
var winner
var bypercent
var battle_info_file

// Function for reading battleinfo from file
function get_battlefile(){
	battle_info_file = fs.readFileSync('./files/battle_info_file.json',
            {encoding:'utf8', flag:'r'});
	battle_info_file = JSON.parse(battle_info_file)

	console.log(battle_info_file.winner);

	return(battle_info_file);
}


for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);
	
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	// Set Bet timer if new bet is called
	if(interaction.commandName == 'bet'){
		var timeleft = interaction.options.getInteger('time');
		console.log(timeleft)

		var downloadTimer = setInterval(function(){
		if(timeleft <= -1){
			battle_info_file = get_battlefile()
			clearInterval(downloadTimer);
			console.log(battle_info_file.winner)
			var message_winner = 'Votes Closed! The favourite is ' + battle_info_file.winner + ' with ' + battle_info_file.bypercent + '% of the votes'
			client.channels.cache.get('1059748966616547371').send(message_winner)

		} 
		timeleft -= 1;
		}, 1000);
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()){ 
	return;
	}
	else if(interaction.isButton()){
		if(interaction.customId == 'btn_p1vote'){
			// Call function from bet.js to update player 1 vote
			try{
				await updatebet(interaction,1);
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
		else if(interaction.customId == 'btn_p2vote'){
			// Call function from bet.js to update player 1 vote
			try{
				await updatebet(interaction,2);
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
		else if(interaction.customId == 'btn_refresh'){
			try{
				await updatebet(interaction,0);
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
	}
});
// Log in to Discord with your client's token
client.login(process.env.CLIENT_TOKEN);