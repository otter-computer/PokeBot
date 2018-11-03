const Discord = require('discord.js');

class PokemonManager {
  /**
   *
   * @constructor
   */
  constructor(Client, database) {
    this.pokemon = require('./pokemon.json');
    this.client = Client;
    this.database = database;
  }

  /**
   *
   */
  catchPokemon(User, Message) {
    this.database.ref('encounters/' + Message.id).once('value', encounterSnapshot => {
      const encounter = encounterSnapshot.val();
      this.database.ref('users/' + User.id + '/' + Message.id).set({
        pokemon: encounter.pokemon
      });
    });
  }

  /**
   *
   */
  endEncounter(messageId) {
    this.database.ref('encounters/' + messageId).remove();
  }

  /**
   * Generates a wild pokemon encounter
   * @param {string} [id] The ID of the pokemon to generate
   */
  generateEncounter(id) {
    let pokemon;

    if (id) {
      pokemon = this.generatePokemon(id);
    } else {
      pokemon = this.generatePokemon();
    }

    console.log(pokemon);

    const Guild = this.client.guilds.first();
    const Channel = Guild.channels.filter(channel => channel.type === 'text').random();

    const embed = new Discord.RichEmbed();

    embed.setTitle('A wild ' + pokemon.name + ' has appeared!');
    embed.setDescription('Throw a Poké Ball to catch it!');
    embed.setThumbnail('https://gaymers.gg/pkmn-assets/' + pokemon.id + '.png');
    embed.addField('Types', pokemon.types.join(', '));

    Channel.send(embed).then(Message => {
      Message.react(Message.guild.emojis.get('507711756358123540'));
      this.saveEncounter(Message, pokemon);
    });
    return;
  }

  /**
   * Generates the specified Pokemon, or a random one
   * @param {string} [Id] The ID of the pokemon
   */
  generatePokemon(Id) {
    let pkmnId = Id;

    if (!pkmnId) {
      pkmnId = Math.floor(Math.random() * Object.keys(this.pokemon).length);
    }

    const pokemon = this.pokemon[pkmnId];
    pokemon.id = pkmnId;
    return pokemon;
  }

  /**
   *
   */
  outputPokedex() {

  }

  /**
   * Save the generated encounter to the database for ez lookup later
   * @param {Message} Message The bot message containing the encounter
   * @param {Object} pokemon The pokemon object inside the message
   */
  saveEncounter(Message, pokemon) {
    this.database.ref('encounters/' + Message.id).set({
      channelId: Message.channel.id,
      messageId: Message.id,
      pokemon: pokemon
    });
  }
}

module.exports = PokemonManager;
