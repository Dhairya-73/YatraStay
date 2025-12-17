const express=require("express");
const router=express.Router();
const Listing=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js")
const {isLoggedIn,isOwner,Serversidevalidatelisting}=require("../middleware.js");


//Index route
router.get('/',wrapAsync(async (req,res)=>{
    const allListings= await Listing.find({});
    res.render("./listings/index.ejs",{ allListings });
}));

//new route
router.get('/new',isLoggedIn,(req,res)=>{
    res.render("./listings/new_form.ejs");
})
//always write listings/new ne uper then listings/:id 
// kemke ae new ne id ne jem sodhe ane na made etle error aape if niche hoy toh.

//show route
router.get('/:id',wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({path:"reviews",populate:{path:"author",}}).populate("owner");//populate reviews kiya bcz woh simple render karvane        
    //pe id main aa rha the toh populate krne se woh normal data maina aauye
    if(!listing){
        req.flash("error","Listing which you search does not exits");
        res.redirect("/listings");
    }
    else{
    res.render("./listings/show.ejs",{listing});
    }
}));

//create route(for new post)
router.post('/',isLoggedIn,Serversidevalidatelisting,wrapAsync(async (req,res)=>{
    let newlisting=new Listing(req.body.listing);
    newlisting.owner=req.user._id;
    console.log(newlisting);
    await newlisting.save();
    req.flash("success","New post created successfully");
    res.redirect("/listings");
}));


//Edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
    req.flash("error","Listing which you search does not exits");
    res.redirect("/listings");
    }
    else{
    res.render("./listings/edit_form.ejs",{listing});
    }
}));

//Update route
router.put("/:id",isLoggedIn,isOwner,Serversidevalidatelisting,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
        req.flash("success","Post Edited successfully");
    res.redirect(`/listings/${id}`);
}));

//Delete route
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Post deleted successfully");
    res.redirect("/listings");
}));
 
module.exports=router;