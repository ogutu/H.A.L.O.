// DIV functions
var timer_div = 0;
var timer_second = 0;
var close_timer = 200;
var open_timer = 100;
var opened_menu = "";
var opened_second = "";
var NS4 = (navigator.appName=='Netscape' && parseInt(navigator.appVersion) == 4) ? 1 : 0;
var IE = (document.all) ? 1 : 0;
var DOM = (document.getElementById) ? 1 : 0;

function maxlength(text,length) {
	if ( IE ) {
		if ( text.innerText.length>length ) {
			text.innerText = text.innerText.substr(0,length);
		}
	} else {
		if ( text.value.length>length ) {
			text.value = text.value.substr(0,length);
		}
	}
}

function get_object(menu_name) {
	if ( IE ) {
		return document.all[menu_name];
	} else if ( DOM && menu_name ) {
		return document.getElementById(menu_name);
	} else if ( NS4 && menu_name && document.layers[menu_name] != null ) {
		return document.layers[menu_name];
	} else {
		return 0;
	}
}

function get_left(object) {
	if ( object.pageX ) {
		return parseInt(object.pageX);
	}

	if ( object.offsetLeft != null ) {
		val = object.offsetLeft;
		while ( ( object = object.offsetParent ) != null ) {
			val += object["offsetLeft"];
		}
		return parseInt(val);
	}
	return 0;
}

function set_left(object, leftvalue) {
	if ( object.pageX ) {
		object.pageX = parseInt(leftvalue) + ( !NS4 ? 'px' : 0);
		return true;
	}
	styleobject = get_style(object);
	styleobject.left = parseInt(leftvalue) + ( !NS4 ? 'px' : 0);
}

function get_top(object) {
	if ( object.pageY ) {
		return parseInt(object.pageY);
	}

	if ( object.offsetTop != null ) {
		val = object.offsetTop;
		while ( ( object = object.offsetParent )!= null ) {
			val += object["offsetTop"];
		}
		return parseInt(val);
	}
	return 0;
}

function set_top(object, topvalue) {
	if ( object.pageY ) {
		object.pageY = parseInt(topvalue) + ( !NS4 ? 'px' : 0);
		return true;
	}
	styleobject = get_style(object);
	styleobject.top = parseInt(topvalue) + ( !NS4 ? 'px' : 0);
}

function get_height(object) {
	if ( object.clip ) {
		return parseInt(object.clip.height);
	}

	if ( object.children && object.tagName == 'DIV') {
		styleobject = get_style(object.children[0]);
	} else {
		styleobject = get_style(object);
	}

	if ( object.offsetHeight ) {
		return parseInt(object.offsetHeight);
	} else if ( object.style ) {
		return parseInt(object.style.pixelHeight);
	} else if ( styleobject ) {
		return parseInt(styleobject.pixelHeight);
	}
	return 0;
}

function get_width(object) {
	if ( object.clip ) {
		return parseInt(object.clip.width);
	}

	if ( object.children && object.tagName == 'DIV') {
		styleobject = get_style(object.children[0]);
	} else {
		styleobject = get_style(object);
	}

	if ( object.offsetWidth ) {
		return parseInt(object.offsetWidth);
	} else if ( styleobject ) {
		return parseInt(styleobject.pixelWidth);
	}
	return 0;
}

function get_style(object) {
	if ( object.left ) {
		return object;
	} else if ( object.style ) {
		return object.style;
	} else if ( document.defaultView ) {
		return document.defaultView.getComputedStyle(object,null);
	}
}

function set_invisible(menu_name) {
	var object = get_object(menu_name);
	if ( object.style ) {
		object.style.display = "none";
	} else if ( object.visibility ) {
		object.display = "none";
	}
}

function set_visible(object) {
	if ( object.style ) {
		object.style.display = "block";
	} else if ( object.visibility ) {
		object.display = "block";
	}
}

function is_visible(object) {
	if ( object.style && object.style.display == "block") {
		return true;
	} else if (object.visibility && object.display == "block") {
		return true;
	} else {
		return false;
	}
}

function close_opened() {
	if ( opened_menu != '' ) {
		set_invisible(opened_menu);
		opened_menu = "";
	}
	return true;
}

function open_closed(menu_name, tab_format) {
	var object_popup = get_object(menu_name);
	var object_td  = get_object('td_tab_'+menu_name);
	if ( !is_visible(object_popup) ) {
		close_opened();
		width_popup = get_width(object_popup);
		//
		left_td = get_left(object_td);
		top_td = get_top(object_td);
		height_td = get_height(object_td);
		width_td = get_width(object_td);
		//
		if ( tab_format == 'H' ) {
			set_left(object_popup, left_td);
			if ( window.innerWidth ) {
				if ( left_td + width_popup > parseInt(window.innerWidth) ) {
					set_left(object_popup, left_td+width_td-width_popup);
				}
			} else {
				if ( left_td + width_popup > parseInt(get_width(document.body)) ) {
					set_left(object_popup, left_td+width_td-width_popup);
				}
			}
			set_top(object_popup, top_td+height_td);
		} else if ( tab_format == 'V' ) {
			set_left(object_popup, left_td+width_td);
			set_top(object_popup, top_td);
		}
		set_visible(object_popup);
		opened_menu = menu_name;
	}
	return true;
}

function open_second(menu_name) {
	var object_popup = get_object(menu_name);
	var object_td  = get_object('td_tab_'+menu_name);
	if ( !is_visible(object_popup) ) {
		close_second();
		//
		left_td = get_left(object_td);
		top_td = get_top(object_td);
		width_td = get_width(object_td);
		//
		set_top(object_popup, top_td);
		set_left(object_popup, left_td+width_td);
		set_visible(object_popup);
		opened_second = menu_name;
	}
	return true;
}

function close_second() {
	if ( opened_second != '' ) {
		set_invisible(opened_second);
		opened_second = "";
	}
	return true;
}

function installPub() {
	var pub = get_object('pub_head_popup');
	pub_width = ( get_width(pub)>0 ) ? get_width(pub) : 300;
	if ( window.innerWidth ) {
		set_left(pub, (parseInt(window.innerWidth)-pub_width)/2);
	} else {
		set_left(pub, (parseInt(get_width(document.body))-pub_width)/2);
	}
	set_visible(pub);
	pub.maxHeight = pub.offsetHeight;
	pub.time = 50;
	pub.acc = pub.maxHeight / Math.pow (pub.time / 2, 2);
	pub.step = 0;
	pub.thisHeight = 0;
	pub.direction = 1;
	set_top(pub, -pub.offsetHeight + "px");
	pub.my_timer = setTimeout("menuScroll('pub_head_popup')", 300);
}

function hidePub() {
	var pub = get_object('pub_head_popup');
	pub.direction = -1;
	pub.my_timer = setTimeout("menuScroll('pub_head_popup')", 100);
}

function menuScroll(divId) {
	div = get_object(divId);
	if (div.my_timer) {
		clearTimeout(div.my_timer);
		div.my_timer = null;
	}
	div.step += div.direction;
	if ( div.step < (div.time / 2) ) {
		div.thisHeight = 0.5 * div.acc * Math.pow (div.step, 2);
		set_top(div, (-div.offsetHeight + div.thisHeight) + "px");
	} else {
		div.thisHeight = (div.maxHeight) - 0.5 * div.acc * Math.pow (div.time - div.step, 2);
		set_top(div, (-div.offsetHeight + div.thisHeight) + "px");
	}

	if ( ((div.direction == 1) && (div.step < div.time)) || ((div.direction == -1) && (div.step > 0)) ) {
		div.my_timer = setTimeout ("menuScroll ('" + divId + "')", 10);
	}
}

