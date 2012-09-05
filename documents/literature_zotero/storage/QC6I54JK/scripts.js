function init() {
	initImageBox();
	linkify();
}

function PrintView () {
	window.print();
}

function SearchURL(aWebsite) { 
	if (aWebsite == "vorarlberg") {
      		//location.href = 'http://suche.vorarlberg.at/vlr/vlr_search.nsf/agent?OpenAgent&amp;query=' 
      		//+ document.forms['such_form'].query.value + '&amp;scope=1+5';
      		location.href = 'http://suche.vorarlberg.at/vlr/vlr_search_NG2.nsf/agent?OpenAgent&layoutID=vorarlberg.at_de&scopeID=vorarlberg.at_de&pageSize=10&query=' 
      		+ document.forms['such_form'].query.value
	};
	if (aWebsite == "landtag") {
      		//location.href = 'http://suche.vorarlberg.at/vlr/vlr_search.nsf/agent?OpenAgent&amp;query=' 
      		//		+ document.forms['such_form'].query.value + '&amp;scope=2';
		location.href = 'http://suche.vorarlberg.at/vlr/vlr_search_NG2.nsf/agent?OpenAgent&amp;layoutID=landtag' +
			'&amp;scopeID=landtag&amp;pageSize=10&amp;query=' + document.forms['such_form'].query.value
	};
	if (aWebsite == "english") {
      		//location.href = 'http://suche.vorarlberg.at/vlr/vlr_search.nsf/agent?OpenAgent&amp;query=' 
       		//+ document.forms['such_form'].query.value + '&amp;scope=3+4';
      		location.href = 'http://suche.vorarlberg.at/vlr/vlr_search_NG2.nsf/agent?OpenAgent&layoutID=vorarlberg.at_en&scopeID=vorarlberg.at_en&pageSize=10&query=' 
       		+ document.forms['such_form'].query.value
	}
	if (aWebsite == "landesarchiv") {
      		//location.href = 'http://suche.vorarlberg.at/vlr/vlr_search.nsf/agent?OpenAgent&amp;query=' 
       		//+ document.forms['such_form'].query.value + '&amp;scope=3+4';
      		location.href = 'http://suche.vorarlberg.at/vlr/vlr_search_NG2.nsf/agent?OpenAgent&layoutID=landesarchiv&scopeID=landesarchiv&pageSize=10&query=' 
       		+ document.forms['such_form'].query.value
	}
} 

/* Anfang Badeseen */

function wechsel(inObject) {
	var inLink, badeseeNr, mark;
	inLink = inObject.href;
	badeseeNr = inLink.substr((inLink.lastIndexOf("=") + 1), (inLink.length - inLink.lastIndexOf("=")));
	
	mark = document.getElementById("marker_img_" + badeseeNr);	
	anImageName = mark.src.split("/");
	anImageName = anImageName[anImageName.length - 1];
	anImageName = anImageName.split(".");
	
	if (anImageName[0].indexOf("_hl") > 0) {
		mark.src = "grafik/" + anImageName[0].replace(/_hl/g,"") + "." + anImageName[1];
	} else {
		mark.src = "grafik/" + anImageName[0] + "_hl." + anImageName[1];	
	}
}

/* Ende Badeseen */

/* Anfang Bildvergr?sserung */

function getPageScroll() {
	var yScroll;

	if (self.pageYOffset) {
		yScroll = self.pageYOffset;
	} else if (document.documentElement && document.documentElement.scrollTop) {  // Explorer 6 Strict
		yScroll = document.documentElement.scrollTop;
	} else if (document.body) {  // all other Explorers
		yScroll = document.body.scrollTop;
	}
	arrayPageScroll = new Array('', yScroll) 
	return arrayPageScroll;
}


