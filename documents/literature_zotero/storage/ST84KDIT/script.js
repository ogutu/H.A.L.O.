//store the last key code pressed on select element
var selectKeyCode;
//store the value of select element before they are changed or loose focus
var oldSelectValue;
//store the value of onchange attribute for each select
var onChaneValueArray = new Array();

$(document).ready(function(event){
    initOnChangeForSelect("select[onchange]");
});

//to make sure that the change event has the same behavior for all browsers
function initOnChangeForSelect(selector){
    $(selector).each(function (i) {
        $(this).attr("sid",i);
        onChaneValueArray[i] = $(this).attr("onchange");
        $(this).keydown(function(event) {
            selectKeyCode = (event.keyCode ? event.keyCode : event.which);
            if(selectKeyCode == '13' && oldSelectValue != $(this).val()){
                var element = event.target;
                element.onChaneValue = onChaneValueArray[$(element).attr("sid")];
                element.onChaneValue();
            }
        });

        $(this).blur(function(e){
            if(oldSelectValue != $(this).val()){
               var element = e.target;
                element.onChaneValue = onChaneValueArray[$(element).attr("sid")];
                element.onChaneValue();
            }
        });

        $(this).focus(function(event) {
            oldSelectValue = $(this).val();
        });

        $(this).change(function(e) {
           if(selectKeyCode != '38' && selectKeyCode != '40'){
                var element = e.target;
                element.onChaneValue = onChaneValueArray[$(element).attr("sid")];
                element.onChaneValue();

           }
           selectKeyCode = '0';
        });
        $(this).removeAttr("onchange");
    });
}

