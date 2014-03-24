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

function calcMassFromMzs(){
    var mzs = document.getElementById('mzs').value.split("\n");
    if (checkEntriesAreNumbers(mzs,-1) == 0){
	var maxCharge = 100;
	var calcMass = new CalcMass(maxCharge,mzs);
	var mass = calcMass.result.mass;
	var error = calcMass.result.error;

	var myTable = document.getElementById('calcMassFromMzsTable');
	myTable.rows[0].cells[1].innerHTML = gishRound(mass,2) + " Da";
	myTable.rows[1].cells[1].innerHTML = gishRound(error,2) + " Da";
    }
    else {
	console.log("Error parsing input m/z values");
    }
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

//================================================================
// CalcMass() class
function CalcMass(maxCharge,mzs){
    this.mzs = mzs.sort(function(a,b){return parseFloat(b)-parseFloat(a)});
    for (i=0; i<mzs.length; i++){
	this.mzs[i] = parseFloat(mzs[i]);
    }
    this.maxCharge = maxCharge;
    this.result;

    this.calculateRootChargeState = calculateRootChargeState;
    this.calculateRootChargeState();
}
function calculateRootChargeState(){

    var rcs = new RootChargeState(1,this.mzs);
    var minError = rcs.error;
    var minErrorZ = 1;

    for (rootZ=2; rootZ<=this.maxCharge;rootZ++){
	rcs = new RootChargeState(rootZ,this.mzs);
	if (rcs.error < minError){
	    minError = rcs.error;
	    minErrorZ = rootZ;
	}
    }
    this.result = new RootChargeState(minErrorZ,this.mzs);
}

//================================================================
// RootChargeState() class
function RootChargeState(rootCharge,mzs){
    this.mzs = mzs;
    this.rootCharge = rootCharge;

    this.charges = new Array();
    this.masses = new Array();
    this.mass;
    this.errors = new Array();
    this.error;
    this.calculate = calculate;
    this.calculate();
}
function calculate(){
    // Calculate masses
    for (i=0; i<this.mzs.length; i++){
	mass = getMass(this.mzs[i],this.rootCharge+i);
	this.masses.push(mass);
	this.charges.push(this.rootCharge+i);
    }
    // Calculate average mass
    var sumOfMasses = this.masses.reduce(function(a,b) {return parseFloat(a)+parseFloat(b)});
    this.mass = sumOfMasses/this.masses.length;
    // Calculate errors
    for (i=0; i<this.masses.length; i++){
	this.errors.push(Math.abs(this.masses[i] - this.mass));
    }
    // Calculate average error
    var sumOfErrors = this.errors.reduce(function(a,b) {return parseFloat(a)+parseFloat(b)});
    this.error = sumOfErrors/this.errors.length;
}

// var mzs = new Array(3510.99,3290.65,3749.48);
// var maxCharge = 100;

// var calcMass = new CalcMass(maxCharge,mzs);
// console.log(calcMass.result.mass, calcMass.result.rootCharge, calcMass.result.error);

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

var data = new Data();
var plot = new PlotArea(30,30);

function getSpectrumList(fileIn){
    var regex = new RegExp("([0-9.\\-e]+).([0-9.\\-e]+)");
    var result = new Array();

    if (fileIn.files && fileIn.files[0]){
	var reader = new FileReader();
	reader.onload = function (e){
	    var xvals = new Array();
	    var yvals = new Array();
	    var output = e.target.result;
	    
	    output = output.split("\n");
	    for (i=0; i<output.length; i++){
	    	result = regex.exec(output[i]);
		if (result != null && i%100 == 0){
		    xvals.push(parseFloat(result[1]));
		    yvals.push(parseFloat(result[2]));
		}
	    }
	    drawSpectrum(xvals,yvals);
	};
	reader.readAsText(fileIn.files[0]);
    }
}

function drawSpectrum(xvals,yvals){
    data.setValuesX(xvals);
    data.setValuesY(yvals);
    plot.setGraph("#spectrum");
    plot.drawAxes();
    plot.labelAxisX(data.xlims);
    plot.labelAxisY(data);
    plot.plot(data);
}

function checkAndReturnFloat(s){
    if (isNaN(s)){
	alert("Only enter (positive) numbers");
	return -1;
    }
    return parseFloat(s);
}

function plotCharges(){
    plot.refreshGraph(data);
    var nLigands = getIntFromSelect("nLigands");
    
    // Get the protein mass and the oligomer mass
    var mass = document.getElementById('monomerMass').value;
    mass = checkAndReturnFloat(mass);
    if (mass < 0){
	return -1;
    }
    var oligoState = parseInt(document.getElementById('monomerOligo').value);
    mass = mass * oligoState;

    if (nLigands == 0){
	var minZ = getIntFromSelect("monomerMinZ");
	var maxZ = getIntFromSelect("monomerMaxZ");
	for (z=minZ; z<=maxZ; z++){
	    var mz = getMz(mass,z);
	    plot.axvline(mz,data,z);
	}
    }
    else if (nLigands > 0){
	// Get the ligand mass and check its a number
	var ligandMass = document.getElementById('ligandMass').value;
	ligandMass = checkAndReturnFloat(ligandMass);
	if (ligandMass < 0){
	    return -1;
	}
	// Get charges and draw lines
	var minZ = getIntFromSelect("ligandMinZ");
	var maxZ = getIntFromSelect("ligandMaxZ");
	for (z=minZ; z<=maxZ; z++){
	    var mz = getMz(mass+ligandMass*nLigands,z);
	    plot.axvline(mz,data,"+"+z);
	}
    }
}

function getIntFromSelect(id){
    var e = document.getElementById(id);
    return parseInt(e.options[e.selectedIndex].text);    
}

function mzsTable(){
    
    // Get the protein mass and the oligomer mass
    var mass = document.getElementById('monomerMass').value;
    mass = checkAndReturnFloat(mass);
    if (mass < 0){
	return -1;
    }
    var oligoState = parseInt(document.getElementById('monomerOligo').value);
    mass = mass * oligoState;
    
    // Open new window to display the table
    newWindow = window.open("",null, "height=600,width=500,status=yes,toolbar=no,menubar=no,location=no");
    var css = "<link rel='stylesheet' type='text/css' href='mzTable.css'/>";
    newWindow.document.write(css);
    newWindow.document.write("<table cellspacing='0'>");
    var nLigands = getIntFromSelect("nLigands");
    
    // If you are going to show the protein alone
    if (nLigands == 0){
	var minZ = getIntFromSelect("monomerMinZ");
	var maxZ = getIntFromSelect("monomerMaxZ");
	newWindow.document.write("<tr> <td>Charge</td> <td><i>m/z</i></td>");
	for (z=minZ; z<=maxZ; z++){
	    var mz = gishRound(getMz(mass,z),2);
	    var s = "<tr> <td>"+z+"</td> <td>"+mz+"</td> </tr>";
	    newWindow.document.write(s);
	}
    }
    else if (nLigands > 0){
	// Get the ligand mass and check its a number
	var ligandMass = document.getElementById('ligandMass').value;
	ligandMass = checkAndReturnFloat(ligandMass);
	if (ligandMass < 0){
	    return -1;
	}
	// Get charges and draw lines
	var minZ = getIntFromSelect("ligandMinZ");
	var maxZ = getIntFromSelect("ligandMaxZ");
	newWindow.document.write("<tr> <td>Charge</td> <td>Apo (<i>m/z</i>)</td> <td>"+nLigands+" Ligands (<i>m/z</i>)</td> </tr>");
	for (z=minZ; z<=maxZ; z++){
	    var mzApo = gishRound(getMz(mass,z),2);
	    var mzHolo = gishRound(getMz(mass+ligandMass*nLigands,z));
	    var s = "<tr> <td>"+z+"</td> <td>"+mzApo+"</td> <td>"+mzHolo+"</td> <tr>";
	    newWindow.document.write(s);
	}
    }
    newWindow.document.write("</table>");
}

-->
