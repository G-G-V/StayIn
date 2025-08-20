const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    // image: {
    //     type: String,         // taking it as an URL (basic), can also set some image as default. And can improve the logic of this whole schema.
    //     default:              // no image was sent in testing, so it would be 'undefined', and not an empty string which we have addressed after this, that is when the image is sent but is an empty string.
    //         "https://images.unsplash.com/photo-1621945909946-ecac9ed9dcf4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    //     set: (v) =>           // this logic is set for client, for the user
    //         v === "" 
    //             ? "https://images.unsplash.com/photo-1621945909946-ecac9ed9dcf4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
    //             : v,
    // },
    image: {
        url: {
            type: String,
            default:                             // undefined object sent
                "https://images.unsplash.com/photo-1621945909946-ecac9ed9dcf4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            set: (v) => 
                v === ""
                    ? "https://images.unsplash.com/photo-1621945909946-ecac9ed9dcf4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    : v,
        },                  // fallback in case of empty field routing to default is resolved. 
                            // But the random string entry in the field is yet to be addressed and resoled.
        filename: String,
    },
    price: Number,
    location: String,
    country: String
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;