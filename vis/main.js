// build canvas
var width = 700,
	height = 580;

var svg = d3.select('#chart')
			.append('svg')
			.attr('width', width)
			.attr('height', height);

// setup projection
var projection = d3.geoMercator()//d3.geoAlbers()
				.scale(60000)
				.center([-74.0060, 40.7128])
				.translate([width/2, height/2]);

var geoPath = d3.geoPath()
			  .projection(projection);

// create layers
var layers = {
	base: svg.append('g'),
	buildings: svg.append('g'),
}

// create table
var table = d3.select('#table').attr('class', 'table table-striped');
var table_head = table.append('thead').append('tr');
var rows = table.append('tbody');

// setup threshold slider and number box
var threshold = d3.select('#threshold').on('input', function() {
	// sync slider and number
	var thresh = +this.value;
	threshold_num.property('value', thresh)

	// filter points
	layers.buildings
	.selectAll('circle')
	.attr('visibility', 'hidden')
	.filter(d => d.EUI_2016 > thresh + 100)
	.attr('visibility', 'visible');

	// filter table
	rows.selectAll('tr')
	.classed('d-none', true)
	.filter(d => d.EUI_2016 > thresh + 100)
	.classed('d-none', false);

});
var threshold_num = d3.select('#threshold-number').on('input', function() {
	// sync slider and number and apply filtering via slider
	threshold.property('value', +this.value);
	threshold.dispatch('input');
});



// load state base
d3.json('Borough Boundaries.geojson', function(e, data){
	console.log(data);

	layers.base.selectAll('path')
	.data(data.features).enter()
	.append('path')
	.attr('fill', '#333')
	.attr('d', geoPath);
})

// load building data
d3.csv('merged-w-latlon.csv', function(data) {
	console.log(data);

	var columns = d3.keys(data[0]);

	// set header
	table_head
	.selectAll('th')
	.data(columns).enter()
	.append('th')
	.text( d => d );

	// set points
	layers.buildings
	.selectAll('circle')
	.data(data).enter()
	.append('circle')
	.attr('cx', d => projection([d.Longitude, d.Latitude])[0] )
	.attr('cy', d => projection([d.Longitude, d.Latitude])[1] )
	.attr('r', '2')
	.attr('fill', '#f00')
	.style('opacity', 0.5);

	// set rows and cells
	rows.selectAll('tr')
	.data(data.slice(0, 100).sort((a, b) => b.EUI_2016 - a.EUI_2016)).enter()//
	.append('tr')
	.classed('d-none', true)
	.selectAll('td')
	.data( d => columns.map(k => ({ value: d[k], name: k})) )
	.enter().append('td')
	.attr('data-th', d => d.name )
	.text( d => d.value );

	// initialize filter
	threshold.dispatch('input');
});


function table2csv($el){
	// get rows
	return $el.find('tr').map(function(){ 
		return $(this).find('th, td').map(function(){ 
			// get cell, escape quotes, commas, and new lines
			var result = $(this).text().replace(/"/g, '""'); 
			if (result.search(/("|,|\n)/g) >= 0)
            	result = '"' + result + '"';
            return result;
		}).get().join(','); 
	}).get().join('\n');
}

