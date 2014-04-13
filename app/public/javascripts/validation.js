window.onload = function() {

	// get values
	var formEmail 			 = document.getElementById('formEmail');
	var formPassword 	     = document.getElementById('formPassword');
	var formConfirmPassword  = document.getElementById('formConfirmPassword');

	// change classes
	var emailGroup 			 = document.getElementById('emailGroup');
	var passwordGroup 	     = document.getElementById('passwordGroup');
	var passwordConfirmGroup = document.getElementById('passwordConfirmGroup');

	// change displays 
	var emailValidate			 = document.getElementById('emailValidate');
	var passwordValidate		 = document.getElementById('passwordValidate');
	var passwordSize 			 = document.getElementById('passwordSize');
	var confirmPasswordValidate  = document.getElementById('confirmPasswordValidate');

	// submit
	var submitButton		 = document.getElementById('submitButton');

	submitButton.onclick = function() { 
		emailValidate.style.display 			= 'none';
		passwordValidate.style.display 		    = 'none';
		passwordSize.style.display  			= 'none';
		confirmPasswordValidate.style.display 	= 'none';


		emailGroup.className 			  = 'form-group';
		passwordGroup.className 		  = 'form-group';
		passwordConfirmGroup.className    = 'form-group';

		// isValid = [emailValid, passwordValid, passwordSize, confirmPasswordMatch]
		var isValid = [0, 0, 0, 0];

		// check email
		if(validateEmail(formEmail.value)) {
			isValid[0] = 1; 
		}

		// check password exists and password size
		if(formPassword.value) {
			isValid[1] = 1;
			if(formPassword.value.length > 4 && formPassword.value.length < 24)
				isValid[2] = 1;
		}

		// check password match
		if(formPassword.value == formConfirmPassword.value) { 
			isValid[3] = 1;
		}

		
		// check isValid
		if(isValid[0] == 1 && isValid[1] == 1 && isValid[2] == 1 && isValid[3] == 1)
			return true;

		if(isValid[0] == 0) {
			emailValidate.style.display 	  = 'block';
			emailGroup.className 			  = 'form-group has-error';
		}

		if(isValid[1] == 0) {
			passwordValidate.style.display    = 'block';
			passwordGroup.className 		  = 'form-group has-error';
		}

		if(isValid[2] == 0) {
			passwordSize.style.display   	  = 'block';
			passwordGroup.className 		  = 'form-group has-error';
		}

		if(isValid[3] == 0) {
			confirmPasswordValidate.style.display = 'block';
			passwordConfirmGroup.className	      = 'form-group has-error';
		}

		return false;

	}

	function validateEmail(email) { 
	    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(email);
	} 

}