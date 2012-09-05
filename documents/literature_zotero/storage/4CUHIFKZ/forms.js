/**
 * Vérification des données saisies dans le formulaire form
 * @param {Object} form
 */
function verify_form ( form, mandatory, ctrl ) {
	var error = new Array('mandatory'); error['mandatory']= new Array();
	if ( ! isset(ctrl) ) var ctrl = new Array();
		
	//Vérifcation pour les champs obligatoire peut être inexistant
	if ( isset(mandatory) ) {
		for ( var i=0; i<mandatory.length ; ++i )
			if ( ! ($(mandatory[i]))  ) error['mandatory'].push(String(mandatory[i]).replace(/([0-9_]*\[.*)*([0-9_]+)*$/,'') ) ;		
	}
	form.getElements().each(function(elem) {
	  	$w(elem.className).each(function(style) {
	  		if ( style== 'mandatory' ) {
				//Champs obligatoires
				if ( elem.value =='' ) error['mandatory'].push(String(elem.id).replace(/([0-9_]*\[.*)*([0-9_]+)*$/,'') ) ;
			} else if ( ctrl.indexOf('int') != -1 && style== 'int' ) {
				//Entier
				if ( elem.value !='' && isNaN( elem.value ) ) error.push(String(elem.id).replace(/([0-9_]*\[.*)*([0-9_]+)*$/,'')) ;
			} else if ( ctrl.indexOf('email') != -1 && style== 'email') {
				//Email
				if ( elem.value !='' && ! verifyEmail( elem.value ) ) error.push("email") ;
			}
	  	});
	});

	alert_error(error);
	return (error.length==1 && error['mandatory'].length==0 )  ;
}


function alert_error( errors ) {
	if ( errors.length>1 || errors['mandatory'].length>0 ) {
		msg_txt = "______________________________________________\n\n";
		
		(errors.uniq()).each(function(error) {	  
			if ( error=='mandatory' ) {
				if ( errors['mandatory'].length>0 ) {
					if ( errors['mandatory'].length==1 ) {
						msg_txt += "- " + getLangText('check_error_form')+ "\n";
					} else {
						msg_txt += "- " + getLangText('check_errors_form')+ "\n";
					}					
					errors[error].each(function(field){
						msg_txt += " -- " +getLangText(field+"_required")+ "\n";
					});
				}
			} else {
				msg_txt += "- " + getLangText(error+"_error") + "\n";
			}
		});
		msg_txt += "______________________________________________\n";
		alert( msg_txt );
	}
}