function DMC_voir(menu_name) {
	var object = get_object(menu_name);
	if ( object.style ) {
		object.style.display = "block";
	} else if ( object.display ) {
		object.display = "block";
	}
}

function DMC_cacher(menu_name) {
	var object = get_object(menu_name);
	if ( object.style ) {
		object.style.display = "none";
	} else if ( object.display ) {
		object.display = "none";
	}
}
// end DIV functions

// image functions
function find_obj(n, d) {
	var p,i,x;
	if ( !d ) {
		d = document;
	}
	if ( ( p = n.indexOf("?") ) > 0 && parent.frames.length ) {
		d = parent.frames[n.substring(p+1)].document;
		n = n.substring(0,p);
	}
	if ( !( x = d[n] ) && d.all ) {
		x = d.all[n];
	}
	for ( i=0; !x && i < d.forms.length; i++) {
		x = d.forms[i][n];
	}
	for ( i=0; !x && d.layers && i < d.layers.length; i++ ) {
		x = find_obj( n, d.layers[i].document);
	}
	if ( !x && document.getElementById ) {
		x = document.getElementById(n);
	}
	return x;
}

function change_img(objet, new_source) {
	if ( ( x = find_obj(objet) ) != null ) {
		x.src = new_source;
	}
}

function swap_img() {
	var i,j=0,x;
	a = swap_img.arguments;
	document.PAOL_sr = new Array;
	for ( i=0; i < (a.length-2); i+=3 ) {
		if ( ( x = find_obj(a[i]) ) != null ) {
			document.PAOL_sr[j++] = x;
			if ( !x.oSrc ) {
				x.oSrc = x.src;
			}
			x.src = a[i+2];
		}
	}
}

function restore_img() {
	var i,x;
	a = document.PAOL_sr;
	for ( i=0; a && (i < a.length) && ( x = a[i] ) && x.oSrc; i++ ) {
		x.src = x.oSrc;
	}
}
// end image functions

// general functions

function focus_link(f_name, l_name) {
	f_name.blur();
	find_link = false;
	for ( var i=0; i<document.links.length; i++ ) {
		if ( document.links[i].name == l_name ) {
			document.links[i].focus();
			find_link = true;
			break;
		}
	}
	if ( !find_link ) {
		window.focus();
	}
}

function str_unrot(debut, chaine, fin) {
	var known_letters = new Array("a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","0","1","2","3","4","5","6","7","8","9","@",".","-");
	var count_known_letters = known_letters.length;
	var key = (chaine.length)%count_known_letters;
	var out = "";
	for ( var i=0; i<chaine.length; i++ ) {
		current = chaine.charAt(i);
		if ( isInArray(known_letters, current) ) {
			for ( var j=0; j<count_known_letters; j++ ) {
				if ( known_letters[j] == current ) {
					break;
				}
			}
			currentIndiceLetter = j;
			newIndiceLetter = (currentIndiceLetter-key)%count_known_letters;
			if ( newIndiceLetter < 0 ) {
				newIndiceLetter += count_known_letters;
			}
			out += known_letters[newIndiceLetter];
		} else {
			out += current;
		}
	}
	document.write(debut+out+fin);
}

function isblank(s) {
	for (var i = 0; i < s.value.length; i++) {
		var c = s.value.charAt(i);
		if ( (c != ' ') && (c != '\n') && (c != '\t') && (c != '&nbsp;') && (c != '&#032;') ) return false;
	}
	return true;
}

function repeteString(ch,nbcar) {
	while (ch.length < nbcar) {
		ch=ch+ch;
	}
	return (ch);
}

function remplitGauche(ch,chremp,nbcar) {
	ch_ret = repeteString(chremp,nbcar-ch.length)+ch;
	return (ch_ret.substring(ch_ret.length-nbcar, ch_ret.length));
}

function remplitDroite(ch,chremp,nbcar) {
	chret = ch+repeteString(chremp,nbcar-ch.length);
	return (ch_ret.substring(0, ch_ret.length));
}

function str_insert(ch,chinsert,nbcar) {
	if (ch == "") {
		return ch;
	}
	var bufr = "";
	for ( var i = 0; i < ch.length; i++) {
		bufr += ch.charAt(i);
		if ( i != 0 && i%nbcar ) {
			bufr += chinsert;
		}
	}
	return bufr;
}

function isInArray(tab,chaine) {
	for (var j=0; j<tab.length; j++ ) {
		if ( tab[j] == chaine ) {
			return(1);
		}
	}
	return(0);
}

function getLangText(mess) {
	var reg = /.*\[\]$/i;
	if ( reg.test(mess) ) {
		mess = mess.substr(0, (mess.length)-2);
	}
	var reg = /.*\d$/i;
	if ( reg.test(mess) ) {
		return getLangText(mess.substr(0, (mess.length)-1));
	}


	return PAOL_LANG[mess];
}

function makefieldstatus(theform,thename,thestat) {
	for (var i=0; i<theform.elements.length; i++) {
		if (theform.elements[i].name==thename) {
			theform.elements[i].required = thestat;
		}
	}
}

function confirm_delete_doc(myForm) {
	if ( typeof(myForm.why) != 'undefined' && myForm.admin_action.value == 'delete_document' && myForm.why.value == '' ) {
		alert(getLangText('explication'));
		myForm.why.focus();
		return false;
	}
	if ( ( myForm.admin_action.value == 'delete_document' || myForm.admin_action.value == 'refuse_document' ) && myForm.status.value == "11" ) {
		return confirm(getLangText("visible_document")+'\n\n'+getLangText("ask_confirmation"));
	}
	return true;
}

function verify(theform) {
	return verifyotherbrowser(theform);
}

