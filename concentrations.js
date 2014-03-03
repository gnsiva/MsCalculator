<!--

// ================================================================
// Webpage interactivity functions
function calculate1(){
    // TODO - rename
    
    // Get the values from the HTML
    var molarity = document.getElementById('molarity1').value;
    var mgml = document.getElementById('mgml1').value;
    var mm = document.getElementById('mm1').value;
    var data = new Array(molarity,mgml,mm);

    var molarityType = document.getElementById('select1').value;
    var dps = 2; // decimal places for rounding

    // Check there's only one free slot and that entries are numbers
    var unknown = checkData(data);
    if (unknown < 0){
	return unknown;
    }

    // Convert knowns to float
    data = convertToFloats(data,unknown);
    molarity = data[0];
    mgml = data[1];
    mm = data[2];

    // Calculate the answer & put back on the page
    switch (unknown){
    	case 0:
    	molarity = molarityFromMgmlMm(mgml,mm,molarityType);
	document.getElementById('molarity1').value = gishRound(molarity,dps);
    	case 1:
    	mgml = mgmlFromMmM(mm,molarity,molarityType);
	document.getElementById('mgml1').value = gishRound(mgml,dps);
	case 2:
	mm = mmFromMgmlM(mgml,molarity,molarityType);
	document.getElementById('mm1').value = gishRound(mm,dps);
    }
}

function calculate2(){
    // TODO - rename
    
    // Get the values from the HTML
    var mgml = document.getElementById('mgml2').value;
    var mass = document.getElementById('mass2').value;
    var volume = document.getElementById('volume2').value;
    var data = new Array(mgml,mass,volume);

    var massType = document.getElementById('select2a').value;
    var volumeType = document.getElementById('select2b').value;
    var dps = 2; // decimal places for rounding

    // Check there's only one free slot and that entries are numbers
    var unknown = checkData(data);
    if (unknown < 0){
	return unknown;
    }

    // Convert knowns to float
    data = convertToFloats(data,unknown);
    mgml = data[0];
    mass = data[1];
    volume = data[2];

    // Calculate the answer & put back on the page
    switch (unknown){
    	case 0:
	mgml = mgmlFromMassVolume(mass,volume,massType,volumeType);
	document.getElementById('mgml2').value = gishRound(mgml,dps);
    	case 1:
	mass = massFromMgmlVolume(mgml,volume,massType,volumeType);
	document.getElementById('mass2').value = gishRound(mass,dps);
	case 2:
	volume = volumeFromMgmlMass(mgml,mass,massType,volumeType);
	document.getElementById('volume2').value = gishRound(volume,dps);
    }
}

function calculate3(){
    // TODO - rename
    
    // Get the values from the HTML
    var molarity = document.getElementById('molarity3').value;
    var mass = document.getElementById('mass3').value;
    var mm = document.getElementById('mm3').value;
    var volume = document.getElementById('volume3').value;

    var data = new Array(molarity,mass,mm,volume);

    var molarityType = document.getElementById('select3a').value;
    var massType = document.getElementById('select3b').value;
    var volumeType = document.getElementById('select3c').value;

    var dps = 2; // decimal places for rounding

    // Check there's only one free slot and that entries are numbers
    var unknown = checkData(data);
    if (unknown < 0){
	return unknown;
    }

    // Convert knowns to float
    data = convertToFloats(data,unknown);
    molarity = data[0];
    mass = data[1];
    mm = data[2];
    volume = data[3];

    // Calculate the answer & put back on the page
    switch (unknown){
    	case 0:
	molarity = molarityFromMassMmVolume(mass,mm,volume,massType,molarityType,volumeType);
	document.getElementById('molarity3').value = gishRound(molarity,dps);
    	case 1:
	mass = massFromMmMVolume(mm,molarity,volume,massType,molarityType,volumeType);
	document.getElementById('mass3').value = gishRound(mass,dps);
	case 2:
	mm = mmFromMassMVolume(mass,molarity,volume,massType,molarityType,volumeType);
	document.getElementById('mm3').value = gishRound(mm,dps);
	case 3:
	volume = volumeFromMassMmM(mass,mm,molarity,massType,molarityType,volumeType);
	document.getElementById('volume3').value = gishRound(volume,dps);
    }
}


