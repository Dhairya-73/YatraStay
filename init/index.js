// const mongoose=require("mongoose");
// const initdata = require("./data.js"); //data which is to insert in listing model
// const Listing = require("../models/listing.js"); //model to require in which data to be insert

// let Mongo_url="mongodb://127.0.0.1:27017/wanderlust";

// main()
// .then(()=>{
//     console.log("connected to DB");
// })
// .catch((err)=>{
//     console.log(err);
// })
// async function main(){
//     await mongoose.connect(Mongo_url);
// }

// const initDB = async () => {
//     await Listing.deleteMany({});
//     initdata.data=initdata.data.map((obj)=>({...obj,owner:"69403914855918dc0017d67f"}));
//     await Listing.insertMany(initdata.data);
//     console.log("data intialized");
// };
// initDB();

require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");
const Listing = require("../models/listing");
const { data } = require("./data");
const { cloudinary } = require("../cloudConfig");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// 🔑 VALID OWNER ID (you already verified this exists)
const OWNER_ID = "69403914855918dc0017d67f";

async function seedDB() {
  await mongoose.connect(MONGO_URL);
  console.log("MongoDB connected");

  // remove old listings
  await Listing.deleteMany({});
  console.log("Old listings removed");

  // loop exactly like your old insertMany logic
  for (let item of data) {
    console.log("Uploading:", item.title);

    // upload Unsplash image to Cloudinary
    const result = await cloudinary.uploader.upload(item.image.url, {
      folder: "YatraStay_Dev",
    });

    // create listing with owner + cloudinary image
    await Listing.create({
      ...item,
      owner: OWNER_ID, // ✅ SAME LOGIC AS YOUR ORIGINAL CODE
      image: {
        url: result.secure_url,
        filename: result.public_id,
      },
    });
  }

  console.log("✅ Data initialized with owner + Cloudinary images");
  mongoose.connection.close();
}

seedDB().catch((err) => {
  console.error(err);
  mongoose.connection.close();
});
