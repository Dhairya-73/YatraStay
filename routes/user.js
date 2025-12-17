const express=require("express");
const router=express.Router();
const User=require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

router.get('/signup',(req,res)=>{
    res.render("./users/signup.ejs")
})

router.post('/signup',async(req,res)=>{
    try{
         let {username,email,password}=req.body;
    const newuser=new User({username,email});
    const newregisteruser= await User.register(newuser,password);
    console.log(newregisteruser);
    req.login(newregisteruser,(err)=>{
        if(err){
            return next(err);
        }
         req.flash("success","Welcome to YatraStay");
    res.redirect("/listings");
    })
    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
   
})


router.get('/login',(req,res)=>{
    res.render("./users/login.ejs");
})
router.post('/login',saveRedirectUrl,
    passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),(req,res)=>{
    req.flash("success","Welcome to YatraStay");
    if(res.locals.redirectUrl){
    res.redirect(res.locals.redirectUrl);
    }
    else{
        res.redirect("/listings");
    }
})

router.get('/logout',(req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Log out Successfully");
        res.redirect("/listings");
    });
});

module.exports=router;