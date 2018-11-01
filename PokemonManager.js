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

    const pokemon = this.getPokemon();
    console.log(pokemon);
    return;
  }

  /**
   * Gets the specified Pokemon, or a random one
   * @param {string} [Id] The ID of the pokemon
   */
  getPokemon(Id) {
    if (Id) {
      return this.pokemon[Id];
    } else {
      return this.pokemon[Math.floor(Math.random() * Object.keys(this.pokemon).length)];
    }
  }

  /**
   *
   */
  outputPokedex() {

  }
}

module.exports = PokemonManager;
