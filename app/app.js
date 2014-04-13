// server.js

// set up =====================================================================
var express	 = require('express');
var app 	 = express();
var port 	 = process.env.PORT || 3000; 
var mongoose = require('mongoose');
var passport = require('passport');
var flash 	 = require('connect-flash');
var path 	 = require('path');
var cmd		 = require('child_process');

var configDB = require('./config/database.js');

// configuration ==============================================================
mongoose.connect(configDB.url); // connect to database

require('./config/passport')(passport); // pass pasport for configuration

app.configure(function() { 
	app.use(express.logger('dev')); // log every request sent to console
	app.use(express.cookieParser()); // read cookies 
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());

	app.set('view engine', 'jade'); // jade view engine

	// required for passport
	app.use(express.session({ secret: 'thereisnocowlevel', key: 'express.sid' }));
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages
	app.use(express.static(path.join(__dirname, 'public')));
});

// launch ====================================================================
var server = app.listen(port);
var io = require('socket.io').listen(server);

console.log('Listening on port ' + port);

// routes ====================================================================
require('./routes.js')(app, io, cmd, passport); // load our routes and pass in our app and fully configured passport