function getPageSize() {
	var xScroll, yScroll;

	if (window.innerHeight && window.scrollMaxY) {	
		xScroll = document.body.scrollWidth;
		yScroll = window.innerHeight + window.scrollMaxY;
	} else if (document.body.scrollHeight > document.body.offsetHeight){  // all but Explorer Mac
		xScroll = document.body.scrollWidth;
		yScroll = document.body.scrollHeight;
	} else {  // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
		xScroll = document.body.offsetWidth;
		yScroll = document.body.offsetHeight;
	}
	
	var windowWidth, windowHeight;

	if (self.innerHeight) {	// all except Explorer
		windowWidth = self.innerWidth;
		windowHeight = self.innerHeight;
	} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
		windowWidth = document.documentElement.clientWidth;
		windowHeight = document.documentElement.clientHeight;
	} else if (document.body) { // other Explorers
		windowWidth = document.body.clientWidth;
		windowHeight = document.body.clientHeight;
	}	
	// for small pages with total height less then height of the viewport
	if (yScroll < windowHeight) {
		pageHeight = windowHeight;
	} else { 
		pageHeight = yScroll;
	}
	// for small pages with total width less then width of the viewport
	if (xScroll < windowWidth) {	
		pageWidth = windowWidth;
	} else {
		pageWidth = xScroll;
	}
	arrayPageSize = new Array(pageWidth,pageHeight,windowWidth,windowHeight) 
	return arrayPageSize;
}

function addImageBoxHTML() {
	var anImageBox = document.createElement('div');
	
	anImageBox.id = 'imagebox';
	anImageBox.innerHTML = "<div id='imagebox_control'><span class='dia_voriges'><a id='imagebox_control_prev' rel='imagebox' href='#'>Voriges</a></span><span class='punkt'>&nbsp;&middot;</span><span  class='dia_naechstes'><a id='imagebox_control_next' rel='imagebox' href='#'>N&auml;chstes</a></span><span class='dia_start'><a id='imagebox_control_close' rel='imagebox' href='#'>Bild Schlie&szlig;en</a></span></div><div id='imagebox_img_container'><a id='imagebox_anchor' href='#' rel='imagebox'><img id='imagebox_image'/></a></div><div id='loadbox'><img src='/cmsinclude/loading.gif'/>&nbsp;Bild wird geladen...</div><div id='imagebox_control_desc'><span id='imagebox_desc' class='dia_punkt'>Beschreibung</span></div>";
	
	var pageBody = document.getElementsByTagName('body')[0];

	pageBody.appendChild(anImageBox);
}

function initImageBox() {
	var arrPageSize = getPageSize();
	if (arrPageSize[3] > 768) { // sollen nur dann inline gezeigt werden, wenn genuegend Platz vorhanden ist
		addImageBoxHTML();
		if (!document.getElementsByTagName) { return; }
		
		anImageBox = document.getElementById('imagebox');
		anImageBox_desc = document.getElementById('imagebox_desc');
		anImageBox_img_container = document.getElementById('imagebox_img_container');
		anImageBox_image = document.getElementById('imagebox_image');
		anImageBox_anchor = document.getElementById('imagebox_anchor');
		anImageBox_loading = document.getElementById('loadbox');
		anImageBox_next = document.getElementById('imagebox_control_next');
		anImageBox_prev = document.getElementById('imagebox_control_prev');

		var anchors = document.getElementsByTagName("a");
		for (var i=0; i<anchors.length; i++){
			var anchor = anchors[i];
			var anchorhref = anchor.getAttribute("href");
			if (anchorhref == null)
				continue;
			if (anchor.getAttribute("rel") == "imagebox") {
				anchor.onclick = function () { showImageBox(this); return false; }
				addImageToArray(anchor, "artikel");
			} else {
				if ( (anchor.childNodes.length != 1) || (anchor.childNodes[0].nodeName.toLowerCase() != "img") )
					continue;
				var child = anchor.childNodes[0];
				var imgsrc = child.getAttribute("src");
				if (imgsrc == null)
					continue;
				var anchorhrefextpos = anchorhref.lastIndexOf(".");
				var imgsrcextpos = imgsrc.lastIndexOf(".");
				if ( (anchorhrefextpos < 0) || (imgsrcextpos < 0) )
					continue;
				var anchorhrefext = anchorhref.substr(anchorhrefextpos);
				var imgsrcext = imgsrc.substr(imgsrcextpos);
				if (anchorhrefext.toLowerCase() != imgsrcext.toLowerCase())
					continue;
				anchor.onclick = function () { showImageBox(this); return false; }
				addImageToArray(anchor, "artikel");
			}
		}
	}
}

