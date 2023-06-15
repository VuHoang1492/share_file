require('dotenv').config()
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore/lite');


const firebaseConfig = {
    apiKey: process.env.APIKEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app)


module.exports = db