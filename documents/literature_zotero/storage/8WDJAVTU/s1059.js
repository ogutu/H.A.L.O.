$(document).ready(function() {

	//primary highlights
    var phlone = Math.floor(Math.random() * ($('.primaryhlt1.a .phitem').size()));
    var phltwo = Math.floor(Math.random() * ($('.primaryhlt2.b .phitem').size()));
    var phlthree = Math.floor(Math.random() * ($('.primaryhlt1.d .phitem').size()));
    var phlfour = Math.floor(Math.random() * ($('.primaryhlt2.e .phitem').size()));
	
	//secondary banners
	var secbannerone = $('.shar1 .secondarySmallItem').size();
	var secbannertwo = $('.shar2 .secondarySmallItem').size();
	if($('.secHltWrapPartialWidth').size() > 0) {
		//secondary banner  highlihghts
		var secondarybanners = Math.floor(Math.random() * ($('.secondaryBannerWrapper').size()));
	}
	//news slot 1
	var newsone = $('.newsPromo.a.performancehide').size();
	var newstwo = $('.newsPromo.b.performancehide').size();
    
    $('.primaryhlt1.a .phitem').eq(phlone).removeClass("performancehide");
    $('.primaryhlt2.b .phitem').eq(phltwo).removeClass("performancehide");
    $('.primaryhlt1.d .phitem').eq(phlthree).removeClass("performancehide");
    $('.primaryhlt2.e .phitem').eq(phlfour).removeClass("performancehide");
	
	if(newsone > 1) {
		$('.newsPromo.a.performancehide').eq(Math.floor(Math.random() * ($('.newsPromo.a.performancehide').size()))).removeClass("performancehide");
	} else {
		$('.newsPromo.a.performancehide').removeClass("performancehide");
	}
	if(newstwo > 1) {
		$('.newsPromo.b.performancehide').eq(Math.floor(Math.random() * ($('.newsPromo.b.performancehide').size()))).removeClass("performancehide");
	} else {
		$('.newsPromo.b.performancehide').removeClass("performancehide");
	}
    
	if($('.secHltWrapFullWidth').size() > 0) {
	
		if (secbannerone > 3) {
			var counterone = 3;
			while (counterone > 0) {
				randomnumber = Math.floor(Math.random() * (secbannerone));
				if ($('.shar1 .secondarySmallItem').eq(randomnumber).is(":hidden")) {
					$('.shar1 .secondarySmallItem').eq(randomnumber).show();
					counterone -= 1;
				}
			}
		} else {
			$('.shar1 .secondarySmallItem').show();
		}
		if (secbannertwo > 3) {
		var countertwo = 3;
			while (countertwo > 0) {
				randomnumber = Math.floor(Math.random() * (secbannertwo));
				if ($('.shar2 .secondarySmallItem').eq(randomnumber).is(":hidden")) {
					$('.shar2 .secondarySmallItem').eq(randomnumber).show();
					countertwo -= 1;
				}
			}
		} else {
			$('.shar2 .secondarySmallItem').show();
		}
		
	}
	if($('.secHltWrapPartialWidth').size() > 0) {
		if($('.secondaryBannerWrapper').size() >= 1) {
			$('.secondaryBannerWrapper').eq(secondarybanners).removeClass("performancehide");
		}

		if (secbannerone > 2) {
			var counter = 2; // how many items to display
			var randomnumber;

			while (counter > 0) {
				randomnumber = Math.floor(Math.random() * ($('.shar1 .secondarySmallItem').size()));
				if ($('.shar1 .secondarySmallItem').eq(randomnumber).is(":hidden")) {
					$('.shar1 .secondarySmallItem').eq(randomnumber).show();
					counter -= 1;
				}
			}
		} else {
			$('.shar1 .secondarySmallItem').show();
		}
	}
	if(($('.bannerList .gbloc').size() <= 3) && $('.bannerList .usloc').size() == 0) {
		$('.bannerList .gbloc').show();
	}
	if(($('.bannerList .usloc').size() > 0) && $('.bannerList .gbloc').size() == 0) {
		$('.bannerList .usloc').show();
	}
	if($('.bannerList .gbloc').size() > 3) {
		var bancount = 3; // how many items to display
		
		while (bancount > 0) {
			randomnumber = Math.floor(Math.random() * ($('.bannerList .gbloc').size()));
			if ($('.bannerList .gbloc').eq(randomnumber).is(":hidden")) {
				$('.bannerList .gbloc').eq(randomnumber).show();
				bancount -= 1;
			}
		}
	}

});