var anImageArray = [];

function addImageToArray(image, group) {
	if (image.href.substring(image.href.length -1) != "#") {
		anImagePreload = new Image();
		anImagePreload.src = image.href;          
		var aTempImageArray = [];
		aTempImageArray[0] = new Object();
		aTempImageArray[0]["group"] = group;
		aTempImageArray[0]["image"] = image.href;
		aTempImageArray[0]["title"] = "";
		var myNode;
		for (var i = 0; i < image.childNodes.length; i++){
			myNode=image.childNodes[i];
			if(myNode.nodeType == 1 && /img/i.test(myNode.nodeName)) {
				aTempImageArray[0]["title"] = myNode.alt;
				break;
			}
		}
		this.anImageArray.push(aTempImageArray[0]);
		aTempImageArray = null;
	}
}

function findSlidePosition(slide) {
	for (var i = 0;i < anImageArray.length;i++){
		if (anImageArray[i]["image"]==slide){
			return i;	
		}			
	}
	return -1;
}


function createHref(ImageLink) {
	var anchora = document.createElement('a');

	anchora.href = ImageLink;
	return anchora;
}

var anImageBox, anImageBox_desc, anImageBox_image, anImageBox_anchor, anImageBox_loading, anImageBox_next, anImageBox_prev, anImageBox_img_container;

function showImageBox(image) {
	var IMAGEBOX_WIDTH = 800;
	var IMAGEBOX_HEIGHT = 700;
	var IMAGEBOX_TOP = 40;
	var theImagePosition = findSlidePosition(image.href);
	var theImageCount = anImageArray.length - 1;
	
	anImageBox_img_container.style.display = "none";
	anImageBox_image.src = '#';

	anImageBox_prev.style.display = "inline";
	var prev_index = theImagePosition - 1;
	if (prev_index < 0) {prev_index = theImageCount;}
	anImageBox_prev.onclick = function() { showImageBox(createHref(anImageArray[prev_index]["image"])); }

	anImageBox_next.style.display = "inline";
	var next_index = theImagePosition + 1;
	if (next_index > theImageCount) {next_index = 0;}
	anImageBox_next.onclick = function() { showImageBox(createHref(anImageArray[next_index]["image"])); }

	if (image.href.substring(image.href.length-1) == "#") {
		anImageBox.style.display = 'none';
		anImageBox_loading.style.display = "none";		
		return; 
	}

	var arrayPageSize = getPageSize();
	var arrayPageScroll = getPageScroll();
	// alert ("arrayPageSize: " + arrayPageSize + " - arrayPageScroll: " + arrayPageScroll);
	
	anImageBox.style.display = 'block';
	anImageBox.style.top = IMAGEBOX_TOP + 'px';
	anImageBox.style.left = ((arrayPageSize[0] - 20 - (IMAGEBOX_WIDTH)) / 2)+"px";
	anImageBox_loading.style.display = "block";	
	anImageBox_loading.style.top = ((IMAGEBOX_HEIGHT/2) - 15) + 'px';
	anImageBox_loading.style.left = ((IMAGEBOX_WIDTH/2)-(170/2)) + 'px';

	var imgPreload = new Image();

	imgPreload.onload = function() {
		imgPreload.onload = null;
		anImageBox_image.src = image.href;
		
		var lightboxTop = IMAGEBOX_TOP;   //130;
		var lightboxLeft = ((arrayPageSize[0] - 20 - (imgPreload.width + 16)) / 2);
		
		anImageBox.style.top = (lightboxTop < 0) ? "0px" : lightboxTop + "px";

		if(imgPreload.width > IMAGEBOX_WIDTH) {
			anImageBox_img_container.style.width = IMAGEBOX_WIDTH + 'px'
			anImageBox_img_container.style.left = '15px';
		
		} else {
			anImageBox_img_container.style.left = (15 + ((IMAGEBOX_WIDTH/2)-(imgPreload.width/2))) + 'px';
		}
		
		if(imgPreload.height > IMAGEBOX_HEIGHT) {
			anImageBox_img_container.style.height = IMAGEBOX_HEIGHT + 'px'
			anImageBox_img_container.style.top = '35px';
		} else {
			anImageBox_img_container.style.top = (15 + ((IMAGEBOX_HEIGHT/2)-(imgPreload.height/2))) + 'px';
		}
		
		
		anImageBox_loading.style.display = "none";
		anImageBox_img_container.style.display = "block";
		anImageBox.style.display = 'block';
		anImageBox_image.src = image.href;
	}

	anImageBox_desc.innerHTML = anImageArray[(theImagePosition)]["title"];
	imgPreload.src = image.href;
}

