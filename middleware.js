const Listing=require("./models/listing.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./ServerSchemaValidate.js");
const Review=require("./models/review.js");

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must be logged in to access listing");
        res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner=async(req,res,next)=>{
    let{id}=req.params;
    let listing=await Listing.findById(id);
    console.log(listing.owner);
    console.log(res.locals.CurrUser);
    if(!listing.owner.equals(res.locals.CurrUser._id)){
        req.flash("error","you dont have permission to edit or delete");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

//function for validating at server side
module.exports.Serversidevalidatelisting=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(404,errMsg);
    }
    else{
        next();
    }
}

module.exports.ServersideReviewSchemaValidate=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        console.log(error);
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(404,errMsg);
    }
    else{
        next();
    }
}

module.exports.isAuthor=async(req,res,next)=>{
    let{id,reviewId}=req.params;
    let review=await Review.findById(reviewId);
    console.log(id);
    if(!review.author.equals(res.locals.CurrUser._id)){
        req.flash("error","You are not owner of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}