function verifyotherbrowser(f) {
	if (navigator.appVersion.substring(0, 2) < 3) {
		return true;
	}
	var msg = "";
	var empty_fields = "";
	var indicator = "";
	var i_not_okay = new Array();
	//alert(f.elements.length);
	for (var i=0; i<f.elements.length; i++) {
		 //alert(i+'-'+ f.elements[i].name+'-'+f.elements[i].required);
		 if ( f.elements[i].required == '1' ) {
			if ((f.elements[i].type=="radio")||(f.elements[i].type=="checkbox")) {
				if ((f.elements[i].name)&&(f.elements[i+1].name) && (f.elements[i].name == f.elements[i+1].name)) {
					if (f.elements[i].checked) {
						indicator="okay";
					} else {
						indicator="not_okay";
					}
					while ( ((f.elements[i].name!=null) || (f.elements[i].name!="")) && (f.elements[i].name == f.elements[i+1].name) && (i<f.elements.length)) {
						if (f.elements[i+1].checked) {
							indicator="okay";
						}
						i++;
					}
					if (indicator=="not_okay") {
						empty_fields += "\n        + " + getLangText(f.elements[i].name);
						i_not_okay = i_not_okay.concat([i]);
					}
				} else if (!f.elements[i].checked) {
					empty_fields += "\n        + " + getLangText(f.elements[i].name);
					i_not_okay = i_not_okay.concat([i]);
				}
			} else if ((f.elements[i].type=="text") || (f.elements[i].type=="file") || (f.elements[i].type=="hidden") || (f.elements[i].type=="textarea") || (f.elements[i].type=="password")) {
				if ((f.elements[i].value=="")||(isblank(f.elements[i]))) {
					empty_fields += "\n        + " + getLangText(f.elements[i].name);
					i_not_okay = i_not_okay.concat([i]);
				}
			} else if ((f.elements[i].type=="select-one")||(f.elements[i].type=="select-multiple")) {
				if ((f.elements[i].selectedIndex == "-1") || (!f.elements[i].options[f.elements[i].selectedIndex]) || (f.elements[i].options[f.elements[i].selectedIndex].value=="")) {
					empty_fields += "\n        + " + getLangText(f.elements[i].name);
					i_not_okay = i_not_okay.concat([i]);
				}
			}
		}
	}

	if (!empty_fields) return true;

	msg = "______________________________________________\n\n";
	msg += ( i_not_okay.length > 1 ) ? getLangText('check_errors_form') : getLangText('check_error_form');
	msg += "\n" + empty_fields + "\n";
	msg += "______________________________________________\n";
	alert(msg);
	f.elements[i_not_okay[0]].focus();
	return false;
}

function verifymsexplorer(f) {
	var msg = "";
	var empty_fields = "";
	var indicator = "";
	var i_not_okay = new Array();

	for (var i=0; i<f.elements.length; i++) {
		var e = f.elements[i];
		var next_e = f.elements[i+1];
		if ( e.required == '1' ) {
			if ((e.name)&&(next_e.name)&&(e.name == next_e.name)) {
				if(e.checked) {
					indicator="okay";
				} else {
					indicator="not_okay";
				}
				while (((e.name!=null)||(e.name!=""))&&(e.name == next_e.name)&&(i<f.elements.length)) {
					if (next_e.checked) {
						indicator="okay";
					}
					e = next_e;
					i++;
					next_e=f.elements[i+1];
				}
				if (indicator=="not_okay") {
					empty_fields += "\n        + " + getLangText(e.name);
					i_not_okay = i_not_okay.concat([i]);
				}
			} else {
				if ((e.value==null)||(e.type=="select-one")) {
					if ((e.options[e.selectedIndex].value==null)|| (e.options[e.selectedIndex].value=="")) {
						empty_fields += "\n        + " + getLangText(e.name);
						i_not_okay = i_not_okay.concat([i]);
					}
				} else if ((e.value == "") || isblank(e)) {
					empty_fields += "\n        + " + getLangText(e.name);
					i_not_okay = i_not_okay.concat([i]);
				}
			}
		}
	}
	if (!empty_fields) return true;

	msg = "______________________________________________\n\n";
	msg += ( i_not_okay.length > 1 ) ? getLangText('check_errors_form') : getLangText('check_error_form');
	msg += "\n" + empty_fields + "\n";
	msg += "______________________________________________\n";
	alert(msg);
	f.elements[i_not_okay[0]].focus();
	return false;
}

function verifyEmail(myMail) {
	var myRegExpr = /^[a-z0-9\+\-_]+(\.[a-z0-9\+\-_]+)*@([a-z0-9\-_]+\.)+[a-z]{2,4}$/i;
	return ( myRegExpr.test(myMail) );
}

function verifPassword(password1, password2) {
	if ( password1=='' ){
		return 1;
	} else {
		return ( (password1 == password2)?1:0 );
	}
}

function verifDOI(doi) {
	var myRegExpr = /^10\./;
	return ( myRegExpr.test(doi) );
}

function verifFormatPage(page) {
	var f_page = page.value;
	var myRegExpr = /^[0-9]+\-[0-9]+$/i;

	if ( !myRegExpr.test(f_page) ) {
		return(false);
	} else {
		var reg=new RegExp("-", "g");
		var t_page = f_page.split(reg);
		if ( t_page.length == 2 ) {
			var page_deb = parseInt(t_page[0]);
			var page_fin = parseInt(t_page[1]);
			if ( page_deb == 'NaN' || page_fin == 'NaN' || page_deb > page_fin ) {
				return(false);
			} else {
				return(true);
			}
		} else {
			return(false);
		}
	}
}

function verifFormatID_IRD(id_ird) {
	var f_id_ird = id_ird.value;
	var myRegExpr = /^fdi:[0-9]+$/;

	return( myRegExpr.test(f_id_ird) );
}

function verifYear(year) {
	var f_year = year.value;
	if ( isNaN(f_year) || f_year.length != 4 || f_year < 1 ) {
		return(false);
	}
	return(true);
}

function verifWDate(mydate) {
	var reg=new RegExp("-", "g");
	var f_date = mydate.value.split(reg);
	aujourdhui = new Date();
	var cur_year = aujourdhui.getFullYear();
	var cur_mois = aujourdhui.getMonth()+1;
	var cur_jour = aujourdhui.getDate();
	if ( f_date.length == 3 ) { // format YYYY-MM-JJ attendu
		var f_year = f_date[0];
		var f_mois = remplitGauche(f_date[1], "0", 2);
		var f_jour = remplitGauche(f_date[2], "0", 2);

		if ( isNaN(f_year) || f_year.length != 4 || f_year > cur_year || f_year < 1 ) {
			return(false);
		}
		if ( isNaN(f_mois) || f_mois.length != 2 || f_mois > 12 || f_mois < 1 ) {
			return(false);
		}
		if ( isNaN(f_jour) || f_jour.length != 2 || f_jour > 31 || f_jour < 1 ) {
			return(false);
		}

		var int_f = parseInt(f_year)*10000 + parseInt(f_mois)*100 + parseInt(f_jour);
		var int_cur = parseInt(cur_year)*10000 + parseInt(cur_mois)*100 + parseInt(cur_jour);
		if ( int_f > int_cur ) {
			return(false);
		}
		mydate.value = f_year + '-' + f_mois + '-' + f_jour;
		return(true);
	} else if ( f_date.length == 2 ) { // format YYYY-MM attendu
		var f_year = f_date[0];
		var f_mois = remplitGauche(f_date[1], "0", 2);

		if ( isNaN(f_year) || f_year.length != 4 || f_year > cur_year || f_year < 1 ) {
			return(false);
		}
		if ( isNaN(f_mois) || f_mois.length != 2 || f_mois > 12 || f_mois < 1 ) {
			return(false);
		}

		var int_f = parseInt(f_year)*10000 + parseInt(f_mois)*100;
		var int_cur = parseInt(cur_year)*10000 + parseInt(cur_mois)*100;
		if ( int_f > int_cur ) {
			return(false);
		}
		mydate.value = f_year + '-' + f_mois;
		return(true);
	} else { // format YYYY attendu
		var f_year = f_date[0];

		if ( isNaN(f_year) || f_year.length != 4 || f_year > cur_year || f_year < 1 ) {
			return(false);
		}
		return(true);
	}
}

