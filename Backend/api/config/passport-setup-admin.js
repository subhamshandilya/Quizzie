const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const GooglePlusTokenStrategy = require('passport-google-plus-token')
// const JwtStrategy = require('passport-jwt').Strategy;
const Admin = require('../models/admin');
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
require('dotenv').config()

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    Admin.findById(id).then((user) => {
        done(null, user);
    }).catch((err)=>{
		console.log(err)
	})
});





passport.use('googleAdmin',new GoogleStrategy({
	clientID :process.env.AdminclientID,
	clientSecret: process.env.AdminclientSecret,
	callbackURL: '/auth/admin/google/redirect'
},async(accessToken,refreshToken,profile,done)=>{
	// check if user already exists in our own db
	Admin.findOne({googleId: profile.id}).then((currentUser) => {
		if(currentUser){
			// already have this user
			const token = jwt.sign(
				{
					userType: currentUser.userType,
					userId: currentUser._id,
					email: currentUser.email,
					name: currentUser.name,
					mobileNumber: currentUser.mobileNumber,
				},
				process.env.jwtSecret,
				{
					expiresIn: "1d",
				}
			);


			Admin.findById(currentUser._id).then((result7)=>{
				result7.token = token
				result7.save().then((user)=>{
					done(null,user)
				}).catch((err)=>{
					console.log(err)
				})
			})


		} else {
			// if not, create user in our db
			new Admin({
				_id: new mongoose.Types.ObjectId(),
				googleId: profile.id,
				name: profile.displayName,
				email:profile.emails[0].value,
				isEmailVerified:true
			}).save().then((newUser) => {
				const token = jwt.sign(
					{
						userType: newUser.userType,
						userId: newUser._id,
						email: newUser.email,
						name: newUser.name,
						mobileNumber: newUser.mobileNumber,
						isEmailVerified:newUser.isEmailVerified,
					},
					process.env.jwtSecret,
					{
						expiresIn: "1d",
					}
				);
				Admin.findById(newUser._id).then((result7)=>{
					result7.token = token
					result7.save().then((user)=>{
						done(null,user)
					}).catch((err)=>{
						console.log(err)
					})
				})
			}).catch((err)=>{
				console.log(err)
			})
		}
	}).catch((err)=>{
		console.log(err)
	})
}))



  