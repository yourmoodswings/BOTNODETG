import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Create a bot instance using webhook instead of polling
const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, {
  webHook: true
});

// Set the webhook with the correct URL
const url = process.env.RENDER_EXTERNAL_URL || "your-url-here";
const port = process.env.PORT || 3000;
bot.setWebHook(`${url}/bot${process.env.TELEGRAM_API_TOKEN}`);

// Webhook endpoint
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

// Start Bumping Flow
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `🤖 Welcome to Base Micro Buy & Volume Booster 🤖\n\nTo get started, please choose the service and configure your settings.\n\nServices:\n- Bumping: To get on the front page of Ape.Store\n- Volume Booster: Create a volume on Ape.Store or Uniswap\n- Transaction Booster: Create thousands of transactions to get top trends on Dexscreener\n\nCompatible Pools:\n- Ape.Store\n- Uniswap\n\nYour Bump Wallet:`, {
    reply_markup: {
      keyboard: [
        [{ text: "🚀 Start Bumping" }, { text: "📈 Buy Volume Boost" }],
        [{ text: "📊 Buy Transaction Boost" }, { text: "👥 Referral Program" }],
        [{ text: "❓HELP" }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});

// Main Message Logic
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // Start Bumping Flow
  if (msg.text === '🚀 Start Bumping') {
    handleStartBumping(chatId);
  }

  // Buy Volume Boost Flow
  if (msg.text === '📈 Buy Volume Boost') {
    handleBuyVolumeBoost(chatId);
  }

  // Buy Transaction Boost Flow
  if (msg.text === '📊 Buy Transaction Boost') {
    handleBuyTransactionBoost(chatId);
  }

  // Referral Program Flow
  if (msg.text === '👥 Referral Program') {
    bot.sendMessage(chatId, "Here's your referral link: https://example.com/referral?id=12345\nYou have 10 successful referrals.", {
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
    bot.sendMessage(chatId, "For help, please contact support@example.com or visit our help page: https://example.com/help.", {
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
          [{ text: "🚀 Start Bumping" }, { text: "📈 Buy Volume Boost" }],
          [{ text: "📊 Buy Transaction Boost" }, { text: "👥 Referral Program" }],
          [{ text: "❓HELP" }]
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
              bot.sendMessage(chatId, `You can deposit into a single mother wallet that disperses funds automatically.`, {
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

              // Handling Deposit
              bot.on('message', (msg) => {
                if (msg.text === 'Cancel') return;

                if (msg.text === 'Deposit') {
                  const bumpWallet = '0x8a788f8f5DB2Ab7f4553964af8CFC55F671330F6';  // Example wallet
                  bot.sendMessage(chatId, `Your Wallet: ${bumpWallet}\nPlease send the transaction hash and a screenshot.`, {
                    reply_markup: {
                      keyboard: [
                        [{ text: "Cancel" }],
                        [{ text: "Back" }, { text: "Main Menu" }]
                      ],
                      resize_keyboard: true
                    }
                  });
                }
              });
            });
          });
        });
      });
    });
  });
}

// Handle Buy Volume Boost Flow
function handleBuyVolumeBoost(chatId) {
  bot.sendMessage(chatId, `Choose your volume boost package. Please refer to the prices:\n\n- Iron Package: $150, 11,600 vol\n- Bronze Package: $300, 23,200 vol\n- Silver Package: $900, 69,000 vol\n- Gold Package: $1,800, 138,000 vol\n- Diamond Package: $3,600, 276,000 vol`, {
    reply_markup: {
      keyboard: [
        [{ text: "Iron Package" }, { text: "Bronze Package" }],
        [{ text: "Silver Package" }, { text: "Gold Package" }, { text: "Diamond Package" }],
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
    bot.sendMessage(chatId, `You selected the ${packageName}. Now enter your contract address:`, {
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
      bot.sendMessage(chatId, `You entered ${contractAddress}. Choose how you will pay:`, {
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

      // Handling Deposit
      bot.on('message', (msg) => {
        if (msg.text === 'Cancel') return;

        if (msg.text === 'Deposit') {
          const volumeWallet = '0x123456789VolumeWallet';  // Example wallet
          bot.sendMessage(chatId, `Deposit to wallet: ${volumeWallet}\nMinimum: $150`, {
            reply_markup: {
              keyboard: [
                [{ text: "Cancel" }],
                [{ text: "Back" }, { text: "Main Menu" }]
              ],
              resize_keyboard: true
            }
          });

          bot.once('message', () => {
            bot.sendMessage(chatId, "Please send transaction hash and screenshot.");
          });
        }
      });
    });
  });
}

// Handle Buy Transaction Boost Flow
function handleBuyTransactionBoost(chatId) {
  bot.sendMessage(chatId, `Choose your transaction boost package:\n\n- Iron: $200, 3200 transactions\n- Bronze: $400, 6400 transactions\n- Silver: $1200, 19,200 transactions\n- Gold: $2400, 38,400 transactions\n- Diamond: $4800, 76,800 transactions`, {
    reply_markup: {
      keyboard: [
        [{ text: "Iron" }, { text: "Bronze" }],
        [{ text: "Silver" }, { text: "Gold" }, { text: "Diamond" }],
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
    bot.sendMessage(chatId, `You selected the ${packageName} package. Now enter your contract address:`, {
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
      bot.sendMessage(chatId, `You entered ${contractAddress}. Choose how you will pay:`, {
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

      // Handling Deposit
      bot.on('message', (msg) => {
        if (msg.text === 'Cancel') return;

        if (msg.text === 'Deposit') {
          const transactionWallet = '0x123456789TransactionWallet';  // Example wallet
          bot.sendMessage(chatId, `Deposit to wallet: ${transactionWallet}\nMinimum: $200`, {
            reply_markup: {
              keyboard: [
                [{ text: "Cancel" }],
                [{ text: "Back" }, { text: "Main Menu" }]
              ],
              resize_keyboard: true
            }
          });

          bot.once('message', () => {
            bot.sendMessage(chatId, "Please send transaction hash and screenshot.");
          });
        }
      });
    });
  });
}
