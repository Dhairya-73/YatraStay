const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsmate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js")

app.set("view engine","ejs");
app.set("path",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method")); 
app.engine('ejs',ejsmate); //for using same navbar in every tamplate we use ejs mate
app.use(express.static(path.join(__dirname,"public")));


let Mongo_url="mongodb://127.0.0.1:27017/wanderlust";

main()
.then(()=>{
    console.log("connection succesful");
})
.catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect(Mongo_url);
}

app.get('/',(req,res)=>{
    res.send("hi,i am root");
})

app.get('/listings',async (req,res)=>{
    const allListings= await Listing.find({});
    res.render("./listings/index.ejs",{ allListings });
})

app.get('/listings/new',(req,res)=>{
    res.render("./listings/new_form.ejs");
})
//always write listings/new ne uper then listings/:id 
// kemke ae new ne id ne jem sodhe ane na made etle error aape if niche hoy toh.

app.get('/listings/:id',async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("./listings/show.ejs",{listing});
})

app.post('/listings',wrapAsync(async (req,res)=>{
    let newlisting=new Listing(req.body.listing);
    console.log(newlisting);
    await newlisting.save();
    res.redirect("/listings");
}));

//Edit route
app.get("/listings/:id/edit",async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("./listings/edit_form.ejs",{listing});
})

//Update route
app.put("/listings/:id",async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
})

//Delete route
app.delete("/listings/:id",async (req,res)=>{
    let {id}=req.params;
    const deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
})

// app.use(
//     (err,req,res,next)=>{
//         res.send("something went wrong");
//     }
// )   

// app.get('/testing',(req,res)=>{
//     let sample=new Listing({
//         title:"Grand Villa",
//         description:"villa is good",
//         price:1200,
//         location:"ahmedabad",
//         country:"india",
//     });
//     sample.save();
//     console.log("sample was savd");
//     res.send("succesful testing");
// })



app.listen(8080,()=>{
    console.log("server is listening on port 8080");
})