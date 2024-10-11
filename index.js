require('dotenv').config();  // Load environment variables from .env
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');

const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN);

// Wallet addresses from .env
const PAYMENT_WALLETS = {
  SOL: process.env.SOL_WALLET,
  ETH: process.env.ETH_WALLET,
  TON: process.env.TON_WALLET,
  SUI: process.env.SUI_WALLET
};

const app = express();
app.use(bodyParser.json());

const url = process.env.RENDER_EXTERNAL_URL;
const port = process.env.PORT || 3000;

bot.setWebHook(`${url}/bot${process.env.TELEGRAM_API_TOKEN}`);

app.post(`/bot${process.env.TELEGRAM_API_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

let usersData = {}; // To store user data temporarily
let referrals = {}; // To track referrals and balances

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || chatId;

  // Check if this user was referred by someone
  if (msg.text.includes('start=')) {
    const referrer = msg.text.split('=')[1];
    if (!referrals[referrer]) {
      referrals[referrer] = { count: 0, balance: 0, referredUsers: [] };
    }
    referrals[referrer].count += 1;
    referrals[referrer].balance += 0.01;  // Simulate balance increase for each referral
    referrals[referrer].referredUsers.push(username);
    bot.sendMessage(referrer, `You just referred a new user! Total referrals: ${referrals[referrer].count}. Your balance: ${referrals[referrer].balance.toFixed(2)} SOL.`);
  }

  usersData[chatId] = { blockchain: null, contractAddress: null, service: null, token: null, username: username }; // Reset user data

  // Send welcome message with service options
  bot.sendMessage(chatId, 'Welcome to the Volume Boost Simulation Bot! Please choose a service:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚀 Start Bumping', callback_data: 'bump' }],
        [{ text: '📈 Buy Volume Boost', callback_data: 'volume' }],
        [{ text: '🔄 Buy Transaction Boost', callback_data: 'transaction' }],
        [{ text: '👥 Referral Program', callback_data: 'referral' }]
      ]
    }
  });
});

// Handle service selection and ask for blockchain
bot.on('callback_query', (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const data = callbackQuery.data;

  if (['bump', 'volume', 'transaction'].includes(data)) {
    usersData[chatId].service = data;
    bot.sendMessage(chatId, 'Please select the blockchain for your project:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'TON', callback_data: 'blockchain_ton' }],
          [{ text: 'Ethereum (ETH)', callback_data: 'blockchain_eth' }],
          [{ text: 'Solana (SOL)', callback_data: 'blockchain_sol' }],
          [{ text: 'Sui (SUI)', callback_data: 'blockchain_sui' }]
        ]
      }
    });
  }

  // Store the user's blockchain selection and ask for contract address
  if (data.startsWith('blockchain_')) {
    const blockchain = data.split('_')[1]; // Extract blockchain (ton, eth, sol, sui)
    usersData[chatId].blockchain = blockchain;
    bot.sendMessage(chatId, `You selected ${blockchain.toUpperCase()}. Now, please enter your project contract address.`);
  }

  // Simulate referral program
  if (data === 'referral') {
    const username = usersData[chatId].username;
    bot.sendMessage(chatId, `Share this referral link to earn rewards: https://t.me/YourBot?start=${username}`);
    if (referrals[username]) {
      bot.sendMessage(chatId, `You have referred ${referrals[username].count} users! Your balance is ${referrals[username].balance.toFixed(2)} SOL.`);
    } else {
      bot.sendMessage(chatId, 'You have not referred any users yet.');
    }
  }
});

// Handle Contract Address input
bot.onText(/^[a-zA-Z0-9]{20,}$/, (msg) => {
  const chatId = msg.chat.id;

  if (usersData[chatId].blockchain) {
    const contractAddress = msg.text;
    usersData[chatId].contractAddress = contractAddress;
    bot.sendMessage(chatId, `Verifying contract address ${contractAddress} on ${usersData[chatId].blockchain.toUpperCase()}...`);

    // Simulate contract validation
    setTimeout(() => {
      bot.sendMessage(chatId, `Contract ${contractAddress} has been successfully verified! Please select the duration of the boost:`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '1 Day - 0.5 SOL', callback_data: 'duration_1_day' }],
            [{ text: '7 Days - 2 SOL', callback_data: 'duration_7_days' }],
            [{ text: '30 Days - 5 SOL', callback_data: 'duration_30_days' }]
          ]
        }
      });
    }, 2000); // Simulate delay
  }
});

// Handle Payment and Confirmation
bot.on('callback_query', (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const data = callbackQuery.data;

  if (data.startsWith('duration_')) {
    const duration = data.split('_')[1]; // Extract the selected duration
    const blockchain = usersData[chatId].blockchain.toUpperCase();
    const paymentAddress = PAYMENT_WALLETS[blockchain];

    bot.sendMessage(chatId, `You selected ${duration}. Please send the required amount to the following wallet address: ${paymentAddress}`);
    bot.sendMessage(chatId, 'After making the payment, please enter your transaction hash to confirm the payment.');
  }
});

// Confirm Payment with Transaction Hash
bot.onText(/^[a-zA-Z0-9]{8,}$/, (msg) => {
  const chatId = msg.chat.id;

  if (usersData[chatId].blockchain) {
    const txHash = msg.text;
    bot.sendMessage(chatId, `Payment confirmed with transaction hash: ${txHash}. Your boost will begin now.`);

    // Simulate the boosting process
    startBoost(chatId, usersData[chatId].service);
  }
});

// Simulate Boost Process with less frequent updates
function startBoost(chatId, service) {
  bot.sendMessage(chatId, `We have added your ${service} boost to the queue. You will be notified when it starts.`);

  setTimeout(() => {
    bot.sendMessage(chatId, `Your ${service} boost has started!`);
    setTimeout(() => {
      bot.sendMessage(chatId, `${service} boost completed!`);
    }, 10000); // Simulate boost duration
  }, 5000); // Simulate wait time before boost starts
}
