// io.sockets.on('connection', function(socket) {
// 	socket.emit('message', { hello: 'world' });
// 	socket.on('event', function(data) {
// 		console.log(data);
// 	});
// });
var config = require('./config/socket.js');
var moment = require('moment');
var cpu	   = require('windows-cpu');

var net = require('net');
var defPort = 10052; 
var client;

var cpu_usage, rootUser;

var Log    = require('./models/log.js');
var Std    = require('./models/std.js');

var count  = 50;
var connectionCount = 0; 

var logsObject = { 
	latest : { test: 'latest' }
};

// var socketsCount; 
var tekkotsuProcess;
var isRunningProcess = false; 
var commandEnteredBuffer;

function getLatestLogs(num) {
	logsObject.latest = {};
	var query = Log.find().sort({'userLogs.created_at' : 'desc'}).limit(num);
	query.exec(function(err, posts) {
		if(err) {
			console.log('ERROR');
			throw err;
		} else if(logsObject.latest === {}) {
			console.log('ERROR Writing object');
		} else {
			logsObject.latest = posts;
		}
	});
};

function getCpuUsage() {
	cpu.totalLoad(function(error, results) {
		if(error) { 
			return console.log(error);
		} else {
			cpu_usage = results;
		}
	});
}

function areWeRoot(rootUser, currentUser) {
	if(rootUser == currentUser)
		return true;
	else 
		return false;
}

setInterval(function() {getLatestLogs(count)}, 1000);
setInterval(function() {getCpuUsage()}, 1000);

exports.terminal = function(io, cmd, isPage) { 

		io.sockets.on('connection', function(socket) {
			// socketsCount++;
			// io.sockets.emit('count', {
			// 	number: socketsCount
			// });
			connectionCount++; 
			io.sockets.emit('numberOfConnections', {count: connectionCount});

			socket.emit('isRunningProcess', { isRunningProcess: isRunningProcess });

			socket.emit('welcome', config.connect );

			socket.emit('updateUserLogs', logsObject.latest);

			setInterval(function() { io.sockets.emit('cpu', { usage: cpu_usage }) }, 1000);

			socket.on('commandEntered', function(data) {
				// console.log(data);
				var isRoot = areWeRoot(rootUser, data.email); 
				data.root = isRoot;

				if(data.root == false)
					io.sockets.emit('printCommand', data);
				else
					socket.emit('printCommand', data);

				if(isRunningProcess) { 
					if(rootUser == data.email) {
						// Save only if actually entering commands; disregard chat
						var newLog = new Log();

						newLog.userLogs.email = data.email;
						newLog.userLogs.command = data.command;
						newLog.userLogs.created_at = data.created_at;
						
						newLog.save(function(err) { 
							if(err) 
								throw err;
							console.log(data.email + ' entered command');
						});

						// if (client){ 
						// 	console.log('NET client exists');
						// 	client.write(['t', 52]);
						// 	// convert 't' + 5 to binary
						// 	// client.write(binary)
						// }

						tekkotsuProcess.stdin.write(data.command + '\n');
						console.log('STDIN WRITE' + data.command);
					} 
				}

			});

			socket.on('updateUserLogs', function(data) {
				if(data.update) {
					socket.emit('updateUserLogs', logsObject.latest);
				} else {
					console.log('Not authorized');
				}
			});

			socket.on('buttonCommand', function(data) { 
				if(isRunningProcess) { 
					if(data.user == rootUser) {
						tekkotsuProcess.stdin.write(data.command + '\n');
						socket.emit('buttonCommand_error', { msg: '', confirm: true });
					} else { 
						socket.emit('buttonCommand_error', { msg: 'You are not root. Contact current root: ' + rootUser});
					}
				} else {
					socket.emit('buttonCommand_error', { msg: 'Process not running. Start process. '});
				}
			});

			socket.on('createChild', function(data) {
				console.log("CONTINUING?");
				if(!rootUser) {
					if(data.created === true) {
						rootUser = data.user;
						console.log('SPAWN');
						tekkotsuProcess = cmd.spawn('cmd');

						// client = net.connect({port: defPort}, function() {
						// 	console.log('client connected');
						// });

						// client.on('data', function(data) {
						// 	console.log(data.toString());
						// 	client.end();
						// });

						// client.on('end', function() { 
						// 	console.log('client disconnected');
						// });

						tekkotsuProcess.stdout.on('data', function(data) {
							data = data.toString();
							console.log('stdout:' + data);
							socket.emit('stdout', data);
						});

						tekkotsuProcess.stderr.on('data', function(data) { 
							data = data.toString(); 
							socket.emit('stderr', data);
						});

						isRunningProcess = true; 

						console.log('SPAWNED CHILD PID: ' + tekkotsuProcess.pid);

						returnObject = {
							created: true,
							pid: tekkotsuProcess.pid
						};

						socket.emit('createChild', returnObject);
					} 
				} else if(rootUser) {
					if(data.created === false) {
						tekkotsuProcess.kill();
						rootUser = undefined;
						isRunningProcess = false; 

						console.log('PROCESS KILLED');

						returnObject = {
							created: false,
							pid: false,
							rootUser: true
						};

						socket.emit('createChild', returnObject);
					}
					if(rootUser !== data.user) 
						socket.emit('childError', { content: 'Child process already running. Root User: ' + rootUser });
						console.log("Do not create second process");
				}
			});

			socket.on('disconnect', function() { 
				if(isRunningProcess) {
					tekkotsuProcess.kill();
					rootUser = undefined;
					console.log('PROCESS KILLED');
				}
				console.log('DISCONNECTED');
				// io.sockets.emit('disconnected', { disconnected: true });
				// io.sockets.emit('count', { number: socketsCount });
				connectionCount--;
				io.sockets.emit('numberOfConnections', {count: connectionCount});
			});

		});

		return function(req, res) {
			if(!req.isAuthenticated()) { 
				res.redirect('/');
			} else { 

			// ALL THE SOCKET FUNCTIONALITY
			// START CHILD PROCESS 
			// EVENT STDIN & STDOUT & STDERR
			if(isPage === "panel") {
				res.render('panel.jade', {
					user: req.user
				});
			} else if(isPage === "terminal") { 
				res.render('terminal.jade', {
					user: req.user
				});
			}
		}
	}
}