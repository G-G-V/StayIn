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
    await Listing.insertMany(initData.data);        // the way we have exported in the data file, herewe treat it like an object.
    console.log("data was initialized");
}

// initDB();