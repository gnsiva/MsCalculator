
// Hide/show div regions

function hideshow(showHideLabel, textDisplaySwitch){
    var swi = document.getElementById(textDisplaySwitch);
    var label = document.getElementById(showHideLabel);

    // this is executed if the text isn't hidden before link is clicked
    // and it hides the div
    if (swi.style.display == "block"){
	swi.style.display = "none";
	label.innerHTML = "(show more)";
    }
    else {
	swi.style.display = "block";
	label.innerHTML = "(hide)";
    }
}

