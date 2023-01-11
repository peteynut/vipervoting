const { client, currency } = require('discord-bot.js');
const { Client, Collection, Events, GatewayIntentBits, IntentsBitField, ActionRowBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { Users, CurrencyShop } = require('./dbObjects.js')


client.once(Events.ClientReady, async () => {
	console.log('Starting payment interval')
	const storedBalances = await Users.findAll();
	storedBalances.forEach(b => currency.set(b.user_id, b));
	coin_pay();
});

var coin_eligible =[]
async function coin_pay(){
	setInterval(async function(){
		coin_eligible.forEach(function (element){
			addBalance(element,5)
			console.log(getBalance(element))
		})
		
	}, 5000);
}
async function addBalance(id, amount) {
	// Add currency
	const user = currency.get(id);

	if (user) {
		user.balance += Number(amount);
		return user.save();
	}

	const newUser = await Users.create({ user_id: id, balance: amount + 200 });
	currency.set(id, newUser);

	return newUser;
}

function getBalance(id) {
	const user = currency.get(id);
	
	return user ? user.balance : 0;
}
client.on(Events.InteractionCreate, async interaction => {
	if (interaction.customId === 'modal_p1bet') {
		const user_current_balance = getBalance(interaction.user.id)
		const response = parseInt(interaction.fields.getTextInputValue('bet_input'));
		if(response <= 0){
			// Someones trying to break the system
			var newbalance =  + response;
			console.log(newbalance)
			if(newbalance <= 0){
			newbalance = 0
			console.log(newbalance)
			}
			addBalance(interaction.user.id, response)

			await interaction.reply(`Putting a negative number is silly, so I have taken the coins from your balance. ENJOY`);

	}
	else if(response === user_current_balance || response <= user_current_balance){
		await interaction.reply(`You have submitted a bet for ${response}`);
			addBalance(interaction.user.id, -Math.abs(response))
	}
	else{
		await interaction.reply(`You don't have enough coins for that bet`);
	}
		
	}
})