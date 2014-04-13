window.onload = function() {
	var socket 			 = io.connect('http://localhost:3000'); 
	var startChild 		 = document.getElementById('startChild');
	var startChildIcon	 = document.getElementById('startChildIcon');

	var terminal 		 = document.getElementById('terminal');
	var prompt 	 		 = document.getElementById('prompt');
	var terminalBuffer   = document.getElementById('terminal-buffer');
	var terminalBuffer 	 = document.getElementById('terminal-buffer');

	var userEmail 		 = document.getElementById('userEmail').innerHTML;
	var flashMessage	 = document.getElementById('flashMessage');
	var updateLogsButton = document.getElementById('updateLogsButton');
	var logTable 		 = document.getElementById('logTable');
	var logTableBody	 = document.getElementById('tbody');

	var welcomeMsg 		 = '';
	var commandBuffer    = [];
	var whereInBuffer	 = 0; 
	var cpu_chart		 = [];

	var connectCircle   	= document.getElementById('connectCircle');
	var numberOfConnections = document.getElementById('numberOfConnections');

	var smoothie = new SmoothieChart();
	smoothie.streamTo(document.getElementById('cpuUsage'));
	var line1 = new TimeSeries();


	var buttonFlashMessage = document.getElementById('buttonFlashMessage');
	var dirButton = document.getElementById('dirButton');
	
	function setOnclickCommand(button, instruction) { 
		button.onclick = function() { 
			var obj = { 
				user: 	 userEmail,
				command: instruction
			};
			socket.emit('buttonCommand', obj);
		}
	}

	setOnclickCommand(dirButton, 'dir');

	socket.on('buttonCommand_error', function(data) { 
		if(data.confirm == true) {
			buttonFlashMessage.style.display = 'none';
		} else {
			buttonFlashMessage.innerHTML = data.msg; 
			buttonFlashMessage.style.display = 'block';
		}
	});

	// Send a signal to the DB to get 
	startChild.onclick = function() { 
		// confirm child created 
		var createChildObject;

		if(startChild.className == "btn btn-danger") {
			createChildObject = {
				created : false
			};
			socket.emit('createChild', createChildObject);
		} else if(startChild.className == "btn btn-success") {
			createChildObject = { 
				created : true,
				user    : userEmail
			};
			socket.emit('createChild', createChildObject);		
		} else {
			console.log("Nothing happened");
		}
	}

	socket.on('createChild', function(data) { 
		if(data) {
			if(data.created === true) {
				startChild.className 	 = "btn btn-danger";
				startChildIcon.className = "fa fa-pause";
				terminal.innerHTML		 = terminal.innerHTML + "</br>" + "<b>HAL > </b>Child process started on Beagle Bone with process id " + data.pid;
				clearError();
				updateScroll();
			} else if(data.created === false) {
				startChild.className 	 = "btn btn-success";
				startChildIcon.className = "fa fa-power-off";
				terminal.innerHTML		 = terminal.innerHTML + "</br>" + "<b>HAL > </b>Child process ended on Beagle Bone";
				updateScroll();
			} else {
				console.log('createChild data object is undefined');
			}
		} 
	});

	// On prompt enter
	prompt.onkeyup = function(e) { 
		e.which = e.which || e.keyCode; 
		if(e.which == 13) { 
			if(prompt.value == 'clc') {
				if(welcomeMsg) 
					terminal.innerHTML = welcomeMsg
				else 
					terminal.innerHTML = 'Cleared terminal - not connected to server stream';
				prompt.value = '';
				return;
			}

			if(prompt.value == '') 
				return error('Please enter a command');

			var commandObject = {
				email 	   : userEmail,
				command    : prompt.value,
				created_at : new Date().getTime()
			};
			
			if(commandBuffer.length > 20) {
				commandBuffer.pop(commandBuffer.length);
				commandBuffer.unshift(prompt.value);
				var toBuffer = JSON.stringify(commandBuffer);
				toBuffer = toBuffer.substring(0, toBuffer.length);
				terminalBuffer.innerHTML = toBuffer;
			} else { 
				commandBuffer.unshift(prompt.value);
				var toBuffer = JSON.stringify(commandBuffer);
				toBuffer = toBuffer.substring(0, toBuffer.length);
				terminalBuffer.innerHTML = toBuffer;
			}

			socket.emit('commandEntered', commandObject);
		} else if(e.which == 38) { 
			// up 
			if(commandBuffer == [] || commandBuffer.length === 0) { 
				return;
			} else if(commandBuffer.length > 0) { 
				if(whereInBuffer >= 0 && whereInBuffer < commandBuffer.length) {
					prompt.value = commandBuffer[whereInBuffer];
					whereInBuffer++;
				} else if(whereInBuffer >= commandBuffer.length) {
					whereInBuffer = 0;
					prompt.value = commandBuffer[whereInBuffer];
					whereInBuffer++;
				}
			}

		} else if(e.which == 40) {
			// down
			if(commandBuffer == [] || commandBuffer.length === 0) { 
				return;
			} else if(commandBuffer.length > 0) { 
				if(whereInBuffer >= 0 && whereInBuffer < commandBuffer.length) {
					prompt.value = commandBuffer[whereInBuffer];
					whereInBuffer--;
				} else if(whereInBuffer <= commandBuffer.length) {
					whereInBuffer = commandBuffer.length - 1;
					prompt.value = commandBuffer[whereInBuffer];
					whereInBuffer--;
				}
			}
		}
	} 

	socket.on('numberOfConnections', function(data) {
		if(data) { 
			if(data.count > 0) { 
				connectCircle.style.display = "block";
			} else { 
				connectCircle.style.display = "none";
			}
			if(data.count == 1)
				connectCircle.innerHTML = " " + data.count + " User connected";
			else
				connectCircle.innerHTML = " " + data.count + " Users connected";
		} else { 
			console.log("socket.on: Could not get user count");
		}
	});

	socket.on('printCommand', function(data) { 
		// post the message to terminal div
		console.log("Print Command FIRED!");
		console.log(data);
		terminal.innerHTML = terminal.innerHTML + '</br>' + '<b>' + data.email + '</b>' + ' : ' + data.command;

		prompt.value = '';
		updateScroll();
		clearError();
	});

	socket.on('welcome', function(data) { 
		if(data.command) {
			data.command = linkify(data.command);
			terminal.innerHTML = data.email + data.command; 
			welcomeMsg = data.email + data.command;
			console.log(welcomeMsg);
			return welcomeMsg;
		} else { 
			console.log('empty message');
		}
	});

	socket.on('error', function(exception) { 
		if(!exception) {
			console.log('Socket error');
		} else { 
			console.log('Socket error: ' + exception);
		}
	});

	socket.on('close', function(exception) { 
		if(!exception) {
			console.log('Socket closed');
		} else { 
			console.log('Socket closed: ' + exception);
		}

		// notify client 

	});

	socket.on('childError', function(data) {
		return error(data.content);
	});

	socket.on('disconnect', function() { 

	});

	socket.on('cpu', function(data) {
		// console.log(typeof(data.usage));
		// console.log(parseInt(data.usage));
		// console.log(typeof(parseInt(data.usage)));
		line1.append(new Date().getTime(), parseInt(data.usage));
	});

	socket.on('updateUserLogs', function(data) {
		if(data) {
			
			logTableBody.innerHTML = '';

			for(var i = 0; i < data.length; i++) { 

				var row = logTableBody.insertRow(i);

				var cell1 = row.insertCell(0);
				var cell2 = row.insertCell(1);
				var cell3 = row.insertCell(2);
				var cell4 = row.insertCell(3);

				cell1.innerHTML = i; 
				cell2.innerHTML = data[i].userLogs.email;
				cell3.innerHTML = data[i].userLogs.command;

				var newDate 	= new Date(parseFloat(data[i].userLogs.created_at)).toLocaleString(); 
				cell4.innerHTML = newDate;

			}
		} else {
			console.log('error');
		}
	});

	socket.on('stdout', function(data) {
		//console.log(typeof(data));
		// console.log(data);


		// COLOR 

		lines = data.split(/\n|\r|\n/g)
		console.log(lines);
		for(var i = 0; i < lines.length; i ++ ) {
			if(lines[i] === "" || lines[i] === " " || !lines[i] || lines[i] === undefined || lines[i] === false) { 
				//console.log(lines[i]);
			} else { 
				terminal.innerHTML = terminal.innerHTML + "</br>" + "<span style='color:#80BD01'>" + lines[i] + "</span>";
			}
		}

		// console.log(data.split(/\r\n|\r|\n/g));
		// terminal.innerHTML = terminal.innerHTML + "</br>" + data; 
		updateScroll();
	});

	socket.on('stderr', function(data) {
		//console.log(typeof(data));
		// console.log(data);

		// COLOR 

		lines = data.split(/\n|\r|\n/g)
		console.log(lines);
		for(var i = 0; i < lines.length-1; i++ ) {
			if(lines[i] === "" || lines[i] === " " || !lines[i] || lines[i] === undefined || lines[i] === false) { 
				//console.log(lines[i]);
			} else { 
				terminal.innerHTML = terminal.innerHTML + "</br>" + "<span style='color:#CA3C38'>" + lines[i] + "</span>";
			}
		}

		// console.log(data.split(/\r\n|\r|\n/g));
		// terminal.innerHTML = terminal.innerHTML + "</br>" + data; 
		updateScroll();
	});


	updateLogsButton.onclick = function() { 
		var updateLogsObject = {
			update : true
		};

		socket.emit('updateUserLogs', updateLogsObject);

	}

	function updateScroll() {
		var e = document.getElementById('terminal');
			if(e.scrollHeight - e.scrollTop !== e.clientHeight) {
				e.scrollTop = e.scrollHeight;
		}
	}

	function linkify(str) {  
	    var urlRegex =/(\b(https?|ftp|file)key: "value", \/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;  
	    return str.replace(urlRegex, function(url) {  
		    return '<a href="' + url + '">' + url + '</a>';  
		});  
	}

	function error(message) {
		flashMessage.innerHTML = message;
		flashMessage.style.display = 'block';
	}

	function clearError() { 
		flashMessage.innerHTML = '';
		flashMessage.style.display = 'none';
	}

	smoothie.addTimeSeries(line1, 
		{ lineWidth:3 });

}