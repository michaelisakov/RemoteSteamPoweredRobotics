window.onload = function() {

	// get values
	var formEmail 			 = document.getElementById('formEmail');
	var formPassword 	     = document.getElementById('formPassword');

	// change classes
	var emailGroup 			 = document.getElementById('emailGroup');
	var passwordGroup 	     = document.getElementById('passwordGroup');

	// change displays 
	var emailValidate	     = document.getElementById('emailValidate');
	var passwordValidate     = document.getElementById('passwordValidate');

	// submit
	var submitButton		 = document.getElementById('submitButton');

	submitButton.onclick = function() { 
		
		emailValidate.style.display 	  = 'none';
		passwordValidate.style.display 	  = 'none';

		emailGroup.className 			  = 'form-group';
		passwordGroup.className 		  = 'form-group';

		// isValid = [emailValid, passwordValid]
		var isValid = [0, 0];

		// check email
		if(validateEmail(formEmail.value)) {
			isValid[0] = 1; 
		}

		// check password exists and password size
		if(formPassword.value) {
			isValid[1] = 1;
		}
		
		// check isValid
		if(isValid[0] == 1 && isValid[1] == 1)
			return true;

		if(isValid[0] == 0) {
			emailValidate.style.display 	  = 'block';
			emailGroup.className 			  = 'form-group has-error';
		}

		if(isValid[1] == 0) {
			passwordValidate.style.display    = 'block';
			passwordGroup.className 		  = 'form-group has-error';
		}

		return false;

	}

	function validateEmail(email) { 
	    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(email);
	} 

}