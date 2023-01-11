// Initialize dotenv
require('dotenv').config({path:__dirname+'/.env2'});

const fs = require('node:fs');
const path = require('node:path');
const { Users, CurrencyShop, AdminUsers } = require('./dbObjects.js')
const { Op } = require('sequelize')
const { Client, Collection, Events, GatewayIntentBits, IntentsBitField, ActionRowBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { updatebet } = require('./commands/vote.js');
const { updategamble, post_winner } = require('./commands/bet.js');
const myIntents = new IntentsBitField();
myIntents.add(IntentsBitField.Flags.GuildVoiceStates)
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, myIntents] });

const currency = new Collection();
const admins = new Collection();
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

var bet_submitted = []

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
client.once(Events.ClientReady, async () => {
	const storedBalances = await Users.findAll();
	storedBalances.forEach(b => currency.set(b.user_id, b));
	console.log('Loaded users and currency')
	const storedAdmins = await AdminUsers.findAll();
	storedAdmins.forEach(b => admins.set(b.user_id, b));
	console.log('Loaded priveledged user list')
	console.log('Bot loaded and online')
	coin_pay();
});

client.on(Events.InteractionCreate, async interaction => {
	// Command interactions
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);
	

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}
	if(interaction.commandName=='bet'){
		//place holder
		bet_submitted = []
	}
	else if (interaction.options.getSubcommand() === 'add_admin_user') {
		let user_id = interaction.options.getUser('target').id
	let serverMembers = client.guilds.cache.get(process.env.guildId).members;
	let matchedMember = serverMembers.cache.find(m => m.id === user_id);
		await interaction.reply({content: 'Added ' + matchedMember.displayName + ' to priveledged users.', ephemeral: true});
		admins.set(user_id,1)
	}
	else if (interaction.options.getSubcommand() === 'remove_admin_user'){
		let user_id = interaction.options.getUser('target').id
	let serverMembers = client.guilds.cache.get(process.env.guildId).members;
	let matchedMember = serverMembers.cache.find(m => m.id === user_id);
		await interaction.reply({content: 'Removed ' + matchedMember.displayName + ' from priveledged users.', ephemeral: true});
		admins.delete(user_id)
	}
	else if (interaction.options.getSubcommand() === 'setbalance'){
		let user_id = interaction.options.getUser('target').id
	let serverMembers = client.guilds.cache.get(process.env.guildId).members;
	let matchedMember = serverMembers.cache.find(m => m.id === user_id);
		let old_balance = getBalance(user_id);
		addBalance(user_id,old_balance*-1)
		let new_balance = interaction.options.getInteger('amount');
		addBalance(user_id,new_balance)
		await interaction.reply({content: 'Set ' + matchedMember.displayName + ' coin balance from ' + old_balance + ' to ' + new_balance, ephemeral: true});
	}
	else if (interaction.options.getSubcommand() === 'removeuser'){
		let user_id = interaction.options.getUser('target').id
	let serverMembers = client.guilds.cache.get(process.env.guildId).members;
	let matchedMember = serverMembers.cache.find(m => m.id === user_id);
		currency.delete(user_id);
		await interaction.reply({content: 'Removed ' + matchedMember.displayName + ' from currency database.', ephemeral: true});
	}
	try {

		await command.execute(interaction,client);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}

	
});
client.on(Events.InteractionCreate, async interaction => {
	// Button interactions
    if (!interaction.isButton()){ 
	return;
	}
	else if(interaction.isButton()){
		if(interaction.customId == 'btn_p1vote'){
			// Call function from vote.js to update player 1 vote
			try{
				interaction.user.id
				await updatebet(interaction,1,interaction.user.id);
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
		else if(interaction.customId == 'btn_p2vote'){
			// Call function from vote.js to update player 1 vote
			try{
				await updatebet(interaction,2,interaction.user.id);
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
		else if (interaction.customId === 'btn_p1bet') {
			if(bet_submitted.includes(interaction.user.id)){
				await interaction.reply({content: `Your bet has already been submitted.`, ephemeral: true});
			}
			else{
				const modal = new ModalBuilder()
					.setCustomId('modal_p1bet')
					.setTitle('Bet Amount')
					.addComponents([
					new ActionRowBuilder().addComponents(
					new TextInputBuilder()
						.setCustomId('bet_input')
						.setLabel('You have ' + getBalance(interaction.user.id) + ' coins to bet with.')
						.setStyle(TextInputStyle.Short)
						.setMinLength(1)
						.setMaxLength(6)
						.setPlaceholder('10')
						.setRequired(true),
					),
			]);
			
			await interaction.showModal(modal);
			}
		}
		else if (interaction.customId === 'btn_p2bet') {
			if(bet_submitted.includes(interaction.user.id)){
				await interaction.reply({content: `Your bet has already been submitted.`, ephemeral: true});
			}
			else{
				const modal = new ModalBuilder()
					.setCustomId('modal_p2bet')
					.setTitle('Bet Amount')
					.addComponents([
					new ActionRowBuilder().addComponents(
					new TextInputBuilder()
						.setCustomId('bet_input')
						.setLabel('You have ' + getBalance(interaction.user.id) + ' coins to bet with.')
						.setStyle(TextInputStyle.Short)
						.setMinLength(1)
						.setMaxLength(6)
						.setPlaceholder('10')
						.setRequired(true),
					),
			]);
			
			await interaction.showModal(modal);
			}
		}
		else if (interaction.customId === 'btn_draw_payout') {
			// Do a check for whether user has permission
			if (admins.includes(interaction.user.id)){
				// User has permission
				let id_dict = await post_winner(interaction,0);
				payout(id_dict);
			}
			else{
				await interaction.reply({content: `You don't have permission to call this payout.`, ephemeral: true});
			}
		}	
		else if (interaction.customId === 'btn_p1bet_payout') {
			// Do a check for whether user has permission
			
			if (admins.includes(interaction.user.id)){
				// User has permission
				let id_dict = await post_winner(interaction,1);
				payout(id_dict);
			}
			else{
				await interaction.reply({content: `You don't have permission to call this payout.`, ephemeral: true});
			}
		}
		else if (interaction.customId === 'btn_p2bet_payout') {
			// Do a check for whether user has permission
			if (admins.includes(interaction.user.id)){
				// User has permission
				let id_dict = await post_winner(interaction,2);
				payout(id_dict);
			}
			else{
				await interaction.reply({content: `You don't have permission to call this payout.`, ephemeral: true});
			}
		}
	}
	
  

	
	
});
client.on(Events.InteractionCreate, async interaction => {
	if (interaction.customId === 'modal_p1bet') {
		const user_current_balance = getBalance(interaction.user.id)
		const response = parseInt(interaction.fields.getTextInputValue('bet_input'));
		if(response <= 0){
			// Someones trying to break the system
			let newbalance =  + response;
			if(newbalance <= 0){
			newbalance = 0
			}
			addBalance(interaction.user.id, response)

			await interaction.reply({ content: `Putting a negative number is silly, so I have taken the coins from your balance. ENJOY`, ephemeral: true});

		}
		else if(response === user_current_balance || response <= user_current_balance){
			
			addBalance(interaction.user.id, -Math.abs(response))
			try{
				interaction.user.id
				await interaction.reply({ content: `You have submitted a bet for ${response}`, ephemeral: true});
				await updategamble(interaction,1,interaction.user.id,response);
				
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
			// Temp comment out single bet, for testing
			// bet_submitted.push(interaction.user.id);
		}
		else{
			await interaction.reply({ content: 'You don\'t have enough coins for that bet', ephemeral: true });
		}
	
	}
	else if (interaction.customId === 'modal_p2bet') {
		const user_current_balance = getBalance(interaction.user.id)
		const response = parseInt(interaction.fields.getTextInputValue('bet_input'));
		if(response <= 0){
			// Someones trying to break the system
			let newbalance =  + response;
			if(newbalance <= 0){
			newbalance = 0
			}
			addBalance(interaction.user.id, newbalance)

			await interaction.reply({ content: `Putting a negative number is silly, so I have taken the coins from your balance and you can try again.`, ephemeral: true});

		}
		else if(response === user_current_balance || response <= user_current_balance){
			addBalance(interaction.user.id, -Math.abs(response))
			try{
				interaction.user.id
				await interaction.reply({ content: `You have submitted a bet for ${response}`, ephemeral: true});
				await updategamble(interaction,2,interaction.user.id,response);
				
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
			// Temp comment out single bet, for testing
			// bet_submitted.push(interaction.user.id);
		}
		else{
			await interaction.reply({ content: 'You don\'t have enough coins for that bet', ephemeral: true });
		}
	
	}
})

async function payout(id_dict){
	for (let key in id_dict){
		let user_currency = currency.get(key);
		const user_object = client.users.fetch(key);
		if (user_currency) {
			user_currency.balance += Number(id_dict[key]);
			(await user_object).send('You won the prediction, and have been paid out a total of ' + id_dict[key])
			return user_currency.save();
		}
	}

}
async function addBalance(id, amount) {
	// Add currency

	try{
		const user = await currency.get(id)
		if (user) {
			user.balance += Number(amount);
			return user.save();
			
		}
	}
	catch{
		const newUser = await Users.create({ user_id: id, balance: amount + 200 });
		currency.set(id, newUser);

		return newUser;
	}
}

function getBalance(id) {
	const user = currency.get(id);
	console.log(user)
	if (user) {
		return user ? user.balance : 0;
	}
	
	else{
		const newUser = Users.create({ user_id: id, balance: 200 });
		currency.set(id, newUser.balance);
		return newUser ? newUser.balance : 0;
	}
	
}

// Set interval for people who are in array to receive coins
var coin_eligible =[]
async function coin_pay(){
	setInterval(async function(){
		coin_eligible.forEach(function (element){
			addBalance(element,5)
		})
		
	}, 5000);
}
client.on('voiceStateUpdate', (oldState, newState) => {
	// log the new channelid
	var channel_id = newState.channelId
	var member_id = newState.member.id

	// put it in a variable for cleanness
	if(channel_id == '1060524834691502125') {
		// Put user in eligible payments array
		coin_eligible.push(member_id)
		
	}
	else {
		// Cancel script
		coin_eligible.pop(member_id)
	}
});
// Log in to Discord with your client's token
client.login(process.env.CLIENT_TOKEN);