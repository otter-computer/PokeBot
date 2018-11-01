class PokemonManager {
  /**
   *
   * @constructor
   */
  constructor(database) {
    this.pokemon = require('./pokemon.json');
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
   *
   */
  generateEncounter() {
    console.log('Generating encounter');
    

    return;
  }

  /**
   *
   */
  outputPokedex() {

  }
}

module.exports = PokemonManager;
