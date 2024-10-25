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
  bot.sendMessage(chatId, `🚀 Welcome to Sprint Multi-Chain Volume Booster & Micro Buy 🚀
Boost your project’s visibility with our powerful Volume Booster and Micro Buy services. Rise to the top of trending charts or increase token volume across multiple blockchains. Sprint equips you with the tools to dominate the DEXs and trading platforms.

📈 Services Available:
• Volume Booster: Increase token volume on key DEXs.
• Micro Buy: Generate micro-transactions to enhance token visibility.
• Bumping: Get featured on the front page of platforms like Pump.fun.

🌐 Supported Chains & Pools:
1. Ethereum (ETH): Uniswap (V2/V3)
2. Solana (SOL): Raydium, PumpFun
3. Base (BASE): Uniswap, Apestore
4. Sui (SUI): Cetus, SuiSwap, MovePump
5. TON (The Open Network): All swaps, Gas Pump

Select an option to proceed:`, {
    reply_markup: {
      keyboard: [
        [{ text: "🚀 Start Bumping" }],
        [{ text: "📈 Volume Boost" }, { text: "📊 Micro Buy Boost" }],
        [{ text: "❓Help & Support" }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});

// Main Message Logic
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // Check if the user pressed "Back" or "Main Menu"
  if (msg.text === 'Back') {
    handleBackButton(chatId);
    return;
  }

  if (msg.text === 'Main Menu') {
    handleMainMenu(chatId);
    return;
  }

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

  // Help & Support Flow
  if (msg.text === '❓Help & Support') {
    bot.sendMessage(chatId, "Need help? Contact us at support@sprintbooster.com or visit our support page: https://sprintbooster.com/help.", {
      reply_markup: {
        keyboard: [
          [{ text: "Main Menu" }]
        ],
        resize_keyboard: true
      }
    });
  }

  // Function to handle back navigation
  function handleBackButton(chatId) {
    bot.sendMessage(chatId, "Going back to the previous menu.", {
      reply_markup: {
        keyboard: [
          [{ text: "🚀 Start Bumping" }],
          [{ text: "📈 Volume Boost" }, { text: "📊 Micro Buy Boost" }],
          [{ text: "❓Help & Support" }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
  }

  // Function to handle main menu navigation
  function handleMainMenu(chatId) {
    bot.sendMessage(chatId, "Redirecting to the main menu.", {
      reply_markup: {
        keyboard: [
          [{ text: "🚀 Start Bumping" }],
          [{ text: "📈 Volume Boost" }, { text: "📊 Micro Buy Boost" }],
          [{ text: "❓Help & Support" }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
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
          [{ text: "❓Help & Support" }]
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
      bot.sendMessage(chatId, `Network: ${blockchain}. Please enter your project token address or submit a link from the supported pools for ${blockchain}:`, {
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
                bot.sendMessage(chatId, `Payment confirmed! Here's your unique referral link: t.me/MultichainVolumeBot?start=${msg.chat.username}`);
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
  bot.sendMessage(chatId, `Select a Volume Boost package:\n\n- Starter: $100\n- Basic: $200\n- Pro: $400\n- Advanced: $1000`, {
    reply_markup: {
      keyboard: [
        [{ text: "Starter" }, { text: "Basic" }],
        [{ text: "Pro" }, { text: "Advanced" }],
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
    bot.sendMessage(chatId, `You chose the ${packageName} package. Enter the contract address or submit a pool link:`, {
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
          bot.sendMessage(chatId, `Transfer to: ${volumeWallet}\nMin amount: $100.\nSend the transaction hash and screenshot once complete.`, {
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
  bot.sendMessage(chatId, `Choose a Micro Buy Boost package:\n\n- Lite: $100\n- Standard: $200\n- Premium: $400\n- Supreme: $1000`, {
    reply_markup: {
      keyboard: [
        [{ text: "Lite" }, { text: "Standard" }],
        [{ text: "Premium" }, { text: "Supreme" }],
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
    bot.sendMessage(chatId, `You've selected ${packageName}. Enter contract address or submit a pool link:`, {
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
          bot.sendMessage(chatId, `Deposit at: ${microBuyWallet}\nMin: $100\nSend the transaction hash & screenshot once completed.`, {
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
