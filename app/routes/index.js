
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Remote Steam Powered Robotics' });
};

exports.helloworld = function(req, res) { 
  res.render('helloworld', { title: 'Hello, World!', description: 'test'});
};

exports.userlist = function(db) { 
	return function(req, res) { 
		var collection = db.get('usercollection');
		collection.find({}, {}, function(e, docs) {
			res.render('userlist', {
				"userlist": docs
			});
		});
	};
};

exports.newuser = function(req, res) { 
	res.render('newuser', { title: 'Add New User' });
};

exports.adduser = function(db) { 
	return function(req, res) { 
		var userName = req.body.username; 
		var userEmail = req.body.useremail;

		var collection = db.get('usercollection');

		collection.insert({ 
			"username" : userName, 
			"email" : userEmail
		}, function(err, doc) { 
			if (err) { 
				// return an error
				res.send("There was a problem adding the user");
			} else {
				// reset the address bar
				res.location("userlist");
				// redirect the user to the success page
				res.redirect("userlist");
			}
		});
	};
};
