// app/models/page.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our log model
var pageSchema = mongoose.Schema({
	pageBlocks: { 
		welcome: { 
			title: { type: String },
			description: { type: String },
			footer: {
				title: { type: String },
				description: { type: String }
			} 
		},
		profile: { 
			section1: {
				title: { type: String },
				description: { type:  String }
			}, 
			section2: {
				title: { type: String },
				description: { type: String }
			}
		},
		about: {
			section1: {
				title: { type: String }, 
				description: { type: String }
			},			
			section2: { 
				title: { type: String },
				description: { type: String }
			},
			section3: {
				title: { type: String },
				description: { type: String }
			}
		}
	}
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Pages', pageSchema);