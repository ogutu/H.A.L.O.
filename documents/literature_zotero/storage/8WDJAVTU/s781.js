	//setup the hover
	$(document).ready(function() {
		
		$('#miniBasketHover').hide();
		
		// toggles the slickbox on clicking the noted link 
		$('#showLines, #miniBasketHover').mouseover(function() {
			$('#miniBasketHover').slideDown('slow');
			if(window.hideTO) clearTimeout(window.hideTO);
		});
		$('#showLines, #miniBasketHover').mouseout(function() {
			window.hideTO = setTimeout(function() {
				$('#miniBasketHover').slideUp('slow');
			}, 750);
		});
	});

	//testing function to get order id - replace with JSP created JS function which gets id from session
	function getOrderId(strParamName){
		var strReturn = "";
		strReturn = getSessionOrder();

		return strReturn;

	//	var strHref = window.location.href;
	//	if ( strHref.indexOf("?") > -1 ){
	//		var strQueryString = strHref.substr(strHref.indexOf("?")).toLowerCase();
	//		var aQueryString = strQueryString.split("&");
	//		for ( var iParam = 0; iParam < aQueryString.length; iParam++ ){
	//			if (
	//				aQueryString[iParam].indexOf(strParamName.toLowerCase() + "=") > -1 ){
	//				var aParam = aQueryString[iParam].split("=");
	//				strReturn = aParam[1];
	//				break;
	//			}
	//		}
	//	}
        //		return unescape(strReturn);
	} 

 	//get the mini basket
	//$(function() {
		$('#miniBasketHover').ready(function() {

		//check for order id and if null don't call the service
		if (getOrderId('orderid') != null){

			$.ajax({
				type: 'GET',
				url: 'http://'+document.domain+'/ws/ecommerce/orders/' + getOrderId('orderid') + '?requestid=' + new Date().getTime(),
				dataType: 'xml',
				timeout: 1000,
				async: false,
				error: function(xml) {

					//no items in basket or call failed
					$('<strong></strong>')
						.html('0 items')
						.appendTo('#qtyValue');

					$('#subtotal').hide();
                                        $('#showDiscounts').hide();
                                        $('#showLines').hide();
                                        $('#buttons').hide();
				},
				success: function(xml) {

					//debug code

					$('<strong></strong>')
					.html('<strong>orderid:' + getOrderId('orderid') + '</strong>')
					.appendTo('#debug');

					//debug code
					
					//set the currency symbol
					var cur = $(xml).find('symbol:first').text()
					
					var subTotal = $(xml).find('totalValueOverride').text()			
					$('<strong></strong>')
						.html(cur + subTotal)
						.appendTo('#subtotalValue');
					

					var itemCount = 0;
					var bCheckout = 0;

					//create the lines in the hover
					$(xml).find('orderLine').each(function(){
						var title = $(this).find('title').text()

						//condition ? true : false
						
						bCheckout = $(this).find('legendAvailableNow').text() != '' || $(this).find('legendAvailableSoon').text() != '' ? bCheckout+1 : bCheckout

//alert(bCheckout);
						//var price = $(this).find('originalValue').text()
						var price = $(this).find('publishedPriceOverride').text() != '' ? $(this).find('publishedPriceOverride').text() : $(this).find('originalValue').text()
						var discprice = $(this).find('publishedPriceOverride').text()
						var ean = $(this).find('ean').text()
						var qty = parseInt($(this).find('quantity').text().replace(/,/, ''))
						var format = $(this).find('format').text()
						var volume = $(this).find('volumeNumber').text() != '' ? 'Volume ' + $(this).find('volumeNumber').text() + ': '+ $(this).find('volumeTitle').text() + '<br />' : ''
						var part = $(this).find('partNumber').text() != '' ? 'Part ' + $(this).find('partNumber').text() + ': '+ $(this).find('partTitle').text() + '<br />' : ''
						var edition = $(this).find('edition ').text() != '' ? $(this).find('edition ').text() + ' Edition' + '<br />' : ''

						itemCount = itemCount + qty;
						$('<div class="miniBasketHoverItem"></div>')
							.html('<h3><a href="/'+ean+'/">'+ title +'</a></h3><ul><li class="format">'+volume+part+edition+format+'</li><li class="qty">Qty: '+qty+'</li><li class="price">Price: '+cur+(qty*price).toFixed(2)+'</li></ul>')
							.appendTo('#miniBasketHover');
	
					}); //close each(


					//set the line count
					var linecount = $(xml).find('lineCount').text()
					$('<strong></strong>')
						.html(itemCount + ((itemCount == 1) ? " item" : " items"))
						.appendTo('#qtyValue');

					//hide promotions link if no promotions applied to order
					if ($(xml).find('promotion').size() < 1) $('#showDiscounts').hide();

					//hide checkout if no available titles in order
					//if (bCheckout == 0) $('#buttons').hide();

				}
			}); //close $.ajax(

			//if no order id then close up basket
			} else {

			$('<strong></strong>')
				.html('0 items')
				.appendTo('#qtyValue');

			$('#subtotal').hide();
			$('#showDiscounts').hide();
			$('#showLines').hide();
			$('#buttons').hide();

			}
		}); //close ready(
	//}); //close $(
