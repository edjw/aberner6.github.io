d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
		this.parentNode.appendChild(this);
	});
};

var data = []
, realWidth = 0
, width = null
, originalWidth = null
, height = 0
, π = Math.PI
, radians = π / 180
, degrees = 180 / π
, pusher = null
, channel = null
, eventWindow = 1 * 60 * 1000;
// , eventWindow = 1 * 6 * 1000;

var colors = d3.scale.category20();
var strategies = {};
var lastColorIndex = 0;

var circle = d3.geo.circle().angle(90);

var svgEl = d3.select(".map svg");
var svg = svgEl.append('g');

function resizeGraph(){
   	realWidth = document.body.clientWidth;
   	width = realWidth;
	height = width;

	svgEl.attr("width", width).attr("height", height)
	  .attr("viewBox", "0 0 " + width + " " + height )
	  .attr("preserveAspectRatio", "xMinYMin")
	  .attr("pointer-events", "all")
}
resizeGraph();
    var initialZoom = (148 * height / 847);
    var maxZoom = 800;

var projection = d3.geo.mercator()
    .scale(initialZoom)
    .translate([width / 1.92, height / 2.22]);

    // var zoom = d3.behavior.zoom(true)
    //             .scale( projection.scale() )
    //             .scaleExtent([(175 * height / 847), 800])
    //             .on("zoom", globeZoom);
    // svgEl.call(zoom)
    //           .on('dblclick.zoom', null);
// d3.select(".imageMap")
//     .scale(initialZoom)
//     .translate([width / 2, height / 2.8]);
 // var lands = svg.selectAll("img")
 //                // suns.enter()
 //            	.append("svg:image")
 //                .attr("xlink:href", "dottedworldmap.png")
 //            	.attr("class","land")
	// 			.attr("x", 0)
	// 	        .attr("y",0)
    // .scale(initialZoom)
    // .translate([width / 2, height / 2.8]);



// 2531 × 1236
var imgHeight = 1025, imgWidth = 1538,      // Image dimensions (don't change these)
    // widthIs =  960, heightIs = 650,             // Dimensions of cropped region
     // .scale(initialZoom)
    // .translate([width / 2, height / 2.8]);
    // translate0 = [width / 2, height / 2.8], scale0 = initialZoom;  // Initial offset & scale
    translate0 = [0, -200], scale0 = 1;  // Initial offset & scale

svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width + "px")
    .attr("height", height + "px");

svg = svg.append("g")
    .attr("transform", "translate(" + translate0 + ")scale(" + scale0 + ")")
    
    .call(d3.behavior.zoom().scaleExtent([1,8]).on("zoom", zoomIt))
    // .call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom))
  .append("g");

svg.append("image")
    .attr("width",  imgWidth + "px")
    .attr("height", imgHeight + "px")
    .attr("opacity",.3)
    .attr("xlink:href", "dottedworldmap.png");

function zoomIt() {
  svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  console.log("translate: " + d3.event.translate + ", scale: " + d3.event.scale);
}











    var zoom = d3.behavior.zoom(true)
                .scale( projection.scale() )
                .translate(projection.translate())
                .scaleExtent([initialZoom, maxZoom])
				.on("zoom", function(){
					var t = d3.event.translate;
					var s = d3.event.scale;
					zoomInOut(t, s);
				})
    svgEl.call(zoom)
    //           .on('dblclick.zoom', null);

/*
var projection = d3.geo.equirectangular()
    .translate([width / 2, height / 2])
    .scale(135 * height / 847)
    .precision(.1);
*/
var path = d3.geo.path().projection(projection);


var lat_tz = d3.range(-180,180,15).map(function (lat){
	var tz = Math.floor(lat / 15)+1;
	var from = projection([lat,0]);
	var to = projection([lat+15,0]);
	return {
		tz: tz,
		latitude: lat,
		width: to[0] - from[0],
		x: from[0]
	};
});


