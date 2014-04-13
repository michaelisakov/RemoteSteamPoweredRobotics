// app/routes.js
module.exports = function(app, io, cmd, passport) {

	var socket = require('./socket.js');
	var admin  = require('./admin.js');
	var Page   = require('./models/page.js');

	var isPanel = "panel",
		isTerminal = "terminal"; 

	// var pageDocument;

	// Page.findById(, function(err, doc) { 
	// 	pageDocument = docs[0];
	// }); 

	var description = 'Welcome to the Cooper Union Remote Steam Powered Robotics Project. Developed in collaboration with The Cooper Union Center for Innovation and Applied Technology, Carnegie Mellon University, and RoPro Design.';

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		if(req.isAuthenticated()) {
			res.redirect('/profile')
		} else {
			res.render('index.jade', { title: 'Remote Steam Powered Robotics',
									   desc: description });
		}
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	app.get('/login', function(req, res) { 
		if(req.isAuthenticated()) {
			res.redirect('/profile')
		} else {
			res.render('login.jade', { title: 'Remote Steam Powered Robotics', 
									   message: req.flash('loginMessage'),
									   desc: description });
		}
	});

	// =====================================
	// SIGNUP ==============================
	// =====================================
	app.get('/signup', function(req, res) {
		if(req.isAuthenticated()) {
			res.redirect('/profile')
		} else {
			// render the page and pass in any flash data if it exists
			res.render('signup.jade', { title: 'Remote Steam Powered Robotics',
										message: req.flash('signupMessage'),
										success_msg: req.flash('signupSuccessMessage'),
									    desc: description });
		}
	});

	// =====================================
	// PROFILE SECTION =====================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.jade', {
			user : req.user // get the user out of session and pass to template
		});
	});


	app.get('/panel', socket.terminal(io, cmd, isPanel));

	// app.get('/panel', isLoggedIn, function(req, res) {
	// 	res.render('panel.jade', {
	// 		user : req.user // get the user out of the request and pass it to our panel template
	// 	});
	// });

	// app.get('/terminal', socket.terminal(io, cmd, isTerminal));

	// app.get('/admin', admin.)

	// app.get('/admin', )

	// app.get('/terminal', socket.terminal(io)); 

	// exports.terminal = function(io) { 
	// 	return function(req, res) {
	// 		
	//		// ALL THE SOCKET FUNCTIONALITY
	//		// START CHILD PROCESS 
	//		// EVENT STDIN & STDOUT & STDERR
	//		
	// 		res.render('terminal.jade', { 
	// 			user : req.user
	// 		});
	// 	}
	// }

	app.get('/about', isLoggedIn, function(req, res) { 
		res.render('about.jade', {
			user : req.user
		});
	});
	
	// =====================================
	// LOGOUT ==============================
	// =====================================

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/signup',
		failureRedirect : '/signup',
		failureFlash	: true
	}));

	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/panel',
		failureRedirect : '/login',
		failureFlash	: true
	}));

	// =====================================
	// 404 =================================
	// =====================================

	app.use(function(req, res, next) { 
		res.status(404);

		if(req.accepts('html')) {
			res.render('404.jade', { url: req.url });
			return
		} else if(req.accepts('json')) {
			res.send({ error: 'Not found' });
			return;
		} else {
			res.type('txt').send('Not found');
		}
	});

};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {


	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
};