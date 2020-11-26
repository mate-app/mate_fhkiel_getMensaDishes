// Packages
const functions = require('firebase-functions');
const admin = require("firebase-admin");
const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');

const serviceAccount = 
    require("./key/mate-app-dev-firebase-adminsdk-liq4s-2c859c2b27.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://mate-app-dev.firebaseio.com"
});

// Models & Constants
const Dish = require('./models/Dish.js');
const BASE_URL = 'https://www.studentenwerk.sh';
const URL_PATHS = {
    'Schwentine Mensa': '/de/essen/standorte/kiel/schwentinemensa/speiseplan.html',
    'Mensa 1': '/de/essen/standorte/kiel/mensa-i/speiseplan.html'
}
const PROPERTIES = {
    'vegan.hd.png': 'Vegan',
    'vegetarisch.hd.png': 'Vegetarisch',
    's.hd.png': 'Schwein',
    'ags.hd.png': 'Schwein',
    'r.hd.png': 'Rind',
    'agr.hd.png': 'Rind',
    'g.hd.png': 'Geflügel',
    'agg.hd.png': 'Geflügel',
    'l.hd.png': 'Lamm',
    'agl.hd.png': 'Lamm',
    'mv.hd.png': 'Vital',
    'a.hd.png': 'Alkohol',
};

// Firebase Setup
const db = admin.firestore();

/**
 * gets HTML after get request and loads it into cheerio
 * 
 * @param {String} baseURL 
 * @param {String} endpoint
 * @return {CheerioElement} html loaded into cheerio
 */
const getHtml = async (baseURL, endpoint) => {
    const response = await axios.get(baseURL + endpoint);
    return cheerio.load(response.data);
};

/**
 * Returns Array of Dish Objects
 * @param {Array.<CheerioElement>} rawDays 
 */
const getDishes = (rawDays) => {
    const dishes = [];

    rawDays.map((day, index) => {
        const rawDay = cheerio.load(day);
        const rawDate = rawDay('tbody tr th:first-of-type').text().replace('Gericht am ', '');

        const rawDishes = rawDay('tbody tr:not(:first-child)').toArray();

        rawDishes.map((dish, index) => {
            const rawDish = cheerio.load(dish);

            const properties = rawDish('td.properties img').toArray().map((item, index) => {
                const rawItem = cheerio.load(item);
                return PROPERTIES[rawItem('*').attr('src').split('img/menu/iconProp_').pop()];
            })
            dishes.push(
                new Dish(
                    new Date(moment(rawDate, 'DD-MM.YYYY')),
                    rawDish('td strong').text(),
                    rawDish('td:last-child').text().substring(0, 4),
                    properties,
                )
            );
            return 'dish done';
        });
        return 'days done';
    });
    return dishes;
};

/**
 * Saves Dishes to database
 * 
 * @param {Array.<Dish>} dishes 
 * @return Returns Array of Promises with the write times of Articles
 */
const saveDishes = async (dishes) => {
    const firestore = db.collection('hochschulen').doc('fhkiel')
        .collection('mensa');
    const promiseSaves = dishes.map(async dish => {
        let count = await firestore
            .where('name', '==', dish.name)
            .where('date', '==', dish.date)
            .get()
            .then((snap) => {
                return snap.size;
            });

        if (count === 0) {
            return await firestore
                .doc()
                .set({
                    date: dish.date,
                    name: dish.name,
                    price: dish.price,
                    tags: dish.tags,
                    mensa: dish.mensa,
                    rating: dish.rating
                })
                .catch(err => {
                    console.error('Error writing document: ', err);
                })
        }
        
        return await Promise.all(promiseSaves);
    })

    return await Promise.all(promiseSaves);
}

/**
 * Scrapes the website of the 'Schwentine Mensa' for dishes and
 * saves them to Firestore.
 * @return Returns Array of Promises with the write times of Dishes
 */
exports.scrapeMensa = 
    functions.pubsub.schedule('*/10 * * * *').onRun( async (context) => {
        const html = await getHtml(BASE_URL, URL_PATHS['Schwentine Mensa']);
        const rawDays = html('div#day table tbody tr').toArray();
        const dishes = await getDishes(rawDays);

        const savedDishes = await saveDishes(dishes);
        return savedDishes;
    });


const scrapeMensa = async () => {
    const html = await getHtml(BASE_URL, URL_PATHS['Mensa 1']);
    const rawDays = html('div#days table').toArray();
    const dishes = await getDishes(rawDays);

    const savedDishes = await saveDishes(dishes);
    return saveDishes;
};

scrapeMensa();