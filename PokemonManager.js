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
    this.currentEncounters = [];
  }

  /**
   *
   */
  catchPokemon(User, pokemonId) {

  }

  /**
   *
   */
  endEncounter() {

  }

  /**
   * Generates a wild pokemon encounter
   * @param {string} [id] The ID of the pokemon to generate
   */
  generateEncounter(id) {
    let pokemon;

    if (id) {
      pokemon = this.getPokemon(id);
    } else {
      pokemon = this.getPokemon();
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
   * Gets the specified Pokemon, or a random one
   * @param {string} [Id] The ID of the pokemon
   */
  getPokemon(Id) {
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
   * @param {Message} Message The bot message containing the encounter
   * @param {Object} pokemon The pokemon object inside the message
   */
  saveEncounter(Message, pokemon) {

  }
}

module.exports = PokemonManager;