function verifWAllDate(mydate) {
	var reg=new RegExp("-", "g");
	var f_date = mydate.value.split(reg);
	if ( f_date.length == 3 ) { // format YYYY-MM-JJ attendu
		var f_year = f_date[0];
		var f_mois = remplitGauche(f_date[1], "0", 2);
		var f_jour = remplitGauche(f_date[2], "0", 2);

		if ( isNaN(f_year) || f_year.length != 4 || f_year < 1 ) {
			return(false);
		}
		if ( isNaN(f_mois) || f_mois.length != 2 || f_mois > 12 || f_mois < 1 ) {
			return(false);
		}
		if ( isNaN(f_jour) || f_jour.length != 2 || f_jour > 31 || f_jour < 1 ) {
			return(false);
		}
		mydate.value = f_year + '-' + f_mois + '-' + f_jour;
		return(true);
	} else if ( f_date.length == 2 ) { // format YYYY-MM attendu
		var f_year = f_date[0];
		var f_mois = remplitGauche(f_date[1], "0", 2);

		if ( isNaN(f_year) || f_year.length != 4 || f_year < 1 ) {
			return(false);
		}
		if ( isNaN(f_mois) || f_mois.length != 2 || f_mois > 12 || f_mois < 1 ) {
			return(false);
		}
		mydate.value = f_year + '-' + f_mois;
		return(true);
	} else { // format YYYY attendu
		var f_year = f_date[0];

		if ( isNaN(f_year) || f_year.length != 4 || f_year < 1 ) {
			return(false);
		}
		return(true);
	}
}

function verifDate(mydate) {
	var reg=new RegExp("-", "g");
	var f_date = mydate.value.split(reg);
	if ( f_date.length != 3 ) {
		return(false);
	} else {
		var f_year = f_date[0];
		var f_mois = remplitGauche(f_date[1], "0", 2);
		var f_jour = remplitGauche(f_date[2], "0", 2);
		aujourdhui = new Date();
		var cur_year = aujourdhui.getFullYear();
		var cur_mois = aujourdhui.getMonth()+1;
		var cur_jour = aujourdhui.getDate();
		if ( isNaN(f_year) || f_year.length != 4 || f_year < 1 ) {
			return(false);
		}
		if ( isNaN(f_mois) || f_mois.length != 2 || f_mois > 12 || f_mois < 1 ) {
			return(false);
		}
		if ( isNaN(f_jour) || f_jour.length != 2 || f_jour > 31 || f_jour < 1 ) {
			return(false);
		}
		mydate.value = f_year + '-' + f_mois + '-' + f_jour;
		return(true);
	}
}

function verifFuturDate(mydate) {
	var reg=new RegExp("-", "g");
	var f_date = mydate.value.split(reg);
	if ( f_date.length != 3 ) {
		return(false);
	} else {
		var f_year = f_date[0];
		var f_mois = remplitGauche(f_date[1], "0", 2);
		var f_jour = remplitGauche(f_date[2], "0", 2);
		aujourdhui = new Date();
		var cur_year = aujourdhui.getFullYear();
		var cur_mois = aujourdhui.getMonth()+1;
		var cur_jour = aujourdhui.getDate();
		if ( isNaN(f_year) || f_year.length != 4 || f_year < cur_year ) {
			return(false);
		}
		if ( isNaN(f_mois) || f_mois.length != 2 || f_mois > 12 || f_mois < 1 ) {
			return(false);
		}
		if ( isNaN(f_jour) || f_jour.length != 2 || f_jour > 31 || f_jour < 1 ) {
			return(false);
		}
		var int_f = parseInt(f_year)*10000 + parseInt(f_mois)*100 + parseInt(f_jour);
		var int_cur = parseInt(cur_year)*10000 + parseInt(cur_mois)*100 + parseInt(cur_jour);
		if ( int_f < int_cur ) {
			return(false);
		}
		mydate.value = f_year + '-' + f_mois + '-' + f_jour;
		return(true);
	}
}

function selectAllEntry(theElement) {
	if ( theElement.length ) {
		for ( i=0; i<theElement.length; i++ ) {
			theElement[i].checked = true;
		}
	} else {
		theElement.checked = true;
	}
	return true;
}

function unselectAllEntry(theElement) {
	if ( theElement.length ) {
		for ( i=0; i<theElement.length; i++ ) {
			theElement[i].checked = false;
		}
	} else {
		theElement.checked = false;
	}
	return true;
}

function pluralize(word, number, none) {
	if ( number == 0 ) {
		if ( none != "" ) {
			return (none+' '+word);
		} else {
			return (word);
		}
	} else if ( number == 1 ) {
		return (number+' '+word);
	} else {
		return (number+' '+word+'s');
	}
}

function Trim(str) {
	if (str == "") {
		return str;
	}
	var line = "";
	var bufr = "";
	var espace = 0;
	var i = 0;
	var j = 0;
	str += '\n';
	for ( var i = 0; i < str.length; i++) {
		var ch = str.charAt(i);
		if ( (ch == '\t') || (ch == ' ') ) {
			ch = ' ';
			for (; i < str.length; i++) {
				chaux = str.charAt(i);
				if ( (chaux != '\t') && (chaux != ' ') ) {
					break;
				}
			}
			i--;
		}
		line = line + ch;
		if ( (ch == "\n") || (ch=="\r") || (ch=="\f") || (i==str.length-1) ) {
			ok = false;
			if (line.length - 2 > 0) {
				if (line.charAt(0) == ' ') {
					line = line.substring(1,line.length);
				}
				if (line.charAt(line.length - 2) == ' ') {
					line = line.substring(0,line.length-2) + ch;
				}
			}
			for (var j=0; j < line.length -1; j++) {
				var ch2 = line.charAt(j);
				if ( ch2 != " ") {
					ok = true;
					break;
				}
			}
			if ( (ok) && (line.length > 1) ) {
				bufr = bufr + line;
			}
			line = "";
		}
	}
	if (bufr.length > 0 ) {
		if ( (bufr.charAt(bufr.length-1) == "\n") || (bufr.charAt(bufr.length-1) == "\r") || (bufr.charAt(bufr.length-1) == "\f") ) {
			bufr = bufr.substring(0,bufr.length-1);
		}
	}
	return bufr;
}

function select_element(elmt) {
	if ( typeof(elmt) != 'undefined' ) {
		for (var i=0; i<elmt.length; i++) {
			if ( elmt.options[i].value == 'NULL' ) {
				elmt.options[i] = null;
			} else {
				elmt.options[i].selected = true;
			}
		}
	}
}

function rm_domain(f_dom) {
	var indexS = new Array();
	var j=0;
	for (var i=0; i<f_dom.length; i++) {
		if ( f_dom.options[i].selected == true ) {
			indexS[j] = i;
			j++;
		}
	}
	if ( indexS.length <= 0 ) {
		alert( getLangText('no_domain_selected') );
	} else {
		indexS.reverse();
		for (var i=0; i<indexS.length; i++) {
			f_dom.options[indexS[i]] = null;
		}
		for (var i=0; i<f_dom.length; i++) {
			f_dom.options[i].selected = false;
		}
	}
	return true;
}

function selectAllSelect(f_sel) {
	if ( typeof(f_sel) != "undefined" && typeof(f_sel.options) != "undefined" ) {
		for (var i=0; i<f_sel.length; i++) {
			f_sel.options[i].selected = true;
		}
	}
}