function convertToFloats(data,unknown){
    // Run this before sending data to a calculation function
    for (i=0; i<data.length; i++){
	if (i != unknown){
	    data[i] = parseFloat(data[i]);
	}
    }
    return data;
}

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

function checkData(a){
    var unknown = checkOneIsEmpty(a);
    if (unknown < 0){
	return -1;
    }
    var numberCheck = checkEntriesAreNumbers(a,unknown);
    if (numberCheck < 0 ){
	return -1;
    }
    return unknown;
}

function checkEntriesAreNumbers(a,unknown){
    // Pass an array, and the index of the field which is supposed to be blank
    // returns 0 if everything is fine
    // returns -1 if one or more of the entries are not numbers
    for (i=0; i<i.length; i++){
	if (i != unknown){
	    if (isNan(a[i])){
		alert("Only enter numbers");
		return -1;
	    }
	}
    }
    return 0;
}

function checkOneIsEmpty(a){
    // pass an array
    // function checks that one of the values is ""
    // returns the index of that value
    // error code -1: no values are "" (empty)
    // error code -2: more than one value is empty
    
    var unknown = -1; // no slots are empty
    var nEmpties = 0;
    
    for (i=0; i<a.length; i++){
        if (a[i] == ""){
            unknown = i;
            nEmpties += 1;
        }
    }
    if (nEmpties > 1){
	alert("Only leave one slot empty!");
        return -2;
    }
    else if (nEmpties == 0){
	alert("Leave one field empty and I will calculate it!");
	return -1;
    }
    else {
        return unknown;
    }
}

// ================================================================
// Math functions

// ================
// Molarity, mass, mm (molecular mass) and volume calculations
function molarityFromMassMmVolume(mass,mm,volume,massType,molarityType,volumeType){
    var mgml = mgmlFromMassVolume(mass,volume,massType,volumeType);
    var molarity = molarityFromMgmlMm(mgml,mm,molarityType);
    return molarity;
}

// Test
// console.log(molarityFromMassMmVolume(0.5,45550,0.5,"mg","uM","mL"));
// Answer should be: 21.953896816684964

function mmFromMassMVolume(mass,M,volume,massType,molarityType,volumeType){
    var mgml = mgmlFromMassVolume(mass,volume,massType,volumeType);
    var mm = mmFromMgmlM(mgml,M,molarityType);
    return mm;
}
// Test
// console.log(mmFromMassMVolume(0.2,22,200,"mg","uM","uL"));
// Answer should be: 45454.54545454546

function massFromMmMVolume(mm,M,volume,massType,molarityType,volumeType){
    var mgml = mgmlFromMmM(mm,M,molarityType);
    var mass = massFromMgmlVolume(mgml,volume,massType,volumeType);
    return mass;
}
// Test
// console.log(massFromMmMVolume(45550,22,100,"mg","uM","uL"));
// Answer should be: 0.10021

function volumeFromMassMmM(mass,mm,M,massType,molarityType,volumeType){
    var mgml = mgmlFromMmM(mm,M,molarityType);
    var volume = volumeFromMgmlMass(mgml,mass,massType,volumeType);
    return volume;
}
// Test
// console.log(volumeFromMassMmM(100,45550,22,"ug","uM","uL"));
// Answer should be: 99.79044007584073

// ================
// mgml (concentration), mass and volume conversions
// TODO - write some tests
function mgmlFromMassVolume(mass,volume,massType,volumeType){
    var grams = mass * getMassMultiplier(massType);
    var litres = volume * getVolumeMultiplier(volumeType);
    var mgml = grams/litres;
    return mgml;
}
// Test
// console.log(mgmlFromMassVolume(9.3,1,"mg","mL"));
// console.log(mgmlFromMassVolume(9.3,1,"g","L"));
// console.log(mgmlFromMassVolume(9300,1,"mg","L"));
// console.log(mgmlFromMassVolume(9.3,1000,"mg","uL"));
// Answer should be: 9.3

