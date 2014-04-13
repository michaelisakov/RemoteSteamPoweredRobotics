// app/models/user.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our log model
var logSchema = mongoose.Schema({
	userLogs	: { 
		email	   : { type: String },
		command	   : { type: String },
		created_at : { type: String }
	}
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Log', logSchema);