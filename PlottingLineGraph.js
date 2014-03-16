// Based on tutorial: http://www.worldwidewhat.net/2011/06/draw-a-line-graph-using-html5-canvas/

function PlotArea(xPad,yPad){
    this.graph;
    this.area; // plot area
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
    this.plot = plot;
}
function setGraph(id){
    //var element = document.getElementById(id);
    this.graph = $(id);
    this.area = this.graph[0].getContext("2d");
}
function getPositionX(val,xlims){
    xPerPlotArea = (this.graph.width()-this.xPad)/(xlims[1]-xlims[0]);
    return (val-xlims[0]) * xPerPlotArea + this.xPad;
}
function getPositionY(val,ylims){
    yPerPlotArea = (this.graph.height() - this.yPad)/(ylims[1]-ylims[0]);
    return this.graph.height - ((val-ylims[0]) * yPerPlotArea + this.yPad);
}
function drawAxes(){
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
    this.area.font = "italic 8pt sans-serif";
    this.area.textAlign = "center";

    for (i=0; i<labels.length; i++){
	x =this.getPositionX(labels[i],xlims);
	y = this.graph.height() - this.yPad + 15;
	this.area.fillText(labels[i],x,y);
    }
}
function labelAxisY(ylims){
    
}
function plot(xvals,yvals,xlims,ylims){
    this.area.beginPath();
    this.area.moveTo(this.getPositionX(xvals[0],xlims),this.getPositionY(yvals[0],ylims));
    for (i=1; i<xvals.length; i++){
	this.area.lineTo(this.getPositionX(xvals[i],xlims), this.getPositionY(yvals[i],ylims));
    }
    this.area.stroke();
}

var xlims = new Array(1000,8000);

$(document).ready(function() {
    var plot = new PlotArea(30,30);
    plot.setGraph("#graph");
    plot.drawAxes();
    plot.labelAxisX(xlims);
})
