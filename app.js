const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsmate=require("ejs-mate");
const Review=require("./models/review.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./ServerSchemaValidate.js");
const listingrouter=require("./routes/listing.js");
const reviewrouter=require("./routes/review.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const userrouter=require("./routes/user.js");

const sessionOptions={
    secret:"Secretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.CurrUser=req.user;
    next();
})
app.use('/listings',listingrouter);
app.use('/listings/:id/reviews',reviewrouter);
app.use('/',userrouter);


//if any page which is not exist req send send error
app.use((req,res,next)=>{
    next(new ExpressError(404,"page not found"));
});

app.use(
    (err,req,res,next)=>{
        let {statusCode=500,message="something went wrong"}=err;
        res.render("error.ejs",{message});
    }
);   

app.listen(8080,()=>{
    console.log("server is listening on port 8080");
})