var svg = d3.select("svg"),
    margin  = {top: 20, right: 20, bottom: 110, left: 40},
    margin2 = {top: 430, right: 20, bottom: 30, left: 40},
    width   = +svg.attr("width") - margin.left - margin.right,
    height  = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;

var parseDate = d3.timeParse("%-d/%-m/%Y");
var parseTime = d3.timeParse("%d/%m/%Y");

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
  .defer(d3.csv, "bitcoin.csv", type)
  // .defer(d3.csv, "ethereum.csv", type)
  // .defer(d3.csv, "iota.csv", type)
  // .defer(d3.csv, "nem.csv", type)
  // .defer(d3.csv, "ripple.csv", type)
  // .defer(d3.csv, "tether.csv", type)
  // .defer(d3.csv, "vrc.csv", type)
  // .defer(d3.csv, "bitcoinAttacks.csv", type)
  .await(function(error, bitcoinData) {
      if (error) {
        console.error('Oh mein Gott! Something went terribly wrong: ' + error);

      } else {
        renderCharts([bitcoinData]);
      }
  });

function renderLine(target, data, color, secondary) {
  target.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("opacity", "0")
    .transition()
    .attr("opacity", "1")
    .duration(1000)
    .delay(1000)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5);
}

function renderLine2(target, data, color) {
  renderLine(target, data, color, true);
}

function renderCharts(cryptoArray, attackArray) {
  x.domain(d3.extent(cryptoArray[0], function(d) { return d.date; }));
  y.domain(d3.extent(cryptoArray[0], function(d) { return d.close; }));

  x2.domain(x.domain());
  y2.domain(y.domain());

  cryptoArray.map(function(cryto) { 
    var dataset = cryto.map(function(d) { return { date: parseTime(d.date), close: +d.close } });  
    renderLine(focus, dataset, "blue"); 
  });

  focus.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  focus.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis);

  cryptoArray.map(function(crypto) { renderLine(context, crypto, "red", true); });

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
  focus.select(".line").attr("d", line);
  focus.select(".axis--x").call(xAxis);
  svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
    .scale(width / (s[1] - s[0]))
    .translate(-s[0], 0));
}

function zoomed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;
  var t = d3.event.transform;
  x.domain(t.rescaleX(x2).domain());
  focus.select(".line").attr("d", line);
  focus.select(".axis--x").call(xAxis);
  context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
}

function type(d) {
  d.date = parseDate(d.date);
  d.close = +d.close;
  return d;
}