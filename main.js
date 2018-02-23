var svg = d3.select("svg"),
    margin  = {top: 20, right: 20, bottom: 110, left: 40},
    margin2 = {top: 430, right: 20, bottom: 30, left: 40},
    width   = +svg.attr("width") - margin.left - margin.right,
    height  = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;

var parseDate = d3.timeParse("%-d/%-m/%Y");
var parseTime = d3.timeParse("%d/%m/%Y");
var parseNoFuckingDateIsTheSame = d3.timeParse("%m/%d/%Y");

var x  = d3.scaleTime().range([0, width]),
    x2 = d3.scaleTime().range([0, width]),
    y  = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

var xAxis  = d3.axisBottom(x),
    xAxis2 = d3.axisBottom(x2),
    yAxis  = d3.axisLeft(y);

var brush = d3.brushX()
              .extent([[0, 0], [width, height2]])
              .on("brush end", brushed);

var zoom = d3.zoom()
             .scaleExtent([1, Infinity])
             .translateExtent([[0, 0], [width, height]])
             .extent([[0, 0], [width, height]])
             .on("zoom", zoomed);

var line = d3.line()
             .x(function(d) { return x(d.date); })
             .y(function(d) { return y(d.close); });

var line2 = d3.line()
              .x(function(d) { return x2(d.date); })
              .y(function(d) { return y2(d.close); });

svg.append("defs").append("clipPath")
   .attr("id", "clip")
   .append("rect")
   .attr("width", width)
   .attr("height", height);

var focus = svg.append("g")
               .attr("class", "focus")
               .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
                 .attr("class", "context")
                 .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

d3.queue()
  .defer(d3.csv, "bitcoin.csv")
  .defer(d3.csv, "ethereum.csv")
  .defer(d3.csv, "iota.csv")
  .defer(d3.csv, "nem.csv")
  .defer(d3.csv, "ripple.csv")
  .defer(d3.csv, "tether.csv")
  .defer(d3.csv, "vrc.csv")
  // .defer(d3.csv, "bitcoinAttacks.csv", type)
  .await(function(error, bitcoinData, ethereumData, iotaData, nemData, rippleData, tetherData, vrcData) {
      if (error) {
        console.error('Oh mein Gott! Something went terribly wrong: ' + error);

      } else {
        renderCharts([bitcoinData, ethereumData, iotaData, nemData, rippleData, tetherData, vrcData]);
      }
  });

function renderCharts(cryptoArray, attackArray) {
  // ToDo, Normalize date format to avoid verbosity
  var bitcoinData  = cryptoArray[0].map(function(d) { return { date: parseTime(d.date), close: +d.close } });
  var ethereumData = cryptoArray[1].map(function(d) { return { date: parseDate(d.date), close: +d.close } });
  var iotaData     = cryptoArray[2].map(function(d) { return { date: parseNoFuckingDateIsTheSame(d.date), close: +d.close } });
  var nemData      = cryptoArray[3].map(function(d) { return { date: parseNoFuckingDateIsTheSame(d.date), close: +d.close } });
  var rippleData   = cryptoArray[4].map(function(d) { return { date: parseTime(d.date), close: +d.close } });
  var tetherData   = cryptoArray[5].map(function(d) { return { date: parseNoFuckingDateIsTheSame(d.date), close: +d.close } });
  var vrcData      = cryptoArray[6].map(function(d) { return { date: parseNoFuckingDateIsTheSame(d.date), close: +d.close } });

  x.domain(d3.extent(bitcoinData, function(d) { return d.date; }));
  y.domain(d3.extent(bitcoinData, function(d) { return d.close; }));
  2018-02-18
  x2.domain(x.domain());
  y2.domain(y.domain());

  // ToDo Functions didn't append the paths correctly, find out the scoping problem
  focus.append("path")
    .datum(bitcoinData)
    .attr("class", "line")
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("opacity", "0")
    .transition()
    .attr("opacity", "1")
    .duration(1000)
    .delay(1000)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5);

  focus.append("path")
    .datum(ethereumData)
    .attr("class", "line")
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "purple")
    .attr("opacity", "0")
    .transition()
    .attr("opacity", "1")
    .duration(1000)
    .delay(1000)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5);

  focus.append("path")
    .datum(iotaData)
    .attr("class", "line")
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "silver")
    .attr("opacity", "0")
    .transition()
    .attr("opacity", "1")
    .duration(1000)
    .delay(1000)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5);

  focus.append("path")
    .datum(nemData)
    .attr("class", "line")
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("opacity", "0")
    .transition()
    .attr("opacity", "1")
    .duration(1000)
    .delay(1000)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5);

  focus.append("path")
    .datum(rippleData)
    .attr("class", "line")
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("opacity", "0")
    .transition()
    .attr("opacity", "1")
    .duration(1000)
    .delay(1000)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5);

  focus.append("path")
    .datum(tetherData)
    .attr("class", "line")
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("opacity", "0")
    .transition()
    .attr("opacity", "1")
    .duration(1000)
    .delay(1000)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5);

  focus.append("path")
    .datum(vrcData)
    .attr("class", "line")
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "yellow")
    .attr("opacity", "0")
    .transition()
    .attr("opacity", "1")
    .duration(1000)
    .delay(1000)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5);

  focus.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  focus.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis);

  context.append("path")
    .datum(bitcoinData)
    .attr("class", "line")
    .attr("d", line2)
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("opacity", "0")
    .transition()
    .attr("opacity", "1")
    .duration(1000)
    .delay(1000)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5);
    
  context.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height2 + ")")
    .call(xAxis2);

  context.append("g")
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, x.range());

  svg.append("rect")
    .attr("class", "zoom")
    .attr("width", width)
    .attr("height", height)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(zoom);
}

function brushed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
  var s = d3.event.selection || x2.range();
  x.domain(s.map(x2.invert, x2));
  focus.selectAll(".line").attr("d", line);
  focus.select(".axis--x").call(xAxis);
  svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
    .scale(width / (s[1] - s[0]))
    .translate(-s[0], 0));
}

function zoomed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;
  var t = d3.event.transform;
  x.domain(t.rescaleX(x2).domain());
  focus.selectAll(".line").attr("d", line);
  focus.select(".axis--x").call(xAxis);
  context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
}
