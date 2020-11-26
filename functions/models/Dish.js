class Dish {
    /**
     *  
     * @param {Date} date 
     * @param {String} name 
     * @param {String} price 
     * @param {Array.<String>} tags (optional, tags  = [])
     * @param {String} mensa (optional, mensa  = 'schwentinemensa')
     * @param {int} rating (optional, rating = 0)
     */
    constructor(date, name, price, tags = [], mensa = 'schwentinemensa', rating = Math.floor(Math.random() * (Math.ceil(3) - Math.floor(-2) +1)) + Math.floor(-1)) {
        this.date = date,
        this.name = name,
        this.price = price,
        this.tags = tags,
        this.mensa = mensa,
        this.rating = rating
    }

    isVegatarian() {
        return this.tags.includes('Vegetarian') ? true : false;
    }

    isVegan() {
        return this.tags.includes('Vegan') ? true : false;
    }

    isHalal() {
        return this.tags.includes('Schwein') || this.tags.includes('Alkohol') ? false : true;
    }
}

module.exports = Dish;