function addLoadEvent(func) {	
	var oldonload = window.onload;
	if (typeof window.onload != 'function') {
		window.onload = func;
	} else {
		window.onload = function() { oldonload(); func(); }
	}
}

/* Ende Bildvergr?sserung */

/* Anfang Anreisserverlinkung */

/**
 * Throughout, whitespace is defined as one of the characters
 *  "\t" TAB \u0009
 *  "\n" LF  \u000A
 *  "\r" CR  \u000D
 *  " "  SPC \u0020
 *
 * This does not use Javascript's "\s" because that includes non-breaking
 * spaces (and also some other characters).
 */


/**
 * Determine whether a node's text content is entirely whitespace.
 *
 * @param nod  A node implementing the |CharacterData| interface (i.e.,
 *             a |Text|, |Comment|, or |CDATASection| node
 * @return     True if all of the text content of |nod| is whitespace,
 *             otherwise false.
 */
function is_all_ws( nod )
{
  // Use ECMA-262 Edition 3 String and RegExp features
  return !(/[^\t\n\r ]/.test(nod.data));
}


/**
 * Determine if a node should be ignored by the iterator functions.
 *
 * @param nod  An object implementing the DOM1 |Node| interface.
 * @return     true if the node is:
 *                1) A |Text| node that is all whitespace
 *                2) A |Comment| node
 *             and otherwise false.
 */

function is_ignorable( nod )
{
  return ( nod.nodeType == 8) || // A comment node
         ( (nod.nodeType == 3) && is_all_ws(nod) ); // a text node, all ws
}

/**
 * Version of |previousSibling| that skips nodes that are entirely
 * whitespace or comments.  (Normally |previousSibling| is a property
 * of all DOM nodes that gives the sibling node, the node that is
 * a child of the same parent, that occurs immediately before the
 * reference node.)
 *
 * @param sib  The reference node.
 * @return     Either:
 *               1) The closest previous sibling to |sib| that is not
 *                  ignorable according to |is_ignorable|, or
 *               2) null if no such node exists.
 */
function node_before( sib )
{
  while ((sib = sib.previousSibling)) {
    if (!is_ignorable(sib)) return sib;
  }
  return null;
}

/**
 * Version of |nextSibling| that skips nodes that are entirely
 * whitespace or comments.
 *
 * @param sib  The reference node.
 * @return     Either:
 *               1) The closest next sibling to |sib| that is not
 *                  ignorable according to |is_ignorable|, or
 *               2) null if no such node exists.
 */
function node_after( sib )
{
  while ((sib = sib.nextSibling)) {
    if (!is_ignorable(sib)) return sib;
  }
  return null;
}

