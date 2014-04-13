// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var bcrypt 	   	  = require('bcrypt-nodejs');

// load up the user model
var User 		  = require('../models/user.js');

module.exports = function(passport) { 

	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) { 
    	done(null, user.id); 
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) { 
    	User.findById(id, function(err, user) { 
    		done(err, user); 
    	});
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

	passport.use('local-signup', new LocalStrategy({
		// username and password by default, add email
		usernameField : 'email', 
		// emailField	  : 'email',
		passwordField : 'password',
		passReqToCallback : true // pass the request to callback
	},
	function(req, email, password, done) {

		// asynchronous
		// User.findONe won't fire unless data is sent back
		process.nextTick(function() {

			// find a user whose email is the same as the forms email
			// we are checking to see if the user trying to login already exists
			User.findOne({ 'local.email' : email }, function(err, user) {
				// if errors, return error
				if(err)
					return done(err);

				// check if there is a user with that email
				if(user) {
					return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
				} else { 

					// if there is no user with that email
					// create the user
					var newUser = new User();

					console.log('NEW USER');
					console.log(newUser);

					newUser.local.email      = email;
					newUser.local.password 	 = newUser.generateHash(password);
					newUser.local.created_at = new Date().getTime();
					newUser.local.admin		 = 0; 

					console.log(newUser);

					// save the user
					newUser.save(function(err) { 
						if (err) {
							console.log('SAVE PROBLEM');
							throw err;
						}
						return done(null, newUser, req.flash('signupSuccessMessage', 'You have successfully registered! Check your email to activate your account.'));
					});
				}	

			});

			// User.findOne({'local.username' : username }, function(err, user) { 
			// 	if(err)
			// 		return done(err); 
			// 	if(user) { 
			// 		return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
			// 	} else { 
			// 		newUser.local.username = username; 
			// 		newUser.save(function(err) { 
			// 			if(err)
			// 				throw err;
			// 			return done(null, newUser);
			// 		});	
			// 	}
			// });

		});
	
	}));

	passport.use('local-login', new LocalStrategy({
		usernameField : 'email', 
		passwordField : 'password', 
		passReqToCallback : true
	}, function(req, email, password, done) { 
		User.findOne({ 'local.email' : email }, function(err, user) { 
				if(err)
					return done(err);

				if(!user)
					return done(null, false, req.flash('loginMessage', "Your email isn't in our database, have you Signed up?" ));

				if(!user.validPassword(password))
					return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

				return done(null, user);
			});
	}));
};