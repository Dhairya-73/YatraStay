const mongoose=require("mongoose");
const initdata = require("./data.js"); //data which is to insert in listing model
const Listing = require("../models/listing.js"); //model to require in which data to be insert

let Mongo_url="mongodb://127.0.0.1:27017/wanderlust";

main()
.then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect(Mongo_url);
}

const initDB = async () => {
    await Listing.deleteMany({});
    initdata.data=initdata.data.map((obj)=>({...obj,owner:"69403914855918dc0017d67f"}));
    await Listing.insertMany(initdata.data);
    console.log("data intialized");
};
initDB();