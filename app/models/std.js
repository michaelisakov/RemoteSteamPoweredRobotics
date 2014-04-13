// app/models/std.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our std model
var stdSchema = mongoose.Schema({
	host	: { 
		type	   : { type: String },
		command	   : { type: String },
		created_at : { type: String }
	}
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Std', stdSchema);