function unselectAllSelect(f_sel) {
	if ( typeof(f_sel) != "undefined" && typeof(f_sel.options) != "undefined" ) {
		for (var i=0; i<f_sel.length; i++) {
			f_sel.options[i].selected = false;
		}
	}
}

function efface_form_text(formulaire) {
	formulaire.value = '';
}
// fonction tapon Rennes 2
function creerFenImage() {
	fiRef = window.open ("","fenImage","width=820,height=377,toolbar=no,location=no,directories=no,status=no,resizable=no");
}



function addValue(theElement, theNewElement) {
	//var theElement = document.export_form.elements['known_meta'];
	//var theNewElement = document.export_form.elements['wanted_meta[]'];
    indexS = theElement.options.selectedIndex;
    if (indexS < 0) {
		return;
	}
    theElement.options[indexS].selected = false;
	// nouvelle valeur
    f_value = theElement.options[indexS].value;
    f_text = theElement.options[indexS].text;
	// valeurs présentes
	var indexD = theNewElement.options.length;
	var present_value = new Array();
	for (var i=0; i<indexD; i++) {
		present_value[i] = theNewElement.options[i].value;
	}
	// ajout, si non déjà inclu
	if ( !isInArray(present_value, f_value) ) {
		var addDom = new Option(f_text, f_value);
		reg_nav = new RegExp('Internet Explorer');
		reg_mac = new RegExp('mac','i');
		if ( reg_nav.test(navigator.appName) && !reg_mac.test(navigator.platform) ) {
			var oOption = document.createElement("OPTION");
			theNewElement.options.add(oOption,indexD);
			oOption.innerText = f_text;
			oOption.value = f_value;
		} else {
			theNewElement.options[indexD] = addDom;
		}
	}
}


function rmValue(theNewElement) {
	//var theNewElement = document.export_form.elements['wanted_meta[]'];
	var indexS = new Array();
	var j=0;
	for (var i=0; i<theNewElement.length; i++) {
		if ( theNewElement.options[i].selected == true ) {
			indexS[j] = i;
			j++;
		}
	}
	if ( indexS.length > 0 ) {
		indexS.reverse();
		for (var i=0; i<indexS.length; i++) {
			theNewElement.options[indexS[i]] = null;
		}
		for (var i=0; i<theNewElement.length; i++) {
			theNewElement.options[i].selected = false;
		}
	}
}

function moveUpValue(theElement) {
	//var theMeta = document.export_form.elements['wanted_meta[]'];
	var indexS = new Array();
	var j=0;
	for (var i=0; i<theElement.length; i++) {
		if ( theElement.options[i].selected == true ) {
			indexS[j] = i;
			j++;
		}
	}
	if ( indexS.length == 1 && indexS[0] != 0 ) {
		theElement.options[indexS[0]].selected = false;
		var indexC = indexS[0]-1;
		var tmp_val = theElement.options[indexS[0]].value;
		var tmp_txt = theElement.options[indexS[0]].text;
		theElement.options[indexS[0]].value = theElement.options[indexC].value;
		theElement.options[indexS[0]].text = theElement.options[indexC].text;
		theElement.options[indexC].value = tmp_val;
		theElement.options[indexC].text = tmp_txt;
		theElement.options[indexC].selected = true;
	}
}

function moveDownValue(theElement) {
	//var theMeta = document.export_form.elements['wanted_meta[]'];
	var indexS = new Array();
	var j=0;
	for (var i=0; i<theElement.length; i++) {
		if ( theElement.options[i].selected == true ) {
			indexS[j] = i;
			j++;
		}
	}
	if ( indexS.length == 1 && indexS[0] != (theElement.length-1) ) {
		theElement.options[indexS[0]].selected = false;
		var indexC = indexS[0]+1;
		var tmp_val = theElement.options[indexS[0]].value;
		var tmp_txt = theElement.options[indexS[0]].text;
		theElement.options[indexS[0]].value = theElement.options[indexC].value;
		theElement.options[indexS[0]].text = theElement.options[indexC].text;
		theElement.options[indexC].value = tmp_val;
		theElement.options[indexC].text = tmp_txt;
		theElement.options[indexC].selected = true;
	}
}

function showSelectForIE(theForm){
	var is_IE = (document.all) ? 1 : 0;
	if (is_IE){
		var NbElements = document.getElementById(theForm).elements.length;
		for (var l = 0; l < NbElements; l++) {
			if(document.getElementById(theForm).elements[l].type == "select-multiple" || document.getElementById(theForm).elements[l].type == "select-one") {
				document.getElementById(theForm).elements[l].style.visibility = 'visible';
			}
		}
	}
}

function hideSelectForIE(theForm, theElement){
	var is_IE = (document.all) ? 1 : 0;
	if (is_IE){
		var left = get_left(document.getElementById(theElement));
		var top = get_top(document.getElementById(theElement));
		var bottom = top + get_height(document.getElementById(theElement));
		var right = left + get_width(document.getElementById(theElement));
		var NbElements = document.getElementById(theForm).elements.length;
		for (var l = 0; l < NbElements; l++) {
			if(document.getElementById(theForm).elements[l].type == "select-multiple" || document.getElementById(theForm).elements[l].type == "select-one") {
				var posX = get_left(document.getElementById(theForm).elements[l]);
				var posY = get_top(document.getElementById(theForm).elements[l]);
				if ( (posX>=left && posX<=right) && (posY>=top && posY<=bottom)){
					document.getElementById(theForm).elements[l].style.visibility = 'hidden';
				} else {
					document.getElementById(theForm).elements[l].style.visibility = 'visible';
				}
			}
		}
	}
}

function byId(id){
	return document.getElementById(id);
}

function changeStyle(elem, style1, style2) {
	byId(elem).className = (byId(elem).className==style1) ? style2 : style1;
}

function jsRequestVerifField(fieldName, options){
	var params = '';
    for (var paramName in options)
      params += paramName + "="+options[paramName]+"&";
	params += "action" + "=" + "verif_field"+ "&" + "field" + "=" + fieldName + "&" + fieldName + "=" + $F(fieldName);

	var opt = {
	    method: 'post',
		evalScripts: true,
		parameters: params
	}
	new Ajax.Updater('verif_'+fieldName, '/action_ajax/utile.php', opt);
}

function jsRequestMetaAutoComplete(inputName, divName, options){
	var params = '';
	var field = '';
    for (var paramName in options) {
    	params += paramName + "=" + options[paramName] + "&";
    	if ( paramName == 'field' ) {
    		field = options[paramName] ;
    	}
    }
    params +=  "action" + "=" + "recup_ListMeta" + "&";
	var opt = {
	    method: 'post',
		evalScripts: true,
		indicator: 'indicator_'+inputName,
		parameters: params,
		onSuccess: function(t) {
			if (field == 'journal') {
				$('divprec_journal').style.display = 'none';
				$('divprec_journal').innerHTML = '';
			}
			if ( field == 'projetanr' ) {
				$('divprec_projetanr').style.display = 'none';
				$('divprec_projetanr').innerHTML = '';
				$('projetanr_code').value = 0;
			}
			if ( field == 'projeteurope' ) {
				$('divprec_projeteurope').style.display = 'none';
				$('divprec_projeteurope').innerHTML = '';
				$('projeteurope_code').value = 0;
			}
		},
		afterUpdateElement: function(t, li){
			if ( field == 'journal' ) {
				jsRequestMetaJournalPrec($F(inputName), options);
			}
			if ( field == 'projetanr' ) {
				var reg=new RegExp("#", "g");
				var f_projetanr = li.id.split(reg);
				$(inputName).value = f_projetanr[1];
				$('projetanr_code').value = f_projetanr[0];
				jsRequestMetaANRPrec(f_projetanr[0], options);
			}
			if ( field == 'projeteurope' ) {
				var reg=new RegExp("#", "g");
				var f_projeteurope = li.id.split(reg);
				$(inputName).value = f_projeteurope[1];
				$('projeteurope_code').value = f_projeteurope[0];
				jsRequestMetaEuropePrec(f_projeteurope[0], options);
			}
		}
	}
	new Ajax.Autocompleter(inputName, divName, '/action_ajax/submit.php', opt);
}

