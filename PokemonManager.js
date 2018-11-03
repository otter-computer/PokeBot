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
   * Save a pokemon to a user's pokedex in the database
   * @param {User} User
   * @param {Message} Message
   */
  catchPokemon(User, Message) {
    this.database.ref('encounters/' + Message.id).once('value', encounterSnapshot => {
      const encounter = encounterSnapshot.val();
      this.database.ref('users/' + User.id + '/pokedex/' + Message.id).set({
        pokemon: encounter.pokemon
      });
    });
  }

  /**
   * Ends a pokemon encounter.
   * Deletes the bot message, removes encounter from database
   * @param {string} messageId The message ID of the encounter
   */
  endEncounter(messageId) {
    const Guild = this.client.guilds.first();

    this.database.ref('encounters/' + messageId).once('value', encounterSnapshot => {
      const encounter = encounterSnapshot.val();

      Guild.channels.get(encounter.channelId).then(Channel => {
        Channel.fetchMessage(messageId).then(Message=> {
          Message.delete();
        });
      });

      this.database.ref('encounters/' + messageId).remove();
    });
  }

  /**
   * Generates a wild pokemon encounter
   * @param {string} [id] The ID of the pokemon to generate
   */
  generateEncounter(id) {
    return new Promise((resolve, reject) => {
      let pokemon;

      if (id) {
        pokemon = this.generatePokemon(id);
      } else {
        pokemon = this.generatePokemon();
      }

      resolve(pokemon);
    });
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
   * Get a user's pokedex from the database
   * @param {string} userId The Discord user ID of the user you want to get the pokedex for
   */
  getPokedex(userId) {
    const pokedexRef = this.database.ref('users/' + userId + '/pokedex');
    return new Promise((resolve, reject) => {
      pokedexRef.once('value', pokedexSnapshot => {
        const pokedex = pokedexSnapshot.val();
        resolve(pokedex);
      });
    });
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
