const EventEmitter = require('events');
const Discord = require('discord.js');
const splitargs = require('splitargs');

class Bot extends EventEmitter {
  /**
   * Initializes a Discord client and data subimssion array.
   * Binds events.
   * @constructor
   */
  constructor() {
    super();

    this.client = new Discord.Client();

    this.bindEvents();
  }

  /**
   * Bind event functions.
   */
  bindEvents() {
    this.client.on('ready', this.onReady.bind(this));
    this.client.on('message', this.onMessage.bind(this));
  }

  /**
   * Login client to Discord.
   */
  connect() {
    this.client.login(process.env.AUTH_TOKEN);
  }

  /**
   * Destroy Discord client.
   */
  destroy() {
    console.log('Bot shutting down.');
    this.client.destroy();
  }

  /**
   * Returns a mentioned user from a bot command message
   * @param {Message} Message The Discord message object to return mentioned user
   */
  getMentionedUser(Message) {
    const user = Message.mentions.users.filter(user => {
      if(!user.bot) return user;
    }).first();

    return user;
  }

  /**
   * Checks if the user has staff permission
   * @param {User} User Discord JS User object of the user to check
   */
  isStaff(User, Guild) {
    let staff = false;

    if (Guild.members.get(User.id).roles.exists('name', 'Admin') || Guild.members.get(User.id).roles.exists('name', 'Moderator')) {
      staff = true;
    }

    return staff;
  }

  /**
   * Message handler.
   * Fires when a discord messages is recieved.
   * Filters messages from bots & DMs.
   * @param {Message} Message Discord message object that fired the event
   */
  async onMessage(Message) {
    // Ignore system, bot, DMs
    if (Message.system || Message.author.bot || !(Message.channel instanceof Discord.TextChannel)) {
      return;
    }

    if (Message.mentions.members.has(this.client.user.id)) {

      const command = splitargs(Message.content)[1];

      return;
    }
  }

  /**
   * Bot is ready
   */
  onReady() {
    console.log(
      'Connected to Discord as ' +
      this.client.user.username + '#' + this.client.user.discriminator + ' ' +
      '<@' + this.client.user.id + '>' +
      '.'
    );
  }
}

module.exports = Bot;
