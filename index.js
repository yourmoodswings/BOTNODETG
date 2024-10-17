import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, {
  webHook: true
});

const url = process.env.RENDER_EXTERNAL_URL || "your-url-here";
const port = process.env.PORT || 3000;
bot.setWebHook(`${url}/bot${process.env.TELEGRAM_API_TOKEN}`);

app.post(`/bot${process.env.TELEGRAM_API_TOKEN}`, (req, res) => {
  try {
    if (req.body.message) {
      bot.processUpdate(req.body);
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Store user referral data
let userReferrals = {};

// Start Bot Interaction
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `🚀 Welcome to Sprint Multi-Chain Volume Booster & Micro Buy 🚀\n\nTo get started, please choose the service and configure your settings.\n\nServices:\n- Volume Booster: Create volume across multiple chains.\n- Micro Buy: Generate rapid micro-transactions for visibility.\n\nSelect an option to proceed:`, {
    reply_markup: {
      keyboard: [
        [{ text: "🚀 Start Bumping" }],
        [{ text: "📈 Buy Volume Boost", text: "📊 Buy Transaction Boost" }],
        [{ text: "👥 Referral Program", text: "❓HELP" }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});

// Main Message Logic
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const username = msg.chat.username || `user${chatId}`;

  // Start Bumping Flow
  if (msg.text === '🚀 Start Bumping') {
    handleStartBumping(chatId);
  }

  // Buy Volume Boost Flow
  if (msg.text === '📈 Buy Volume Boost') {
    handleBuyVolumeBoost(chatId);
  }

  // Buy Micro Buy Boost Flow
  if (msg.text === '📊 Buy Transaction Boost') {
    handleBuyTransactionBoost(chatId);
  }

  // Referral Program Flow
  if (msg.text === '👥 Referral Program') {
    bot.sendMessage(chatId, `Here's your referral link: ${url}/ref/${username}\nYou have ${userReferrals[username]?.length || 0} successful referrals.`, {
      reply_markup: {
        keyboard: [
          [{ text: "Main Menu" }, { text: "Back" }]
        ],
        resize_keyboard: true
      }
    });
  }

  // Help Flow
  if (msg.text === '❓HELP') {
    bot.sendMessage(chatId, "For help, please contact support@sprintbooster.com or visit our help page: https://sprintbooster.com/help.", {
      reply_markup: {
        keyboard: [
          [{ text: "Main Menu" }, { text: "Back" }]
        ],
        resize_keyboard: true
      }
    });
  }

  // Cancel button logic
  if (msg.text === 'Cancel') {
    bot.sendMessage(chatId, "Operation cancelled. Returning to the main menu.", {
      reply_markup: {
        keyboard: [
          [{ text: "🚀 Start Bumping" }],
          [{ text: "📈 Buy Volume Boost", text: "📊 Buy Transaction Boost" }],
          [{ text: "👥 Referral Program", text: "❓HELP" }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
  }
});

// Handle Start Bumping Flow
function handleStartBumping(chatId) {
  bot.sendMessage(chatId, "Great! Let's get started. What's the name of your project?", {
    reply_markup: {
      keyboard: [
        [{ text: "Cancel" }],
        [{ text: "Back" }, { text: "Main Menu" }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });

  bot.once('message', (msg) => {
    if (msg.text === 'Cancel') return;

    const projectName = msg.text;
    bot.sendMessage(chatId, `You entered project name: ${projectName}. Now, select the blockchain for your project:`, {
      reply_markup: {
        keyboard: [
          [{ text: "ETH" }, { text: "SOL" }, { text: "TON" }, { text: "SUI" }, { text: "BASE" }],
          [{ text: "Cancel" }],
          [{ text: "Back" }, { text: "Main Menu" }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });

    bot.once('message', (msg) => {
      if (msg.text === 'Cancel') return;

      const blockchain = msg.text;
      const walletAddress = getWalletAddress(blockchain);
      bot.sendMessage(chatId, `You selected ${blockchain}. Please enter your project token address:`, {
        reply_markup: {
          keyboard: [
            [{ text: "Cancel" }],
            [{ text: "Back" }, { text: "Main Menu" }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });

      bot.once('message', (msg) => {
        if (msg.text === 'Cancel') return;

        const tokenAddress = msg.text;
        bot.sendMessage(chatId, `Enter the amount of coin per bump (in ${blockchain} equivalent):`);

        bot.once('message', (msg) => {
          if (msg.text === 'Cancel') return;

          const coinAmount = msg.text;
          bot.sendMessage(chatId, `Select bump frequency (in seconds) or type 'random':`);

          bot.once('message', (msg) => {
            if (msg.text === 'Cancel') return;

            const frequency = msg.text;
            bot.sendMessage(chatId, `Enter slippage percentage (1-100%):`);

            bot.once('message', (msg) => {
              if (msg.text === 'Cancel') return;

              const slippage = msg.text;
              bot.sendMessage(chatId, `You can deposit to the address below:\n${walletAddress}\nPlease send the transaction hash and screenshot after payment.`, {
                reply_markup: {
                  keyboard: [
                    [{ text: "Cancel" }],
                    [{ text: "Back" }, { text: "Main Menu" }]
                  ],
                  resize_keyboard: true
                }
              });

              bot.once('message', () => {
                bot.sendMessage(chatId, `Payment successful! Referral link: ${url}/ref/${msg.chat.username}`);
                storeReferral(msg.chat.username);
              });
            });
          });
        });
      });
    });
  });
}

// Wallet Address Based on Blockchain
function getWalletAddress(blockchain) {
  switch (blockchain) {
    case 'ETH': return '0x3142670d2362A09Eb2831ABCCc641ce8F8B08b2b';
    case 'SOL': return 'AwhBUFkHKpASA7hsX1XpSvn77vfcKSd8wjVy14PqAqcM';
    case 'SUI': return '0x4bd0cfb07f05f13981e415addf83a429aa0fb06769b47094ac01d3b184adf732';
    case 'BASE': return '0x3142670d2362A09Eb2831ABCCc641ce8F8B08b2b';
    case 'TON': return 'UQDUG_bLXg8Msf2Og6VzNd9TnXbEZUZgbVRPBqCh1QbW6EKu';
    default: return 'Unknown Blockchain';
  }
}

// Store referrals
function storeReferral(username) {
  if (!userReferrals[username]) {
    userReferrals[username] = [];
  }
  userReferrals[username].push({ referralDate: new Date() });
}

// Handle Buy Volume Boost Flow
function handleBuyVolumeBoost(chatId) {
  bot.sendMessage(chatId, `Choose your volume boost package:\n\n- Starter: $150, 11,600 vol\n- Basic: $300, 23,200 vol\n- Pro: $900, 69,000 vol\n- Advanced: $1,800, 138,000 vol\n- Ultimate: $3,600, 276,000 vol`, {
    reply_markup: {
      keyboard: [
        [{ text: "Starter" }, { text: "Basic" }],
        [{ text: "Pro" }, { text: "Advanced" }, { text: "Ultimate" }],
        [{ text: "Cancel" }],
        [{ text: "Back" }, { text: "Main Menu" }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });

  bot.once('message', (msg) => {
    if (msg.text === 'Cancel') return;

    const packageName = msg.text;
    bot.sendMessage(chatId, `You chose the ${packageName} package. Enter the contract address:`, {
      reply_markup: {
        keyboard: [
          [{ text: "Cancel" }],
          [{ text: "Back" }, { text: "Main Menu" }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });

    bot.once('message', (msg) => {
      if (msg.text === 'Cancel') return;

      const contractAddress = msg.text;
      const volumeWallet = getWalletAddress('ETH'); // Default ETH Wallet Example
      bot.sendMessage(chatId, `Please deposit to: ${volumeWallet}\nMin amount: $150.\nSend the transaction hash & screenshot after completion.`, {
        reply_markup: {
          keyboard: [
            [{ text: "Cancel" }],
            [{ text: "Back" }, { text: "Main Menu" }]
          ],
          resize_keyboard: true
        }
      });

      bot.once('message', () => {
        bot.sendMessage(chatId, "Transaction confirmed. Thank you!");
      });
    });
  });
}

// Handle Buy Micro Buy Boost Flow
function handleBuyTransactionBoost(chatId) {
  bot.sendMessage(chatId, `Choose your Micro Buy Boost package:\n\n- Lite: $200, 3200 transactions\n- Standard: $400, 6400 transactions\n- Premium: $1200, 19,200 transactions\n- Enterprise: $2400, 38,400 transactions\n- Supreme: $4800, 76,800 transactions`, {
    reply_markup: {
      keyboard: [
        [{ text: "Lite" }, { text: "Standard" }],
        [{ text: "Premium" }, { text: "Enterprise" }, { text: "Supreme" }],
        [{ text: "Cancel" }],
        [{ text: "Back" }, { text: "Main Menu" }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });

  bot.once('message', (msg) => {
    if (msg.text === 'Cancel') return;

    const packageName = msg.text;
    bot.sendMessage(chatId, `You've selected ${packageName}. Enter contract address:`, {
      reply_markup: {
        keyboard: [
          [{ text: "Cancel" }],
          [{ text: "Back" }, { text: "Main Menu" }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });

    bot.once('message', (msg) => {
      if (msg.text === 'Cancel') return;

      const contractAddress = msg.text;
      const microBuyWallet = getWalletAddress('ETH'); // Example Wallet
      bot.sendMessage(chatId, `Deposit to: ${microBuyWallet}\nMin: $200.\nSend the transaction hash & screenshot once completed.`, {
        reply_markup: {
          keyboard: [
            [{ text: "Cancel" }],
            [{ text: "Back" }, { text: "Main Menu" }]
          ],
          resize_keyboard: true
        }
      });

      bot.once('message', () => {
        bot.sendMessage(chatId, "Transaction confirmed. Welcome to Sprint Multi-Chain Volume Booster & Micro Buy!");
      });
    });
  });
}
