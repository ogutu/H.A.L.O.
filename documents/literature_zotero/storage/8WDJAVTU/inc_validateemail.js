function validateEmail(email) {
	var invalidChars = " /:,;";
	
	if (email == "") {
		//no email entered
		return false
	}

	//test for invalid characters
	var badChar;
	for (i=0; i<invalidChars.length; i++) {
		badChar = invalidChars.charAt(i)
		if (email.indexOf(badChar,0) != -1) {
			//invalid character found
			return false
		}
	}
	
	//find the position of '@' character 
	var atPos = email.indexOf("@",1)
	if (atPos == -1) {
		//contains no '@'
		return false
	}
	if (email.indexOf("@",atPos+1) != -1) {
		//multiple '@' chars are not allowed
		return false
	}

	//find the position of '.' character
	var periodPos = email.indexOf(".",atPos)
	if (periodPos == -1) {
		//contains no '.' after '@'
		return false
	}
	if (email.length - email.lastIndexOf(".") > 5 || email.length - email.lastIndexOf(".") < 3) {
		//there are less than 2 characters after the '.'
		return false
	}

	//if we get to here then the format of the email address is correct
	return true;
}