
//================================================================
// Data() class
function Data(){
    this.xvals;
    this.yvals;
    this.xlims;
    this.ylims;

    this.setValuesX = setValuesX;
    this.setValuesY = setValuesY;
    this.normaliseBpi = normaliseBpi;
    this.calculateXlims = calculateXlims;
    this.calculateYlims = calculateYlims;
}
function setValuesX(xvals){
    this.xvals = xvals;
    this.calculateXlims();
}
function setValuesY(yvals){
    this.yvals = yvals;
    this.normaliseBpi();
    // TODO - this doesn't really need to happen as it will always be 0,100
    this.calculateYlims();
}
function normaliseBpi(){
    var ymax = Math.max.apply(Math,this.yvals);    
    var newY = new Array();
    for (i=0; i<this.yvals.length; i++){
	newY.push(this.yvals[i]/ymax * 100);
    }
    this.yvals = newY;
}
function calculateXlims(){
    var xmin = Math.min.apply(Math,this.xvals);
    var xmax = Math.max.apply(Math,this.xvals);
    this.xlims = Array(xmin,xmax);
}
function calculateYlims(){
    //var ymin = Math.min.apply(Math,this.yvals);
    var ymin = 0;
    var ymax = Math.max.apply(Math,this.yvals);    
    this.ylims = new Array(0,ymax);
}

var x = new Array(1,2,3,4,5,6,7);
var y = new Array(34,545,7674,47563,65654);

var o = new Data();
o.setValuesX(x);
o.setValuesY(y);

//console.log(o.yvals);