function massFromMgmlVolume(mgml,volume,massType,volumeType){
    var litres = volume * getVolumeMultiplier(volumeType);
    var grams = mgml * litres;
    return grams / getMassMultiplier(massType);
}
// Test
// console.log(massFromMgmlVolume(1.,.5,"mg","mL"));
// console.log(massFromMgmlVolume(0.001,.5,"mg","L"));
// console.log(massFromMgmlVolume(1.,500,"mg","uL"));
// console.log(massFromMgmlVolume(1.,500,"g","mL"));
// Answer should be: 0.5


function volumeFromMgmlMass(mgml,mass,massType,volumeType){
    var grams = mass * getMassMultiplier(massType);
    var litres = grams / mgml;
    return litres / getVolumeMultiplier(volumeType);
}
// Test
// console.log(volumeFromMgmlMass(50.,2.5,"mg","mL"));
// console.log(volumeFromMgmlMass(50.,0.0025,"mg","uL"));
// console.log(volumeFromMgmlMass(50.,0.0025,"g","mL"));
// console.log(volumeFromMgmlMass(50.,2.5,"g","L"));
// Answer should be: 0.05 (watch out for float errors)
// console.log(volumeFromMgmlMass(50.,2.5,"ug","L"));
// Answer should be: 5e-8
// console.log(volumeFromMgmlMass(1.0021,100,"ug","uL"));
// Answer should be: 99.79044007584073

// Test

// Answer should be: 


// ================
// Molarity, mgml (concentration) and mm (molecular mass) conversions

function molarityFromMgmlMm(mgml,mm,molarityType){
    var molar = mgml/mm;
    return molar/getMolarityMultiplier(molarityType);
}

// Test
// console.log(molarityFromMgmlMm(1.,45550,"uM"));
// Answer should be: 21.953896816684964


function mgmlFromMmM(mm,M,molarityType){
    var molar = M * getMolarityMultiplier(molarityType);
    var mgml = molar * mm;
    return mgml;
}
// Test
// console.log(mgmlFromMmM(45550.,22,"uM"));
// Answer should be: 1.0021

function mmFromMgmlM(mgml,M,molarityType){
    var molar = M * getMolarityMultiplier(molarityType);
    var mm = mgml/molar;
    return mm;
}
// Test
// console.log(mmFromMgmlM(1.,22,"uM"));
// Answer should be: 45454.545454545456

// ================================================================
// Support Functions
function getMolarityMultiplier(molarityType){
    // Get the proportion of molar (M) for the units
    // Correct inputs are "M", "mM" and "uM".
    if (molarityType == "uM"){
        return 1/1000000.;
    }
    else if (molarityType == "mM"){
        return 1/1000.;
    }
    else if (molarityType == "M"){
        return 1.;
    }
    else {
        console.log("Unknown molarity type sent to getMolarityMultiplier()");
        return -1;
    }
}

function getVolumeMultiplier(volumeType){
    // Get the proportion of mL (mL) for the units
    // Correct inputs are "L", "mL" and "uL". 
    if (volumeType == "uL"){
        return 1/1000000.;
    }
    else if (volumeType == "mL"){
        return 1/1000.;
    }
    else if (volumeType == "L"){
        return 1.;
    }
    else {
        console.log("Unknown volume type sent to getVolumeMultiplier()");
        return -1;
    }    
}

function getMassMultiplier(massType){
    // Get the proportion of grams for the units
    // Correct inputs are "g", "mg" and "ug".
    if (massType == "ug"){
        return 1/1000000.;
    }
    else if (massType == "mg"){
        return 1/1000.;
    }
    else if (massType == "g"){
        return 1.;
    }
    else {
        console.log("Unknown volume type sent to getMassMultiplier()");
        return -1;
    }        
}

-->
