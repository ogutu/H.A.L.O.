/**
 * Ajoute une valeur par défaut à un champ de type texte.
 *
 */

function initInputsText() {
    var elem = $$('input.default_value');
	for ( var i=0; i<elem.length ; ++i ) {
		initInputText(elem[i]);
	}
}

function initInputText( elem ) {
	Event.observe(elem, 'focus', clearDefaultText);
    Event.observe(elem, 'blur', replaceDefaultText);
    if ($F(elem) != '') {
        $(elem).defaultText = $F(elem);
		$(elem).className = 'formulaire_auto'; 
    }
}



function clearDefaultText(e) {
    var target = window.event ? window.event.srcElement : e ? e.target : null;
    if (!target) return;
    
	if (target.value == target.defaultText) {
        target.value = '';
		$(target).className = 'formulaire'; 
    }
}

function replaceDefaultText(e) {
    var target = window.event ? window.event.srcElement : e ? e.target : null;
    if (!target) return;
    
    if (target.value == '' && target.defaultText) {
        setInputDefaultText(target);
    }
} 

function setInputDefaultText(elem) {
	$(elem).className = 'formulaire_auto'; 
	$(elem).value = $(elem).defaultText;
}