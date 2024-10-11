require('dotenv').config();  // Load environment variables from .env
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, { polling: true });

let usersData = {}; // To store user data temporarily
let referrals = {}; // To track referrals

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  // Check if this user was referred by someone
  if (msg.text.includes('start=')) {
    const referrer = msg.text.split('=')[1];
    if (!referrals[referrer]) {
      referrals[referrer] = { count: 0, referredUsers: [] };
    }
    referrals[referrer].count += 1;
    referrals[referrer].referredUsers.push(chatId);
    bot.sendMessage(referrer, `You just referred a new user! Total referrals: ${referrals[referrer].count}`);
  }

  usersData[chatId] = { blockchain: null, contractAddress: null, service: null, token: null }; // Reset user data
  
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
    bot.sendMessage(chatId, `Share this referral link to earn rewards: https://t.me/YourBot?start=${chatId}`);
    if (referrals[chatId]) {
      bot.sendMessage(chatId, `You have referred ${referrals[chatId].count} users!`);
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

// Simulate Pricing and Payment (mocked for now)
bot.on('callback_query', (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const data = callbackQuery.data;

  if (data.startsWith('duration_')) {
    const duration = data.split('_')[1]; // Extract the selected duration
    bot.sendMessage(chatId, `You selected ${duration}. Please deposit the required amount to the following wallet address (simulated): 0x1234YourWallet`);

    // Simulate deposit and start the boost
    setTimeout(() => {
      bot.sendMessage(chatId, `Payment confirmed! Your ${usersData[chatId].service} boost is now in progress...`);
      simulateBoostProcess(chatId, usersData[chatId].service);
    }, 5000); // Simulate deposit confirmation
  }
});

// Simulate Boost Process
function simulateBoostProcess(chatId, service) {
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    bot.sendMessage(chatId, `Boosting progress: ${progress}%`);

    if (progress >= 100) {
      clearInterval(interval);
      bot.sendMessage(chatId, `${service} boost completed!`);
    }
  }, 1500); // Progress update every 1.5 seconds
}
