//================================================================
// PlotArea() class

function PlotArea(xPad,yPad){
    this.graph; // canvas
    this.area; // plot area (ctx)
    this.xPad = xPad;
    this.yPad = yPad;
    this.plotAreaWidth;
    this.plotAreaHeight;

    // Methods
    this.setGraph = setGraph;
    this.getPositionX = getPositionX;
    this.getPositionY = getPositionY;
    this.drawAxes = drawAxes;
    this.labelAxisX = labelAxisX;
    this.labelAxisY = labelAxisY;
    this.plot = plot;
    this.axvline = axvline;
    this.refreshGraph = refreshGraph;
}
function setGraph(id){
    this.graph = $(id);
    this.area = this.graph[0].getContext("2d");
}
function getPositionX(val,xlims){
    xPerPlotArea = (this.graph.width()-this.xPad)/(xlims[1]-xlims[0]);
    return (val-xlims[0]) * xPerPlotArea + this.xPad;
}
function getPositionY(val,ylims){
    yPerPlotArea = (this.graph.height() - this.yPad)/(ylims[1]-ylims[0]);
    return this.graph.height() - ((val-ylims[0]) * yPerPlotArea + this.yPad);
}
function drawAxes(){
    this.area.strokeStyle = "Black";
    this.area.lineWidth = 2;

    this.area.beginPath();
    this.area.moveTo(this.xPad, 0); // 0 is top of graph
    this.area.lineTo(this.xPad, this.graph.height() - this.yPad);
    this.area.lineTo(this.graph.width(),this.graph.height()-this.yPad);
    this.area.stroke();
}
function labelAxisX(xlims){
    var labels = new Array();
    var step;
    // if the limits are 1000-8000 or above
    if ((xlims[1]-xlims[0]) >= 7000){
	step = 1000;
    }
    // spacing between highest and lowest number is over 4000 m/z
    else if ((xlims[1]-xlims[0]) >= 4000){
	step = 500;
    }
    else {
	step = 250;
    }
    for (i=0; i<=xlims[1]; i += step){
	if (i >= xlims[0]){
	    labels.push(i);
	}
    }
    // Actually do the labelling
    this.area.strokeStyle = "#333";
    this.area.font = "8pt sans-serif";
    this.area.textAlign = "center";

    for (i=0; i<labels.length; i++){
	x =this.getPositionX(labels[i],xlims);
	y = this.graph.height() - this.yPad + 15;
	this.area.fillText(labels[i],x,y);
    }
}
function labelAxisY(data){
    var labels = new Array("0","50","100");
    this.area.strokeStyle = "#333";
    this.area.font = "italics 8pt sans-serif";
    this.area.textAlign = "right"
    this.area.textBaseline = "middle";
    
    for (i=0; i<labels.length; i++){
	var label = parseInt(labels[i]);
	this.area.fillText(labels[i], this.xPad-5, this.getPositionY(label,data.ylims));
    }
}
function plot(data){
    this.area.strokeStyle = "Black";
    this.area.lineWidth = 1;
    this.area.beginPath();
    this.area.moveTo(this.getPositionX(data.xvals[0],data.xlims),
		     this.getPositionY(data.yvals[0],data.ylims));
    for (i=1; i<data.xvals.length; i++){
	this.area.lineTo(this.getPositionX(data.xvals[i],data.xlims),
			 this.getPositionY(data.yvals[i],data.ylims));
    }
    this.area.stroke();
}
function axvline(xval,data,label){
    this.area.strokeStyle = "Blue";
    this.area.lineWidth = 1;
    this.area.beginPath();
    var xpos = this.getPositionX(xval,data.xlims);
    var x0 = this.getPositionX(data.xlims[0],data.xlims);
    if (xpos > x0){
	this.area.moveTo(xpos,this.getPositionY(0,data.ylims));
	this.area.lineTo(xpos,this.getPositionY(data.ylims[1],data.ylims));
	this.area.stroke();
	//label
	this.area.fillText(label, xpos, this.getPositionY(90,data.ylims));
    }
}
function refreshGraph(data){
    this.area.clearRect(0,0,this.graph.width(),this.graph.height());
    this.drawAxes();
    this.labelAxisX(data.xlims);
    this.labelAxisY(data);
    this.plot(data);
}


// var x = new Array(1000,2000,3000,4000,5000,6000,7000,8000);
// var y = new Array(34,545,7674,47563,65654,34234,3432,432);

// var o = new Data();
// o.setValuesX(x);
// o.setValuesY(y);


// $(document).ready(function() {
//     var plot = new PlotArea(30,30);
//     plot.setGraph("#graph");
//     plot.drawAxes();
//     plot.labelAxisX(o.xlims);
//     plot.labelAxisY(o);
//     plot.plot(o);
//     plot.axvline(2000,o);
// })
