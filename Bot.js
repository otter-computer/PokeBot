require('./Utils');
const EventEmitter = require('events');
const Discord = require('discord.js');
const cron = require('node-cron');
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

    cron.schedule('*/30 * * * *', () => {
      console.log('Auto-generating encounter');
      this.generateEncounter();
    });
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

  async generateEncounter(pokemonId) {
    let pokemon;

    if (pokemonId) {
      pokemon = await this.PokemonManager.generateEncounter(pokemonId);
    } else {
      pokemon = await this.PokemonManager.generateEncounter();
    }

    this.outputEncounter(pokemon);
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
      if (args.length > 2) {
        this.generateEncounter(args[2]);
      } else {
        this.generateEncounter();
      }

      return;
    }

    if (command === 'type' || command === 'types') {
      const allowedTypes = await this.PokemonManager.getAllowedTypes(Message.author.id);
      // No type specified, so show available types
      if (args.length <= 2) {
        if (allowedTypes.length > 0) {
          Message.reply(
            'Here\'s the types you can select:\n```' + allowedTypes.join(', ').toProperCase() + '```' +
            'Set one using `@' + this.client.user.username + ' type ' + allowedTypes[0].toProperCase() + '`'
          );
        } else {
          Message.reply('Sorry, you don\'t have any types you can set :sob: Catch more Pokémon and try again!');
        }
        return;
      }

      this.setType(args[2], allowedTypes, Message);
    }

    if (command === 'pokedex') {
      // this.outputPokedex(Message);
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
    if (MessageReaction.emoji.id !== '507935062457712660') {
      console.log('Ignoring bad reaction');
      return;
    }

    console.log(User.username + ' reacted');

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

    const channels = [
      'general',
      'pc-gaming',
      'console-gaming',
      'mobile-gaming',
      'tabletop-gaming',
      'lady-talk',
      'battle-royale',
      'dead-by-daylight',
      'final-fantasy',
      'league-of-legends',
      'minecraft',
      'overwatch',
      'pokemon',
      'warframe',
      'world-of-warcraft',
      'elder-scrolls-online',
      'selfies',
      'pets',
      'fitness',
      'food',
      'news-and-politics',
      'science-and-technology',
      'philosophy',
      'language',
      'streams-and-vids',
      'tv-movies',
      'rupauls-drag-race',
      'anime',
      'music',
      'creative',
      'memes',
      'bot-room',
      'voice-chat-channel'
    ];

    const Channel = Guild.channels.find('name', channels[Math.floor(Math.random()*channels.length)]);

    console.log('Starting encounter in:', Channel.name);

    const embed = new Discord.RichEmbed();

    embed.setTitle('A wild ' + pokemon.name.toProperCase() + ' has appeared!');
    embed.setDescription('Throw a Poké Ball to catch it!');
    embed.setThumbnail('https://gaymers.gg/pkmn-assets/' + pokemon.id + '.png');
    embed.addField('Types', pokemon.types.join(', ').toProperCase());

    Channel.send(embed).then(Message => {
      Message.react(Message.guild.emojis.get('507935062457712660'));
      this.PokemonManager.saveEncounter(Message, pokemon);
    });
  }

  /**
   * Output's the user's current pokedex
   * @param {Message} Message The Discord message that requested the pokedex
   * @param {Object} pokedex The user's pokedex
   */
  async outputPokedex(Message) {
    const pokedex = await this.PokemonManager.getPokedex(Message.author.id);
    console.log(pokedex);
    // TODO: Format and output pokedex
  }

  /**
   * Sets the user's role based on the types of pokemon they have
   * @param {string} chosenType The type the user wants to set
   * @param {Array} allowedTypes The types the user is allowed to set
   */
  setType(chosenType, allowedTypes, Message) {
    const chosenTypeLowerCase = chosenType.toLowerCase();
    const chosenTypeProperCase = chosenType.toProperCase();

    const TYPES = [
      'Normal',
      'Fire',
      'Fighting',
      'Water',
      'Flying',
      'Grass',
      'Poison',
      'Electric',
      'Ground',
      'Psychic',
      'Rock',
      'Ice',
      'Bug',
      'Dragon',
      'Ghost',
      'Dark',
      'Steel',
      'Fairy'
    ];

    if (!allowedTypes.includes(chosenTypeLowerCase)) {
      Message.reply('Sorry, you don\'t have enough Pokémon of that type yet. Go catch some more!');
      return;
    }

    const newTypeRole = Message.guild.roles.find('name', chosenTypeProperCase);
    if (!newTypeRole) {
      Message.reply('Sorry, I had an issue setting your type. :confounded:');
      return;
    }

    if (Message.member.roles.findKey('name', chosenTypeProperCase)) {
      Message.reply('You\'ve already set your type to that! :confused:');
      return;
    }

    const modifiedRoleList = [];
    Message.member.roles.forEach(existingRole => {
      if (TYPES.includes(existingRole.name)) {
        // Filter out any region roles
        return;
      }
      modifiedRoleList.push(existingRole);
    });
    modifiedRoleList.push(newTypeRole);

    Message.member.setRoles(modifiedRoleList).then(() => {
      Message.reply('I\'ve set your new type!');
    });
  }
}

module.exports = Bot;
