jQuery.noConflict();

jQuery(document).ready(function(){

jQuery('#b_level *').replaceText( /\bAeroView\b/gi, '<img src=\'http://www.aerowest.de/av.png\' >' );
jQuery('#b_level *').replaceText( /\bAeroDach\b/gi, '<img src=\'http://www.aerowest.de/ad.png\' >' );
jQuery('#b_level *').replaceText( /\bAeroSolar\b/gi,'<img src=\'http://www.aerowest.de/as.png\' >' );
	
//contentType: "charset=UTF-8",
jQuery('.menu-item-155 a').tinyTips('light', '<span style=\'color:#232D52;\'>Luftbilder & Geodaten f&uuml;r den GIS-Einsatz</span>');
jQuery('.menu-item-205 a').tinyTips('light', '<span style=\'color:#A32F30;\'>Dachaufma&szlig;e per Mausklick</span>');
jQuery('.menu-item-295 a').tinyTips('light', '<span style=\'color:#EEAF21;\'>Solarpotentialanalyse per Mausklick</span>');



jQuery("a#onlinetarif").fancybox({
'width':660,
'height':760,
'autoScale':false,
'transitionIn':'none',
'transitionOut':'none',
'overlayOpacity':0.3,
'overlayColor': '#000',
'hideOnOverlayClick':false,
'type':'iframe'
});
	
//activates the toggle shortcode js
jQuery('#top').k_toggle();

jQuery("a.transition").click(function(event){
event.preventDefault();
linkLocation = this.href;
jQuery("body").fadeOut(1000, redirectPage);		
});
		
function redirectPage() {
window.location = linkLocation;
}
});


(function($)
{
$.fn.k_toggle = function(options) 
{
var defaults = 
{
heading: '.toggler',
content:'.toggle'

};

var options = $.extend(defaults, options);

return this.each(function()
{
var container = $(this),
heading   = $(options.heading, container),
allContent = $(options.content, container);
			
heading.bind('click', function()
{
var thisheading =  $(this);
content = thisheading.next(options.content, container);

if(content.is('.open'))
{
content.removeClass('open').slideUp(500);
thisheading.removeClass('activeTitle');
}
else
{
if(thisheading.is('.closeAll'))
{
allContent.removeClass('open').slideUp(500);
heading.removeClass('activeTitle');
}
content.addClass('open').slideDown(500);
thisheading.addClass('activeTitle');
}
});
});
}
})(jQuery); 


document.documentElement.className += ' js_active ';
(function($){
  '$:nomunge'; 
  $.fn.replaceText = function( search, replace, text_only ) {
    return this.each(function(){
      var node = this.firstChild,
        val,
        new_val,
        
        // Elements to be removed at the end.
        remove = [];
      
      // Only continue if firstChild exists.
      if ( node ) {
        
        // Loop over all childNodes.
        do {
          
          // Only process text nodes.
          if ( node.nodeType === 3 ) {
            
            // The original node value.
            val = node.nodeValue;
            
            // The new value.
            new_val = val.replace( search, replace );
            
            // Only replace text if the new value is actually different!
            if ( new_val !== val ) {
              
              if ( !text_only && /</.test( new_val ) ) {
                // The new value contains HTML, set it in a slower but far more
                // robust way.
                $(node).before( new_val );
                
                // Don't remove the node yet, or the loop will lose its place.
                remove.push( node );
              } else {
                // The new value contains no HTML, so it can be set in this
                // very fast, simple way.
                node.nodeValue = new_val;
              }
            }
          }
          
        } while ( node = node.nextSibling );
      }
      
      // Time to remove those elements!
      remove.length && $(remove).remove();
    });
  };  
  
})(jQuery);




