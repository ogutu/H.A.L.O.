// JavaScript Document

if (navigator.userAgent.indexOf('Opera') != -1 ) {
document.write('<link rel="stylesheet" type="text/css" href="/css/operahack.css">');
}

if (navigator.userAgent.indexOf("Safari") != -1) {
document.write('<link rel="stylesheet" type="text/css" href="/css/safarihack.css">');
}

function acc(theBlock,obj){

	if(document.getElementById(theBlock).style.display=='block'){ 
		document.getElementById(theBlock).style.display='none';
		obj.style.backgroundImage='url(/fileadmin/templates/design/plus.gif)';
	} else {
		document.getElementById(theBlock).style.display='block';
		obj.style.backgroundImage='url(/fileadmin/templates/design/minus.gif)';
	}

}