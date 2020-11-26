const assert = require('assert');
Dish = require('../models/Dish.js');

describe('Dish Model', () => {
    describe('Constructor', () => {
      it('should return valid instance of Dish', () => {
        const dish = new Dish();
        assert.strictEqual(dish.mensa, 'schwentinemensa');
      });
    });
  });