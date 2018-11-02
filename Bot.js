const EventEmitter = require('events');
const Discord = require('discord.js');
const Firebase = require('./Firebase');
const PokemonManager = require('./PokemonManager');
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
    this.Firebase = new Firebase();
    this.PokemonManager = new PokemonManager(this.client, this.Firebase.database);

    this.bindEvents();
  }

  /**
   * Bind event functions.
   */
  bindEvents() {
    this.client.on('ready', this.onReady.bind(this));
    this.client.on('message', this.onMessage.bind(this));
    this.client.on('messageReactionAdd', this.onReaction.bind(this));
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
  onMessage(Message) {
    // Ignore system, bot, DMs
    if (Message.system || Message.author.bot || !(Message.channel instanceof Discord.TextChannel)) {
      return;
    }

    if (!Message.mentions.members.has(this.client.user.id)) {
      return;
    }

    const User = Message.author;
    const Guild = Message.guild;
    // const GuildMember = Message.member;

    const args = splitargs(Message.content);
    const command = args[1];

    if (command === 'e' && this.isStaff(User, Guild)) {

      if (args.length > 2) {
        this.PokemonManager.generateEncounter(args[2]);
        return;
      }

      this.PokemonManager.generateEncounter();
      return;
    }
  }

  /**
   * Reaction handler
   * @param {MessageReaction} MessageReaction The reaction object
   * @param {User} User The user that applied the emoji or reaction emoji
   */
  onReaction(MessageReaction, User) {

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
