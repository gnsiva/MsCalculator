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

//calcMass(Array(3500,3800,4100));

function CalcMass(maxCharge,mzs){
    this.mzs = mzs.sort(function(a,b){return parseFloat(b)-parseFloat(a)});
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
	mass = getMass(mzs[i],this.rootCharge+i);
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

var mzs = new Array(3510.99,3290.65,3749.48);
var maxCharge = 100;

var calcMass = new CalcMass(maxCharge,mzs);
console.log(calcMass.result.mass, calcMass.result.rootCharge, calcMass.result.error);

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
		if (!isNaN(result[1]) && !isNaN(result[2])){
		    x = parseFloat(result[1]);
		    y = parseFloat(result[2]);
		    xvals.push(parseFloat(result[1]));
		    yvals.push(parseFloat(result[2]));
		    plotMassSpectrum(xvals,yvals);
		}
	    }
	};
	reader.readAsText(fileIn.files[0]);
    }
}

function plotMassSpectrum(xvals,yvals){
    var data = new Array();
    for (i=0; i<xvals.length; i++){
	data.push({x: xvals[i], y: yvals[i]});
    }
    var chart = new CanvasJS.Chart("spectrum",{
	data: [
	    {
		type: "line",
		dataPoints: data
	    }
	]
    });
    chart.render();
    // {
    // 	title:{
    // 	    text: "Share Value over a Year"   
    // 	},
    // 	theme: "theme2",
    // 	axisX: {
    // 	    valueFormatString: "MMM"      
    // 	},
    // 	axisY:{
    //         valueFormatString: "#0$"
    // 	},
    // 	data: [
    // 	    {        
    // 		type: "line",
    // 		showInLegend: true,
    // 		legendText: "ABC Share",
    // 		dataPoints: [        
    // 		    { x: new Date(2012, 01, 1), y: 71, indexLabel: "gain", markerType: "triangle",  markerColor: "#6B8E23", markerSize: 12},
    // 		    { x: new Date(2012, 02, 1) , y: 55, indexLabel: "loss", markerType: "cross", markerColor: "tomato" , markerSize: 12  },
    // 		    { x: new Date(2012, 03, 1) , y: 50, indexLabel: "loss", markerType: "cross", markerColor: "tomato" , markerSize: 12 },
    // 		    { x: new Date(2012, 04, 1) , y: 65, indexLabel: "gain", markerType: "triangle", markerColor: "#6B8E23", markerSize: 12 },
    // 		    { x: new Date(2012, 05, 1) , y: 85, indexLabel: "gain", markerType: "triangle", markerColor: "#6B8E23", markerSize: 12 },
    // 		    { x: new Date(2012, 06, 1) , y: 68, indexLabel: "loss", markerType: "cross", markerColor: "tomato" , markerSize: 12 },
    // 		    { x: new Date(2012, 07, 1) , y: 28, indexLabel: "loss", markerType: "cross", markerColor: "tomato" , markerSize: 12 },
    // 		    { x: new Date(2012, 08, 1) , y: 34, indexLabel: "gain", markerType: "triangle", markerColor: "#6B8E23", markerSize: 12 },
    // 		    { x: new Date(2012, 09, 1) , y: 24, indexLabel: "loss", markerType: "cross", markerColor: "tomato" , markerSize: 12 }
    // 		]
    // 	    }
    // 	]    
    // }
}

function readText(that){
    var reader = new FileReader();
    // var regex = /([0-9.]+)\b+([0-9.]+)/;
    // var result;

    var regex = new RegExp("([0-9.\\-e]+).([0-9.\\-e]+)");
    var result;
    var x;
    var y;

    if(that.files && that.files[0]){
	var reader = new FileReader();
	reader.onload = function (e) {  
	    var output=e.target.result;
	    
	    //process text to show only lines with "@":				
	    //output=output.split("\n").filter(/./.test, /\@/).join("\n");
	    output = output.split("\n");
	    for (i=0; i<output.length; i++){
	    	result = regex.exec(output[i]);
		x = parseFloat(result[1]);
		y = parseFloat(result[2]);
	    	// document.write(result[1]+" "+result[2], "<br />");
	    	document.write(x+" "+y, "<br />");
	    }

	    document.getElementById('spectrum').innerHTML = output;
	    // for (i=0; i<output.length; i++){
	    // 	document.write(output[i]);
	    // }
	};//end onload()
	reader.readAsText(that.files[0]);
    }//end if html5 filelist support
} 


-->
