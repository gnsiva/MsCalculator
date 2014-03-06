<!--
// ================================================================
// Functions which interact with the webpage
function calculateMz(){
    
    // Get the values for calculation
    var mass = document.getElementById('mz()/mass').value;
    var charge = document.getElementById('mz()/charge').value;
    
    // Decimal points for answer
    var dps = 2;

    // Check all fields have been filled in
    if (mass == "" || charge == ""){
	alert("Fill in the fields first");
	return -1;
    }

    // Check entries are numbers and convert to float
    var check = checkEntriesAreNumbers(Array(mass,charge),-1);
    if (check < 0){
	return -1;
    }
    mass = parseFloat(mass);
    charge = parseFloat(charge);

    // Calculate mz
    var mz = getMz(mass,charge);
    // round number & create output message for HTML
    var message = "m/z = "+gishRound(mz,dps)+" Th";

    // Write value to HTML
    var myTable = document.getElementById('mz()');
    myTable.rows[2].cells[1].innerHTML = message;
}


function calculateMass(){
    
    // Get the values for calculation
    var mz = document.getElementById('mass()/mz').value;
    var charge = document.getElementById('mass()/charge').value;

    // Decimal points for answer
    var dps = 2;

    // Check all fields have been filled in
    if (mz == "" || charge == ""){
	alert("Fill in the fields first");
	return -1;
    }

    // Check entries are numbers and convert to float
    var check = checkEntriesAreNumbers(Array(mz,charge),-1);
    if (check < 0){
	return -1;
    }
    mz = parseFloat(mz);
    charge = parseFloat(charge);

    // Calculate mass
    var mass = getMass(mz,charge);

    // round number & create output message for HTML
    var message = "Mass = "+gishRound(mass,dps)+" Da";

    // Write value to HTML
    var myTable = document.getElementById('mass()');
    myTable.rows[2].cells[1].innerHTML = message;
}



// ================================================================
// Mass spectrometry only calculations

function getMz(mass,z){
    var mz = mass/z + 1.008;
    return mz;
}


function getMass(mz,z){
    var mass = z * (mz-1.008);
    return mass;
}

function calcMass(mzs){
    var maxZs = 100;
    var error;
    var masses = new Array();
    var errors = new Array();
    var tempAverageMass;
    var tempTotal = 0; // used for mass

    for (i=1; i<maxZs; i++){
	masses = new Array();
	tempTotal = 0;
	// Calculate the average mass
	for (j=0; j<mzs.length; j++){
	    masses.push(getMass(mzs[j],i+j));
	    tempTotal += getMass(mzs[j],i+j);
	}
	tempAverageMass = tempTotal/masses.length;
	
	// Calculate the difference to the original mz values
	error = 0;
	for (j=0; j<mzs.length; j++){
	    error += Math.abs(getMass(mzs[j],i+j) - tempAverageMass);
	}
	errors.push(error);
    }
    var lowestErrorI = Math.min.apply(Math, errors);
    //console.log(lowestErrorI);
}

calcMass(Array(3500,3800,4100));

// ================================================================
// Concentration calculations

function c1v1c2v2(c1,v1,c2,v2){
    // Calculates dilutions using the c1.v1 = c2.v2 equation
    // Leave the value to be calculated as ""
    var vals = new Array(c1,v1,c2,v2);
    
    var unknown = -1;
    
    for (i=0; i<4; i++){
        if (vals[i] == ""){
            unknown = i;
        }
    }
    // If there are no empty values to calculate
    // then return the error code -1
    if (unknown == -1){
        return -1;
    }
    
    switch(unknown){
    case 0:
        return vals[2] * vals[3] / vals[1];
    case 1:
        return vals[2] * vals[3] / vals[0];
    case 2:
        return vals[0] * vals[1] / vals[3];
    case 3:
        return vals[0] * vals[1] / vals[2];
    }
}


function concentrationToMolarity(concentration,molecularMass,molarity,molarityType){
    // Leave the value to be calculated as "", any of the first 3 can be calculated
    // Give concentration as mg/ml, molecularMass as daltons.
    // Molarity units is whatever is given in molarityType
    // Molarity type can be "uM", "mM" and "M" (from dropdown so doesn't need checks)
    
    // ================================================================
    // Check other input parameters
    
    var vals = new Array(concentration,molecularMass,molarity);
    var unknown = checkOneIsEmpty(vals);
    
    // No values are blank
    if (unknown == -1){
        return -1;
    }
    // More than one value is blank
    else if (unknown == -2){
        return -2;
    }
    
    // ================================================================
    // Calculate result
    
    multiplier = getMolarityMultiplier(molarityType);
    
    switch (unknown){
    case 0:
        concentration = molecularMass*(molarity*multiplier);
    case 1:
        molecularMass = concentration/(molarity/multiplier);
    case 2:
        molarity = concentration/molecularMass/multiplier;
    }
    return concentration,molecularMass,molarity;
}

function diluteSolids(volume,mass,concentration,volumeType){
    // Only for converting mg/ml at the moment, add molarity later
    // Pretty bait calculation... probably should add the molarity calculation soon
    
    // ================================================================
    // Check input parameters
    var unknown = checkOneIsEmpty(Array(volume,mass,concentration));
    // No values are blank
    if (unknown == -1){
        return -1;
    }
    // More than one value is blank
    else if (unknown == -2){
        return -2;
    }
    
    // ================================================================
    // Deal with volume units
    var multiplier = getVolumeMultiplier(volumeType);
    
    // Calculate result
    switch (unknown){
    case 0:
        volume = mass/concentration/multiplier;
    case 1:
        mass = volume*concentration*multiplier;
    case 2:
        concentration = mass/volume/multiplier;
    }
}

// ================================================================
// Sub functions

// TODO - put these two functions in a separate js file and import into here

function gishRound(number,dps){
    // Standard rounding function, python style
    // TODO - if number is less than 0.00 in dps=2, then show first significant figure
    if (dps > 0){
	var decimal = 10;
	for (i=1; i<dps; i++){
	    decimal *= 10;
	}
	return Math.round(number*decimal)/decimal;
    }
    else {
	return Math.round(number);
    }
}

function checkEntriesAreNumbers(a,unknown){
    // Pass an array, and the index of the field which is supposed to be blank
    // returns 0 if everything is fine
    // returns -1 if one or more of the entries are not numbers
    for (i=0; i<a.length; i++){
	if (i != unknown){
	    if (isNaN(a[i])){
		alert("Only enter numbers");
		return -1;
	    }
	}
    }
    return 0;
}


// ================================================================
// Tests

// function testFunction(functionName,valJs,valPy,precision){
//     if (valJs > valPy-precision && valJs < valPy+precision){
// 	console.log(functionName+" functioning correctly");
//     }
//     else {
// 	console.log(functionName+" malfunctioning returning "+mz+" should be returning "+mzPy+". Difference is "+(mzPy-mz));
//     }    
// }

// // getMz()
// var mz = getMz(45550,13);
// var mzPy = 3503.9236923;
// testFunction("getMz()",mz,mzPy,0.01);

// // getMass()
// var mass = getMass(3510,13);
// var massPy = 45631.008;
// testFunction("getMass()",mass,massPy,0.01);



// c1v1c2v2
// var answer = c1v1c2v2("3","22","","879");
// console.log(answer);
-->
