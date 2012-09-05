// Shared Javascript functions - available to templates of all sites (AcPro, ELT, ESL, Bibles etc)

// Instead of attaching event handlers directly to events, 
// use the following syntax (uses library functions below)

//addEvent(window, 'load', function()
//{ 
//  hide(); 
//}
//);

// toggle visibility: hide the element by default; user can then choose to show the element, or hide as preferred

//function hide(){
//    var e = document.getElementById('toggleGroup');
//    if (e) e.style.display = 'none';
//}	 
	   
function toggle_visibility(id) {
  var e = document.getElementById(id);
  if (!e) return false;
  if(e.style.display == 'block')
    e.style.display = 'none';
  else
    e.style.display = 'block';
 }




// LIBRARY FUNCTIONS


function addEvent( obj, type, fn )
{
	if (obj.addEventListener)
		obj.addEventListener( type, fn, false );
	else if (obj.attachEvent)
	{
		obj["e"+type+fn] = fn;
		obj[type+fn] = function() { obj["e"+type+fn]( window.event ); }
		obj.attachEvent( "on"+type, obj[type+fn] );
	}
}


getElementsByClassName = function (needle)
{
  var         my_array = document.getElementsByTagName("*");
  var         retvalue = new Array();
  var        i;
  var        j;

  for (i = 0, j = 0; i < my_array.length; i++)
  {
    var c = " " + my_array[i].className + " ";
    if (c.indexOf(" " + needle + " ") != -1)
      retvalue[j++] = my_array[i];
  }
  return retvalue;
}


