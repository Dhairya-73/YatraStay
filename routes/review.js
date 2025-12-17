const express=require("express");
const router=express.Router({mergeParams:true});
const Listing=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const Review=require("../models/review.js");
const {ServersideReviewSchemaValidate,isLoggedIn,isAuthor}=require("../middleware.js");


//Post route for reviews
router.post("/",isLoggedIn,ServersideReviewSchemaValidate,wrapAsync(async(req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview= new Review(req.body.review);
    newReview.author=req.user._id;
    listing.reviews.push(newReview);
    console.log(listing);
    await newReview.save();
    await listing.save();
    req.flash("success","Review created successfully");
    res.redirect(`/listings/${listing._id}`);
}));

//delete route for  reviews
router.delete("/:reviewId",isLoggedIn,isAuthor,wrapAsync(async(req,res)=>{
    let {id,reviewId}=req.params;
    console.log(id);
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review deleted succesfully");
    res.redirect(`/listings/${id}`);
}));

module.exports=router;