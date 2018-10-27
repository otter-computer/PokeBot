require('dotenv').config();
const Bot = require('./Bot');

const PokeBot = new Bot();

// Handle graceful shutdowns
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

function cleanup() {
  PokeBot.destroy();
  process.exit();
}

PokeBot.connect();
