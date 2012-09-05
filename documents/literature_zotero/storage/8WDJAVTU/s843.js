$(document).ready(function () {
	$('#dicountPrice').ready(function() {
		if(null != $("#currentPromoCode").text() && "" != $("#currentPromoCode").text()){
			$.ajax({
				type: 'GET',
				url: 'http://'+document.domain+'/ws/ecommerce/promotion/' + $("#discountPriceISBN").text() + '?currencyCode=' + $("#curcode").text() + '&code=' + $("#currentPromoCode").text(),
				dataType: 'xml',
				timeout: 1000,
				async: false,
				error: function(xml) {
					showPriceDefault();
				},
				success: function(xml) {
					var discPrice = $(xml).find('discount').text()
					var discApplied = $(xml).find('discount').attr('discount-applied')
					var isCirca = $("#isCircaPrice").text();
					var country = $("#inLocale").text();
					if (discApplied == 'true') {
						$("#price").append($("#cur").text() + $.trim(discPrice) + ' <span class="was">was ' + $("#cur").text() + $("#pubPrice").text() + '</span>');
						showAddToCartButton(true);
					} else if ($("#offerActive").text() == '1' ) {
						$("#price").append('On offer at ' + $("#cur").text() + $("#pubPrice").text() + ' until ' + $("#offerEndDate").text() + ' Full price: ' +$("#cur").text() + $("#offerPubPriceRevert").text());
						showAddToCartButton(false);
					} else {
						if(isCirca == 1 && country == 'en_GB'){
							$("#price").append("c. " + $("#cur").text() + $("#pubPrice").text());
						} else {
							$("#price").append($("#cur").text() + $("#pubPrice").text());
						}
//						show add to cart button
						showAddToCartButton(false);
					}
				}
			}); //close $.ajax(
		}else{
			showPriceDefault();
		}

		$("#price").show();
	}); //close ready(
});
function showAddToCartButton(isDiscounted) {
	var local = $("#inLocale").text();
	if ( isDiscounted && local != "en_AU" && local != "zh_CN" ) {
		$("#addtoCartButton").removeAttr("action");
		$("#addtoCartButton").click(function(e){sendReqAddToCart(); return false;});
	}
}

//send ajax request and reload the page to refresh basket
function sendReqAddToCart(){
	progressDialogOpen();
	$.ajax({
		type: "GET",
		url: 'http://' + document.domain + "/addpromotocart/"+ $("#discountPriceISBN").text() +"/promotioncode/"+ $("#currentPromoCode").text() + "/nxtpg/",
		error: function(textStatus) {
			alert("error during ajax request");
		},
		success: function(msg){
			location.reload();
		}
	});
	return false;
}

function progressDialogOpen(){
	$( ".modalProgBarWrapper" ).dialog({
		height: 73,
		modal: true,
		resizable: false
	});
	$(".ui-draggable .ui-dialog-titlebar").hide();
	showBar();
}
function progressDialogClose(){
	destroyBar();
	$( ".modalProgBarWrapper" ).dialog( "destroy" );
}
function destroyBar(){
	$( "#progressbar" ).progressbar( "destroy" );
}
function showBar(){
	$( "#progressbar" ).progressbar({value: 100});
	$(".ui-progressbar-value").css("background-image","url('/other_files/images/jqueryUI/pbar-ani.gif')");
}
function showPriceDefault(){
	//no order or call failed
	var isCirca = $("#isCircaPrice").text();
	var country = $("#inLocale").text();
	if ($("#offerActive").text() == '1' ) {
		$("#price").append('On offer at ' + $("#cur").text() + $("#pubPrice").text() + ' until ' + $("#offerEndDate").text() + ' Full price: ' +$("#cur").text() + $("#offerPubPriceRevert").text());
	} else {
		if(isCirca == 1 && country == 'en_GB'){
			$("#price").append("c. " + $("#cur").text() + $("#pubPrice").text());
		} else {
			$("#price").append($("#cur").text() + $("#pubPrice").text());
		}
	}
	//show add to cart button
	showAddToCartButton(false);
} 