function jsRequestMetaJournalPrec( journal, options ) {
	var params = '';
    for (var paramName in options)
      params += paramName + "=" + options[paramName] + "&";
	params += "action" + "=" + "recup_precJournal" + "&" + "journal" + "=" + journal ;
	var opt = {
	    method: 'post',
		evalScripts: true,
		parameters: params,
		onComplete: function(t){
			if ( t.responseText != '') {
				$('divprec_journal').style.display = 'block';
			} else {
				$('divprec_journal').style.display = 'none';
			}
		}
	}
	if ( journal != '') {
		new Ajax.Updater('divprec_journal', '/action_ajax/submit.php', opt);
	}
}

function jsRequestMetaANRPrec( projetanr, options ) {
	var params = '';
    for (var paramName in options)
      params += paramName + "=" + options[paramName] + "&";
	params += "action" + "=" + "recup_precANR" + "&" + "projetanr" + "=" + projetanr ;
	var opt = {
	    method: 'post',
		evalScripts: true,
		parameters: params,
		onComplete: function(t){
			if ( t.responseText != '') {
				$('divprec_projetanr').style.display = 'block';
			} else {
				$('divprec_projetanr').style.display = 'none';
			}
		}
	}
	if ( projetanr != '' ) {
		new Ajax.Updater('divprec_projetanr', '/action_ajax/submit.php', opt);
	}
}

function jsRequestMetaEuropePrec( projeteurope, options ) {
	var params = '';
	for (var paramName in options)
		params += paramName + "=" + options[paramName] + "&";
	params += "action" + "=" + "recup_precProjeurop" + "&" + "projeteurope" + "=" + projeteurope ;
	var opt = {
			method: 'post',
			evalScripts: true,
			parameters: params,
			onComplete: function(t){
		if ( t.responseText != '') {
			$('divprec_projeteurope').style.display = 'block';
		} else {
			$('divprec_projeteurope').style.display = 'none';
		}
	}
	}
	if ( projeteurope != '' ) {
		new Ajax.Updater('divprec_projeteurope', '/action_ajax/submit.php', opt);
	}
}

function jsRequestLastnameAutoComplete(inputName, divName, options){
	var opt = {
	    method: 'post',
		evalScripts: true,
		parameters: toParamString(new Array(options, {action:'recup_listAuthor', no_new:'true'})),
		indicator: inputName+'_indicator',
		updateElement: function(t) {
	    	if ( t.id=='prev' ) {
	    		jsRequestLastnameAutoCompleteNav( $F('prev_pos'), options, autoAuthor );
			} else if ( t.id=='next' ) {
				jsRequestLastnameAutoCompleteNav( $F('next_pos'), options, autoAuthor );
			} else { //Un auteur a été selectionné, on le rajoute
				jsRequestAddLastname(t.id, options);
			}
	    }   
	}       	
	autoAuthor = new Ajax.Autocompleter(inputName, divName, '/action_ajax/submit.php', opt);
}

function jsRequestLastnameAutoCompleteNav( pos, options, autocompleter ) {
	var opt = {
	    method: 'post',
		evalScripts: true,
		parameters: toParamString(new Array(options, {action:'recup_listAuthor', no_new:'true', pos:pos, lastname:$F('lastname')})),
		onComplete: function(t) {
			$('lastname').focus();
			autocompleter.changed = false;
			autocompleter.hasFocus = true;
			autocompleter.updateChoices(t.responseText);
	    } 
	}      
	new Ajax.Request('/action_ajax/submit.php', opt);
}

function jsRequestAddLastname( authorid, options ){
	var opt = {
	    method: 'post',
		evalScripts: true,
	    parameters:  toParamString(new Array(options, {action:'add_knownLastname', authorid:authorid})),
	    onComplete: function(t) { // Ajout des infos dans le formulaire "add_auteur_form"
			param = t.responseText.evalJSON();
			
			$('lastname').value = param.lastname;
			$('firstname').value = param.firstname;
			if ($('othername') != undefined) {
				$('othername').value = param.othername;
			}
			$('email').value = param.email;
			if ($('url_perso') != undefined) {
				$('url_perso').value = param.url_perso;
			}
			if ($('corresponding') != undefined) {
				$('corresponding').value = param.corresponding;
			}
			if ($('organism') != undefined) {
				$('organism').value = param.organism;
			}
			if ($('researchteam') != undefined) {
				$('researchteam').value = param.researchteam;
			}
		}
	}
	new Ajax.Request('/action_ajax/submit.php', opt);
}

function jsRequestEtablissementAutoComplete(inputName, divName, options){
	var params = '';
	for ( var paramName in options ) {
		params += paramName + "=" + options[paramName] + "&";
	}
	params += "action" + "=" + "recup_listAffiRef";
	var opt = {
			method: 'post',
			evalScripts: true,
			indicator: inputName+'_indicator',
			parameters: params
	}
	new Ajax.Autocompleter(inputName, divName, '/action_ajax/submit.php', opt);
}

function jsRequestReseachteamAutoComplete(inputName, divName, options){
	var params = '';
	for ( var paramName in options ) {
		params += paramName + "=" + options[paramName] + "&";
	}
	params += "action" + "=" + "recup_listResearchteam";
	var opt = {
			method: 'post',
			evalScripts: true,
			indicator: inputName+'_indicator',
			parameters: params
	}
	new Ajax.Autocompleter(inputName, divName, '/action_ajax/submit.php', opt);
}

function jsRequestGraphLoad(numGraph, divName, options){
	var params = '';
    for (var paramName in options)
      params += paramName + "=" + options[paramName]+"&";

	params += "action" + "=" + "load_graph"+ "&" + "numGraph" + "=" + numGraph ;

	var opt = {
	    method: 'post',
		evalScripts: true,
		parameters: params
	}
	new Ajax.Updater(divName, '/action_ajax/home.php', opt);
}

function jsRequestNbDocPrec(options){
	if ( $('divNbArtContentPrec').style.display=='none' ) {
		var params = new Hash({action:'get_nbdoc_prec'});
		var opt = {
		    method: 'post',
			parameters: params.merge(options).toQueryString(),
			onComplete: function(t){
				Effect.toggle('divNbArtContentPrec','BLIND');
			}
		}
		new Ajax.Updater('divNbArtContentPrec', '/action_ajax/home.php', opt);
	} else {
		Effect.toggle('divNbArtContentPrec','BLIND');
	}
}


