$(document).ready(function() {
	getPromoMessage();
});

function getPromoMessage(){
	//get isbn number from page
	var isbn = $('#discountPriceISBN').text();

	//construct restlet url
        // url = 'http://vyrestaging-cambridge.cup.cam.ac.uk/ws/ecommerce/special/promotion/9780521707787';
	var url = 'http://'+document.domain+'/ws/ecommerce/special/promotion/'+isbn ;

	//send ajax request if country is allowed
	if(isCountryAllowed()){
           sendAjaxRequst(url);
        }
}

function isCountryAllowed(){
    var validCountry = 'en_GB';
    var currentCountry = $('#inLocale').text();
    
    if(validCountry == currentCountry ){
       return true;
    }
    return false;
}

function sendAjaxRequst(url){
	//call restlet
	$.ajax({
		type: 'GET',
		url: url,
		dataType: 'xml',
		timeout: 1000,
		async: true,
		success: function(xml) {
			//validate xml if restcall is successful
			validateSpecialPromo(xml);
		}
	}); 
}

function validateSpecialPromo(xml){
	//get isbn number from page
	var isbn = $('#discountPriceISBN').text();

	//validate return xml for specail promotion
	var xmlisbn = $(xml).find('specialPromo').attr('isbn');

	if (isbn == xmlisbn) {
		//get message from xml
		var message = $(xml).find('specialPromo').text();
		
		//display message
		showPromoMessage(message);
	}
}

function showPromoMessage(message){
    //set message style
    $("#specialMessage").css({
           'color': 'red',
           'font-size': '0.8em',
           'font-weight': 'bold',
           'padding-left':'5px'
    });

    //set message text
    $("#specialMessage").append(" "+message);
}

