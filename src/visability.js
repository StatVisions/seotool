/********************************************************
*                                                       *
*   create charts and objects, make them global for     *
*   other page controls	 								*
*                                                       *
********************************************************/
	var webChart = dc.rowChart("figure#chart1"),
	pointsChart = dc.barChart("figure#chart3"),
	kwChart = dc.rowChart("figure#chart4"),
	engineChart = dc.rowChart("figure#chart5"),
	visChart = dc.seriesChart("figure#chart6"),
	countWidget = dc.dataCount("figure.dc-data-count");

function render(csv) {  

	var xf = crossfilter();

/********************************************************
*   add data to xf, define dimensions, groups, msc      *
********************************************************/
	xf.add(csv);
	var website = xf.dimension(function(d){return d.Website}),
		websitegroup = website.group().reduceSum(function(d){return d.Points}),
		formatmdy = d3.time.format("%m-%d-%Y"),
		points = xf.dimension(function(d){return d.Points;}),
		pointsgroup = points.group(),
		kwgrp = xf.dimension(function(d){return d.KeywordGroup;}),
		kwgrpgroup = kwgrp.group().reduceSum(function(d){return d.Points}),
		searchengine = xf.dimension(function(d){return d.SearchEngine;}),
		searchenginegroup = searchengine.group().reduceSum(function(d){return d.Points}),
		visability = xf.dimension(function(d) { return [d.Website, d.Date];}),
		visabilitygroup = visability.group().reduce(reduceAddAvg('Points',30), reduceRemoveAvg('Points',30), reduceInitAvg),
		extent = d3.extent(csv,function(d){return d.Date;});
	function reduceAddAvg(attr,points) {
		return function(p,v) {
				++p.count
				p.sum += v[attr];
				p.avg = p.sum/(p.count*points);
				return p;
			};
	}
	function reduceRemoveAvg(attr,points) {
		return function(p,v) {
				--p.count
				p.sum -= v[attr];
				p.avg = p.sum/(p.count*points);
				return p;
			};
	}
	function reduceInitAvg() {
		return {count:0, sum:0, avg:0};
	}

	webChart
		.width(300)
		.height(500)
		.dimension(website)
		.group(websitegroup)
		.renderTitle(true)
		.colors(d3.scale.category10())
		.xAxis()
		.ticks(4);

	pointsChart
		.width(400)
		.height(150)
		.dimension(points)
		.group(pointsgroup)
		.elasticY(true)
		.centerBar(true)
		.gap(3)
		.x(d3.scale.linear().domain([1,31]))
		.yAxis().ticks(3);

	pointsChart.margins().left = -0.5;

	kwChart
		.width(400)
		.height(150)
		.dimension(kwgrp)
		.group(kwgrpgroup)
		.renderTitle(true)
		.colors(d3.scale.category10())
		.xAxis()
		.ticks(4);

	engineChart
		.width(400)
		.height(150)
		.dimension(searchengine)
		.group(searchenginegroup)
		.renderTitle(true)
		.colors(d3.scale.category10())
		.xAxis()
		.ticks(4);

	visChart
		.chart(function(c){return dc.lineChart(c).interpolate('cardinal')})
		.width(800)
		.height(500)
		.margins({top:50,right:50, bottom:50,left: 50})
		.x(d3.time.scale().domain(extent))
		.dimension(visability)
		.group(visabilitygroup)
		.elasticY(true)
		.seriesAccessor(function(d){return d.key[0];})
		.keyAccessor(function(d){return d.key[1];})
		.valueAccessor(function(d){return d.value.avg;})
		.colors(d3.scale.category10())
		// .legend(dc.legend().x(-5).y(10).itemHeight(13).gap(5))
		.brushOn(false);

	visChart.yAxis().tickFormat(function(v){return 100*v + "%";});
	
	var FieldNames = [
			"Website",
			"Search Engine",
			"Keyword Group",
			"Position",
			"Points",
			"Date"
			];

	d3.select("tr#FieldNames").selectAll("th")
		 .data(FieldNames)
		.enter()
		.append("th") 
		.append("text")
		 .text(function(d){ return d;});

	var list = dc.dataTable("#list")
		.dimension(kwgrp)
		.group(function(d) {return d.KeywordGroup;})
		.columns([
		function(d) {return d.Website;},
		function(d) {return d.SearchEngine;},
		function(d) {return d.KeywordGroup},
		function(d) {return d.Position;},
		function(d) {return d.Points},
		function(d) {return formatmdy(d.Date);}
		]);

	 countWidget
		.dimension(xf)
		.group(xf.groupAll());

	dc.renderAll();	

}; 

var file, instance;

/********************************************************
*   "define" a function which parses the data  			*
********************************************************/
function parse(d) {	
		var format = d3.time.format("%Y-%m-%d");
		d.Date = format.parse(d.Date);
		d.Position = +d.Position;
		// d.Position = getInt(d.Position,d.Competition,30);
		if(d.Position >= 30 || d.Position <= 0) 
			{d.Points = 0; 
			} else { 
			d.Points = 31 - d.Position};
};
	

/********************************************************
*   coersion, csv columns are not always accruate				*
********************************************************/
// function getInt(d,e,f) {
// 	// d default col [string], e alternate col for d [string]
// 	// f alternate value if e is NaN [string/integer]
// 	function nonInt(d) {return !parseInt(d);};
// 	function dash(d) { if(d=="-") d = f; return d;};
// 	d = dash(d);
// 	if(nonInt(d)) d = dash(e);
// 	if(nonInt(d)) d = f;
// 	return parseInt(d);
// };

function scrub(data) {
	data.forEach(parse);
	data.sort(function(a,b){a.Date < b.Date ? -1 : a.Date > b.Date ? 1 : 0});
}

function dashboard(data) {
	scrub(data);
	render(data);

}