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
  async onMessage(Message) {
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
      let pokemon;

      if (args.length > 2) {
        pokemon = await this.PokemonManager.generateEncounter(args[2]);
      } else {
        pokemon = await this.PokemonManager.generateEncounter();
      }

      this.outputEncounter(pokemon);
      return;
    }

    if (command === 'pokedex') {
      const pokedex = await this.PokemonManager.getPokedex(Message.author.id);
      this.outputPokedex(Message, pokedex);
      return;
    }

    if (command === 'type') {
      console.log('Type');
      return;
    }
  }

  /**
   * Reaction handler
   * @param {MessageReaction} MessageReaction The reaction object
   * @param {User} User The user that applied the emoji or reaction emoji
   */
  onReaction(MessageReaction, User) {
    // Ignore message not sent by this bot
    if (MessageReaction.message.author !== this.client.user) {
      console.log('Ignoring non-bot message');
      return;
    }

    // Ignore bot reactions
    if (User.bot) {
      console.log('Ignoring bot reaction');
      return;
    }

    // Only act on pokeball emoji
    if (MessageReaction.emoji.id !== '507711756358123540') {
      console.log('Ignoring bad reaction');
      return;
    }

    this.PokemonManager.catchPokemon(User, MessageReaction.message);
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

  /**
   * Outputs an encounter to a random
   * @param {Object} pokemon The pokemon object to generate an encounter for
   */
  outputEncounter(pokemon) {
    const Guild = this.client.guilds.first();
    const Channel = Guild.channels.filter(channel => channel.type === 'text').random();

    const embed = new Discord.RichEmbed();

    embed.setTitle('A wild ' + pokemon.name + ' has appeared!');
    embed.setDescription('Throw a Poké Ball to catch it!');
    embed.setThumbnail('https://gaymers.gg/pkmn-assets/' + pokemon.id + '.png');
    embed.addField('Types', pokemon.types.join(', '));

    Channel.send(embed).then(Message => {
      Message.react(Message.guild.emojis.get('507711756358123540'));
      this.PokemonManager.saveEncounter(Message, pokemon);
    });
  }

  /**
   *
   * @param {Message} Message The Discord message that requested the pokedex
   * @param {Object} pokedex The user's pokedex
   */
  outputPokedex(Message, pokedex) {
    console.log(pokedex);
    // TODO: Format and output pokedex
  }
}

module.exports = Bot;