/**
 * Création de la chaine des parametres
 */
function toParamString( params ) {
	paramString = '';
	for (var i=0 ; i<params.length ; ++i ){
		for (var paramName in params[i]){
			paramString += paramName + "=" + params[i][paramName] + "&";
		}
	}
	return paramString;
}

/**
 * isset
 */
function isset(varName) {
	if(undefined===$(varName)){
		return false;
	}
	return true;
}
function changeDisplay( elem ) {
	if ( document.getElementById( elem ).style.display == 'none' ) {
		document.getElementById( elem ).style.display = 'block';
	} else {
		document.getElementById( elem ).style.display = 'none';
	}
}

function cursorWait(){
	document.body.style.cursor = 'wait';
}
function cursorDefault(){
	document.body.style.cursor = 'default';
}
function cleanText(text) {
	return trim(text.replace(/<\/?(table|tr|td|script|b|i|em|strong|font|script)[^>]*>/g, " "));
}
function trim(string){
	return string.replace(/(^\s*)|(\s*$)/g,'');
}

/**
 * Ajout d'un domaine de dépôt
 * @param {Object} elem : element domaine
 * @param {Object} domainCode : nouveau code domaine à ajouter
 * @param {Object} DomainText : texte du nouveau domaine à rajouter
 * @param {Object} reload : recharge
 */
function addDomain( elem, domainCode, DomainText, reload, options ) {
	//Vérification de la présence du domaine à ajouter
	domains = $F(elem);
	if ( ! domains.include('['+domainCode+']') ) {
		//Ajout du domaine dans la liste
		$(elem).value += '[' + domainCode +']' ;
		var domain = document.createElement("li");
		domain.id = "elem_" + domainCode;
		domain.setAttribute("style", "margin-top:5px;");
		domain.innerHTML = "<span class=\"handle\">"+ DomainText + "</span>&nbsp;<a href=\"javascript:void(0);\" onclick=\"rmDomain( this, '"+ elem +"', '"+ domainCode +"', "+( reload ? 1 : 0 )+" );\"><img src=\"images/b_drop_mini.png\" border=\"0\" align=\"absmiddle\"/></a>";
		$('list_'+elem).appendChild(domain);

		sortableDomain(elem, options);
		if ( reload ) { // on reload la page méta pour prendre en compte les nouveaux domaines
			submitForm('depot_document');
		}
	}
	

	// if (popup.document) { popup.close(); }
}

function sortableDomain ( elem, options ) {
	//Sortable.destroy(domains);
	Sortable.create('list_'+elem,{
		tag:'li',
		handle:'handle',
		onChange:function(){
			if ( elem=='domain' ) {
				changeStyleDomain( elem );
			}
		},
		onUpdate:function(){
			if ( elem=='domain' ) {
				new Ajax.Request('/action_ajax/submit.php', {
					method: 'post',
					parameters: toParamString(new Array(options, {action:'save_domainOrder'}))+ "&" + Sortable.serialize('list_'+elem),
					onComplete: function(t) {
				    	changeOrderDomain(elem);
				    }
				});
			} else {
				changeOrderDomain(elem);
			}
		}
	});
}


function rmDomain( obj, elem, domain, reload ) {
	$(elem).value = $F(elem).replace('['+domain+']', '');
	obj.parentNode.remove();
	if ( reload ) {
		submitForm('depot_document');
	}
	changeStyleDomain();
}

function changeOrderDomain( elem ){
	$(elem).value = "";
	var elems = $$("#list_"+elem+" li");
	elems.each(function(domain) {
	   $(elem).value += '[' + $(domain).id.replace('elem_', '') + ']' ;
	});
}

function changeStyleDomain( elem ){
	var domains = $$("#list_"+elem+" li");
	domains.each(function(domain, index) {
	   $(domain).className = index==0 ? "domain_primaire" : "";
	});
}

function submitForm( f ) {
	if ($(f).checkValidity ){// browser supports validation
		for (var i=0; i<$(f).elements.length; i++) {
			$(f).elements[i].required=false;
		}
		if( ! $(f).checkValidity()){ // form has errors,
		// the browser is reporting them to user
		// we don't need to take any action
		}else{ // passed validation, submit now
			$(f).submit();
		}
	}else{ // browser does not support validation
		$(f).submit();
	}
}

function droppableSearch ( droppableId, accept, div, options ) {
	Droppables.add( droppableId, {
		accept: accept,
		hoverclass: (droppableId=='trash'?'trash_hoverclass':'hoverclass'),
		onDrop:function(element){
			var elems = new Hash();
			$$("#request .input").each(function(item) {
				elems.set( item.id , $F(item) );
			});
			new Ajax.Updater(div, '/action_ajax/search.php', {
				method: 'post',
				parameters: elems.merge({action:'modify_request', 'pos_add':droppableId,  'id':element.id, 'class':element.className}).merge(options).toQueryString(),
				evalScripts:true,
				onComplete:function(request){new Effect.Highlight("request",{});$(droppableId).className += ' hoverclass_'; }
			})
		}
	});
}

function verifyRequest ( options ) {
	var elems = new Hash();
	$$("#request .input").each(function(item) {
	   elems.set( item.id , $F(item) );
	});
	new Ajax.Request( '/action_ajax/search.php', {
		method: 'post',
		parameters: elems.merge({action:'verify_requestSearch'}).merge(options).toQueryString()
	})
}

function starteffect( element ) {
	//if ( element.parentNode.className=='list_scroll' ) {
		element.parentNode.style.position =  'static';
		if ( Prototype.Browser.IE ) {
		  	element.style.position =  'absolute';
			$A(element.parentNode.getElementsBySelector('li')).each(function(item) {
		  	if ( element.id != item.id )
		  		item.style.visibility = 'hidden';
			});
		}
	//}
}

function endeffect( element ) {
	//if ( element.parentNode.className=='list_scroll' ) {
		if ( Prototype.Browser.IE ) {
			element.parentNode.style.position =  'relative';
			element.style.position =  'relative';
			$A(element.parentNode.getElementsBySelector('li')).each(function(item) {
			  item.style.visibility = 'visible';
			});
		}
	//}
}

function droppableIE ( options ) {
	droppableSearch('request', ['elem_search_field','elem_search_type','elem_search_link','elem_search_group'],'request' , options);
	droppableSearch('trash', ['search_field','search_type','search_link','search_group'],'request' , options );
}

function jsRequestAutoComplete(inputID, divID, indId, options){
	var params = new Hash({action:'list'});
	var opt = {
	    method: 'post',
		evalScripts: true,
		indicator: indId,
		parameters: params.merge(options).toQueryString(),
		callback: function ( field, search ) {
			return 'value='+$F(field);
		}
	}
	new Ajax.Autocompleter(inputID, divID, '/action_ajax/search.php', opt);
}

function jsRequestMajCptConsult(docid){
	var params = new Hash({action:'maj_cpt', docid:docid});
	new Ajax.Request( '/action_ajax/open_file.php', {method: 'post', parameters: params.toQueryString()});
	return true;
}

