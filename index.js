require('dotenv').config();  // Load environment variables from .env
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const Web3 = require('web3');  // For Ethereum-based blockchains
const { Connection, PublicKey } = require('@solana/web3.js'); // For Solana
const { TonClient } = require('@tonclient/appkit'); // For TON
const { SuiClient, Connection: SuiConnection } = require('@mysten/sui.js'); // For SUI

const app = express();
app.use(bodyParser.json());

const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN);

// Wallet addresses from .env
const PAYMENT_WALLETS = {
  SOL: process.env.SOL_WALLET,
  ETH: process.env.ETH_WALLET,
  TON: process.env.TON_WALLET,
  SUI: process.env.SUI_WALLET
};

// Blockchain Clients
const web3 = new Web3('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID');  // Ethereum provider
const solanaConnection = new Connection('https://api.mainnet-beta.solana.com');
const tonClient = new TonClient();  // TON client initialization
const suiConnection = new SuiConnection({ fullnode: 'https://fullnode.mainnet.sui.io' });
const suiClient = new SuiClient({ connection: suiConnection }); // SUI client initialization

// Set the webhook for Telegram
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

let usersData = {};  // Store user data temporarily
let referrals = {};  // Store referral data

// Fetch balances for specific blockchain, including SUI
async function fetchBalance(blockchain, userWallet) {
  switch (blockchain) {
    case 'ETH':
      return await web3.eth.getBalance(userWallet);
    case 'SOL':
      const solanaBalance = await solanaConnection.getBalance(new PublicKey(userWallet));
      return solanaBalance / 1e9;  // Convert to SOL
    case 'TON':
      const tonBalance = await tonClient.getBalance(userWallet);
      return tonBalance;
    case 'SUI':
      const suiBalance = await suiClient.getCoinBalances(userWallet);  // Get SUI coin balances
      return suiBalance.totalBalance;
    default:
      return 0;
  }
}

// Verify Payment for Ethereum (web3.js example)
async function verifyEthereumTransaction(txHash, expectedAmount, expectedWallet) {
  const receipt = await web3.eth.getTransaction(txHash);
  const amount = web3.utils.fromWei(receipt.value, 'ether');
  return receipt.to.toLowerCase() === expectedWallet.toLowerCase() && amount >= expectedAmount;
}

// Start Command - Package Selection
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Welcome! Please choose a package:", {
    reply_markup: {
      keyboard: [
        [{ text: '🚀 Start Bumping' }, { text: '📈 Buy Volume Boost' }],
        [{ text: '🔄 Buy Transaction Boost' }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
  usersData[chatId] = { step: 'package_selection' };  // Set the user's step to package selection
});

// Handle package selection and move to project name input
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (usersData[chatId]?.step === 'package_selection') {
    usersData[chatId].package = text;
    bot.sendMessage(chatId, "What is the name of your project?");
    usersData[chatId].step = 'project_name';
  } else if (usersData[chatId]?.step === 'project_name') {
    usersData[chatId].projectName = text;
    bot.sendMessage(chatId, `Great! You entered: ${text}. Now, select the blockchain for your project:`, {
      reply_markup: {
        keyboard: [
          [{ text: 'TON' }, { text: 'Ethereum (ETH)' }],
          [{ text: 'Solana (SOL)' }, { text: 'Sui (SUI)' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
    usersData[chatId].step = 'blockchain';
  } else if (['TON', 'Ethereum (ETH)', 'Solana (SOL)', 'Sui (SUI)'].includes(text) && usersData[chatId]?.step === 'blockchain') {
    usersData[chatId].blockchain = text.split(' ')[0];  // Extract blockchain name
    bot.sendMessage(chatId, `You selected ${usersData[chatId].blockchain}. Now, please enter your project contract address.`);
    usersData[chatId].step = 'contract_address';
  } else if (usersData[chatId]?.step === 'contract_address') {
    usersData[chatId].contractAddress = text;
    bot.sendMessage(chatId, `Verifying contract address ${text} on ${usersData[chatId].blockchain}...`);
    
    // Simulate contract verification
    setTimeout(() => {
      bot.sendMessage(chatId, `Contract ${text} verified! Select the boost duration:`, {
        reply_markup: {
          keyboard: [
            [{ text: '1 Day - 0.5 SOL' }, { text: '7 Days - 2 SOL' }],
            [{ text: '30 Days - 5 SOL' }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
      usersData[chatId].step = 'duration';
    }, 2000);
  } else if (text.includes('Day') && usersData[chatId]?.step === 'duration') {
    const duration = text.split(' ')[0];
    const blockchain = usersData[chatId].blockchain.toUpperCase();
    const paymentAddress = PAYMENT_WALLETS[blockchain];

    bot.sendMessage(chatId, `You selected ${duration}. Please send the required amount to ${paymentAddress} and provide the transaction hash to confirm payment.`);
    usersData[chatId].step = 'payment';
  } else if (text.length >= 8 && usersData[chatId]?.step === 'payment') {
    const txHash = text;
    const blockchain = usersData[chatId].blockchain.toUpperCase();

    bot.sendMessage(chatId, `Verifying your transaction...`);
    
    // Simulate transaction verification for Ethereum
    verifyEthereumTransaction(txHash, '0.5', PAYMENT_WALLETS[blockchain]).then(isValid => {
      if (isValid) {
        bot.sendMessage(chatId, 'Payment confirmed! Your boost will begin now.');
        startBoost(chatId, usersData[chatId].package);
      } else {
        bot.sendMessage(chatId, 'Payment verification failed. Please check your transaction hash and try again.');
      }
    });
  }
});

// Simulate Boost Process
function startBoost(chatId, service) {
  bot.sendMessage(chatId, `Your ${service} boost has started!`);
  setTimeout(() => {
    bot.sendMessage(chatId, `${service} boost completed!`);
  }, 10000);  // Simulate a boost duration
}

// Referral system and progress tracking
bot.onText(/\/dashboard/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || chatId;

  // Simulate referral and boost tracking
  const referralCount = referrals[username]?.count || 0;
  const referralLink = `https://t.me/YourBot?start=${username}`;
  bot.sendMessage(chatId, `Boost Progress: Your current boost is in progress.\nReferrals: ${referralCount}\nReferral Link: ${referralLink}`);
});