/**
 * Version of |lastChild| that skips nodes that are entirely
 * whitespace or comments.  (Normally |lastChild| is a property
 * of all DOM nodes that gives the last of the nodes contained
 * directly in the reference node.)
 *
 * @param sib  The reference node.
 * @return     Either:
 *               1) The last child of |sib| that is not
 *                  ignorable according to |is_ignorable|, or
 *               2) null if no such node exists.
 */
function last_child( par )
{
  var res=par.lastChild;
  while (res) {
    if (!is_ignorable(res)) return res;
    res = res.previousSibling;
  }
  return null;
}

/**
 * Version of |firstChild| that skips nodes that are entirely
 * whitespace and comments.
 *
 * @param sib  The reference node.
 * @return     Either:
 *               1) The first child of |sib| that is not
 *                  ignorable according to |is_ignorable|, or
 *               2) null if no such node exists.
 */
function first_child( par )
{
  var res=par.firstChild;
  while (res) {
    if (!is_ignorable(res)) return res;
    res = res.nextSibling;
  }
  return null;
}

/**
 * Version of |data| that doesn't include whitespace at the beginning
 * and end and normalizes all whitespace to a single space.  (Normally
 * |data| is a property of text nodes that gives the text of the node.)
 *
 * @param txt  The text node whose data should be returned
 * @return     A string giving the contents of the text node with
 *             whitespace collapsed.
 */
function data_of( txt )
{
  var data = txt.data;
  // Use ECMA-262 Edition 3 String and RegExp features
  data = data.replace(/[\t\n\r ]+/g, " ");
  if (data.charAt(0) == " ")
    data = data.substring(1, data.length);
  if (data.charAt(data.length - 1) == " ")
    data = data.substring(0, data.length - 1);
  return data;
}

function linkify() {

	var errorcnt = 0;
	var allElems = document.getElementsByTagName('DIV');
	
	for (var i = 0; i < allElems.length; i++) {
		try {
			var thisElem = allElems[i];
			var myClassName = thisElem.className;
			var thisChildElem = first_child(thisElem);
			var thisChildChildElem = first_child(thisChildElem);
			switch (myClassName) {
				case 'item_text_bild_links':
					try {
						if (thisElem.parentNode.nodeName=='DIV' && thisElem.parentNode.className == 'breite_100') {
							if (thisElem.parentNode.getElementsByTagName('IMG').length == 0) {
								//thisElem.setAttribute('style','width: 100%;');
								thisElem.style.width = '100%';
							}
						}	
					} catch (e) { }
				case 'termin':
					//alert("thisChildChildElem: " + thisChildChildElem.nodeName);
					if (thisChildChildElem.nodeName == 'A'){				
						for (var j = 0; j < thisElem.childNodes.length;j++) {
							//alert(thisElem.childNodes[j].className);
							if (thisElem.childNodes[j].nodeName=='P'||thisElem.childNodes[j].nodeName=='DIV' && thisElem.childNodes[j].className == 'cms_inhalt') {
								var textData = thisElem.childNodes[j].innerHTML;
								//alert (linkArray[currentPosition]);
								thisElem.childNodes[j].innerHTML = '<a href="' + thisChildChildElem.href + 
									'" class="' + thisChildChildElem.className + '" title="' + thisChildChildElem.title + '">' + textData + '</a>';
							}	
						}
					}
					break;
				case 'titel':
					//alert("thisChildElem: " + thisChildElem.nodeName);
					if (thisChildElem.nodeName == 'A') {				
						if (thisElem.nextSibling.nodeName=='DIV' && thisElem.nextSibling.className == 'cms_inhalt') {
							var textData = thisElem.nextSibling.innerHTML;
							//alert (linkArray[currentPosition]);
							thisElem.nextSibling.innerHTML = '<a href="' + thisChildElem.href + 
								'" class="textdecoration_nein" title="' + thisChildElem.title + '">' + textData + '</a>';
						}
					}
					break;
				default:
					break;
			}
		} catch (e) {
			if (errorcnt-- > 0) {
				alert("Exception: "+e);
			}
		}
	}
}

/* Ende Anreisserverlinkung */