var countries;
d3.json("world.json", function(error, world) {
	// countries = svg.append("path")
	// 	.classed('world', true)
	// 	.datum( topojson.feature(world, world.objects.land) )
	// 	.attr("d", path)
	// 	.attr("stroke","rgb(125,95,95)")//"#eb5424")//"rgb(154,54,54)")
	// 	.attr("stroke-width",1)
	// 	.attr("fill","black")

	redraw();
	setInterval(redraw, 5 * 60 * 1000);

	function redraw() {
		setTimeZone();
	}

	// Pusher.log = function(message) {
	// 	console.log(message);
	// };

// var p;
	pusher = new Pusher('54da1f9bddbf14929983');
	channel = pusher.subscribe('world_map');
	channel.bind('login', function(point) {
		// console.log(point);
		// p = point;
		loadPoint(point);
	});
})






	// d3.json("data.json", function(error, points) {
	// 	points.forEach(function(p){
	// 		loadPoint(p);
	// 	});
	// });

// });

//NEED TO FIGURE OUT TRANSITION HERE
// I THINK IN FACT I NEED TO REDO AS A PATH FOR EACH POINT ETC
function globeZoom(){
  if (d3.event) {
    	var _scale = d3.event.scale;
    	projection.scale(_scale);
		countries.attr('d', path);
		// loadPoint(p);
		// p.projection = projection([p.geo.lng, p.geo.lat]);
        // circleWatches.attr('d', path2);

		d3.selectAll(".outerCircs").transition().duration(1)
        .attr("cx", function(d) { return projection(d.projection)[0]; })
        .attr("cy", function(d) { return projection(d.projection)[1]; })
		d3.selectAll(".innerCircs").transition().duration(1)
        .attr("cx", function(d) { return projection(d.projection)[0]; })
        .attr("cy", function(d) { return projection(d.projection)[1]; })
		// innerCircs.attr("cx", function(d) { return p.projection[0]; })
        // outerCircs.attr("cy", function(d) { return p.projection[1]; })
	}
}

var showReset = false;
var zoomInOut = function(t, s) {
	if (showReset==true){
		$('#reset').slideDown( "slow", function() {
	})
	}
	if (showReset==false){
		$('#reset').slideUp( "slow", function() {
	})	
	}
  // if (d3.event) {
  	if (s>initialZoom+10){
		showReset = true;

    	var _scale = d3.event.scale;
		var _trans = d3.event.translate;
    	
    	projection.scale(_scale);
    	projection.translate(_trans);
		// console.log(_trans);
		// Reproject everything in the map
		// countries.transition().duration(1).attr('d', path);

		d3.selectAll(".outerCircs").transition().duration(1)
        .attr("cx", function(d) { return projection(d.projection)[0]; })
        .attr("cy", function(d) { return projection(d.projection)[1]; })
		d3.selectAll(".innerCircs").transition().duration(1)
        .attr("cx", function(d) { return projection(d.projection)[0]; })
        .attr("cy", function(d) { return projection(d.projection)[1]; })
	}
	else{
		showReset = false;
	}
};

d3.select("#reset").on("click", resetZoom);

function resetZoom(){
  svg.attr("transform", "translate(" + [-1.3705342146357111,-16.35040502017796] + ")scale(" + 1+ ")");

	// translate: -1.3705342146357111,-16.35040502017796, scale: 1
	// svg.transition().attr("transform", "translate(" + translate0 + ")scale(" + scale0 + ")")

	showReset = false;
	// zoom.translate([width / 2, height / 2]).scale(initialZoom);
	projection.translate([width / 2, height / 2.8]).scale(initialZoom);

	// Reproject everything in the map
	// countries.transition().duration(1)
	// 	 .attr("d", path);

	d3.selectAll(".outerCircs").transition().duration(1)
        .attr("cx", function(d) { return projection(d.projection)[0]; })
        .attr("cy", function(d) { return projection(d.projection)[1]; })
	d3.selectAll(".innerCircs").transition().duration(1)
        .attr("cx", function(d) { return projection(d.projection)[0]; })
        .attr("cy", function(d) { return projection(d.projection)[1]; })
	$('#reset').slideUp( "slow", function() {
	})			
}


d3.select(self.frameElement).style("height", height + "px");

// window.onresize = resizeGraph;

setInterval(function(){
	var limit = Date.now() - eventWindow;

	data = _.filter(data, function(d){
		return d.created_at > limit;
	})
}, 1000)
