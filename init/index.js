const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/stayin";

main()
    .then(() => {
        console.log("connectd to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});      // cleansing the db for old residual data
    initData.data = initData.data.map((obj) => ({...obj, owner: '697e066e269f6d6b3ac5c9ca'}));            // map is an array function, it doesn't change in the array, it ends up creating a new array.
    await Listing.insertMany(initData.data);        // the way we have exported in the data file, herewe treat it like an object.
    console.log("data was initialized");
}

// initDB();