function navigate(queryID, page, pageNb, options) {
	$('indicator').style.display = 'inline';
	var params = $H(options);
	// Affichage des boutons de navigation
	if( ! params.get('limit') ) {
		var h = $H({ first : 'visible', prev : 'visible', next : 'visible', last : 'visible' }) ;
		if ( page<=1 ) {
			page = 1;
			['first', 'prev'].each(function(s) { h.set(s, 'hidden'); });
		} else if ( page>= pageNb) {
			page = pageNb;
			['next', 'last'].each(function(s) { h.set(s, 'hidden'); });
		}
		h.each(function(elem) {
	  		if ( $('nav_'+ elem.key + queryID) )
	  			$('nav_'+ elem.key + queryID).setStyle({ visibility: elem.value});
		});
		if ( $('nav_page' + queryID) )
			$('nav_page' + queryID).value = page ;
	}
	//Récupération des datas
	var opt = {
	    method: 'post',
	    evalScripts: true,
		parameters: params.merge({queryID:queryID,page:page, action: 'navigate'}).toQueryString(),
		onSuccess: function(t) {
			$('indicator').style.display = 'none';
		}
	}
	new Ajax.Updater($$('#tdata'+queryID+' tbody')[0], '/action_ajax/table.php', opt);
	
	if( params.get('limit') && ! isNaN(params.get('limit')) && params.get('limit')!=0 ) {
		//Rechargement de la navigation
		var opt = {
		    method: 'post',
		    parameters: params.merge({queryID:queryID,toolbar:1, action: 'navigate'}).toQueryString(),
			onSuccess: function(t) {
				Element.replace('tnav_'+queryID, t.responseText)
			}
		}
		new Ajax.Request( '/action_ajax/table.php', opt);
	} 
}


function jsRequestExport(div, docid, options){
	if ( $(div).innerHTML == '' ) {
		var params = new Hash({action:'export_in_format', docid:docid});
		new Ajax.Updater(div, '/action_ajax/browse.php', {	method: 'post',	evalScripts: true, parameters: params.merge(options).toQueryString()});
	} else {
		$(div).innerHTML = '';
	}
}

function showHelp( elem, content, title, opt ) {	
	opt = $H(opt);
	new Tip(elem, $(content), {
	  title: title,
	  style: 'default',
	  stem: 'topLeft',
	  delay: 0.1,
	  hideOthers: true,
	  width: parseInt(opt.get('width')),
	  border: 3,
	  radius: 3,
	  hook: { tip: 'topLeft', mouse: true },
	  offset: { x: 10, y: 10 }
	});
}

function hideHelp() {
	$$(".prototip").invoke('hide');
}

function send_comment( form, options) {
	if ( verify_form($(form), ['name', 'email', 'comment'], ['email']) ) {
		new Ajax.Request('/action_ajax/send_comment.php', {
			method: 'post', 
			parameters: $H(options).merge({action: 'comment'}).merge($(form).serialize({hash : true})).toQueryString(),
			onSuccess: function(t) { 
			 	$(form).reset();
			 	alert('commentaire posté !');
			 	Effect.toggle('send_content','BLIND');
			}
		});
	}
}

function map() {
	var params = new Hash({lat:$F('gpslatitude'), long:$F('gpslongitude')});
	new Ajax.Updater('map_canvas', '/action_ajax/maps.php', {method: 'post', evalScripts: true, parameters: params.toQueryString(), onSuccess: function(t) { $('map_canvas').show();}});
}

function mapRect() {
	$("map_wrapper").style.display = 'block';
	var params = new Hash({selectRect: 1, lat1:$F('gpslatitude1'), long1:$F('gpslongitude1'), lat2:$F('gpslatitude2'), long2:$F('gpslongitude2')});
	new Ajax.Updater('map_wrapper', '/action_ajax/maps.php', {method: 'post', evalScripts: true, parameters: params.toQueryString(), onSuccess: function(t) { $('map_canvas').show();}});
}

function map_getLocalisation(latlng) {
	if ( latlng != null ) {
		$('gpslatitude').value = latlng.lat();
		$('gpslongitude').value = latlng.lng();
		//Ville + Country
		var params = new Hash({lat:$F('gpslatitude'), long:$F('gpslongitude'), geoname: 1});
		new Ajax.Request('/action_ajax/maps.php', {
			method: 'post', 
			parameters: params.toQueryString(), 
			onSuccess: function(t) { 
				param = t.responseText.evalJSON();
				$("ville").value = param.ville;
				$("pays").value = param.pays;
			}
		});		
	}
}


function loadLastArticle( elemid ) {	
	var i=0;
	$$('#lastArticleCatList div').each(function(e) {
		if ( $(e).id=='catart_'+elemid )  {
			$($(e).id).addClassName('actif');
			$('listart_'+i).show();
		} else {
			$(e).removeClassName('actif');
			$('listart_'+i).hide();
		}	
		++i;
	});
}

var Timer=null; 	 
var pas = 10; 	 
function homeMoveDomain(direction) { 	 
        if(parseInt($('lastArticleCatList').style.left) + (pas*direction)>0)  { 	 
                clearTimeout(Timer); 	 
        } else if( (parseInt($('lastArticleCatList').style.left) + (pas*direction))<- ($('lastArticleCatList').offsetWidth - $('lastArticleCat').offsetWidth)) { 	 
                clearTimeout(Timer); 	 
        } else { 	 
        $('lastArticleCatList').style.left = (parseInt($('lastArticleCatList').style.left) + (pas*direction)) + "px"; 	 
        } 	 
        Timer = setTimeout("homeMoveDomain(" + direction + ");", 30); 	 
}

function calendar (inputField, trigger)
{
	Calendar.setup({
		inputField: inputField,
		dateFormat:'%Y-%m-%d',
		trigger: trigger,
		align: 'Bl',
		onSelect: function() { 
			this.hide() 
		}, 
		bottomBar: false });
}

function flash_video(flv, layer) 
{
	var flashvars = {file: flv};
	var params = {allowscriptaccess: "always", allowfullscreen: "true", menu: "false"};
	var attributes = {};

	swfobject.embedSWF("/javascript/player.swf", layer, "320", "240", "9.0.0", false, flashvars, params, attributes);
}

function addDocument(repid, options)
{
	var opt = {
	    method: 'post',
		parameters: toParamString(new Array(options, {action:'add_rep_document', repid:repid, docid:$F('docid')})),
		onSuccess: function(t) {
			if (t.responseText == '') {
				//Erreur
				alert('Le document est déjà présent dans le répertoire');
			} else {
				//Ok
				if ($('content_list') == undefined) {
					alert('Le document a été rajouté au répertoire');
				} else {				
					var content = $('row_tpl').innerHTML;
					content = content.replace(/REPID/g, repid);
					content = content.replace(/DOCID/g, $F('docid'));
					content = content.replace(/REFBIBLIO/g, t.responseText);
					$('content_list').innerHTML = $('content_list').innerHTML + content;
					$('docid').value = '';
				}
			}
	    } 
	}      
	new Ajax.Request('action_ajax/myrep.php', opt);
}

function deleteDocument(repid, id, options)
{
	var opt = {
		    method: 'post',
			parameters: toParamString(new Array(options, {action:'del_rep_document', repid:repid, id:id})),
			onSuccess: function(t) {
				var elem = 'elem_' + repid + '_' + id;
				$(elem).remove();
		    } 
		}      
		new Ajax.Request('action_ajax/myrep.php', opt);
}