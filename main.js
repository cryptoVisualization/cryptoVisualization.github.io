var brush = d3.brush();

var svg = d3.select("svg"),
    margin  = {top: 20, right: 20, bottom: 110, left: 40},
    margin2 = {top: 430, right: 20, bottom: 30, left: 40},
    margin3 = {top: 730, right: 20, bottom: 30, left: 40},
    width   = +svg.attr("width") - margin.left - margin.right,
    height  = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;
    height3 = +svg.attr("height") - margin3.top - margin2.bottom;

var parseDate = d3.timeParse("%-d/%-m/%Y");
var parseTime = d3.timeParse("%d/%m/%Y");
var parseNoFuckingDateIsTheSame = d3.timeParse("%Y-%m-%d");

var x  = d3.scaleTime().range([0, width]),
    x2 = d3.scaleTime().range([0, width]),
    x3 = d3.scaleBand().rangeRound([0, width]).paddingInner(0.05).align(0.1);
    y  = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);
    y3 = d3.scaleLinear().rangeRound([height3, 0]);

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

svg.append("rect")
   .attr("class", "zoom")
   .attr("width", width)
   .attr("height", height)
   .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
   .call(zoom);

var focus = svg.append("g")
               .attr("class", "focus")
               .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var dots = svg.append("g")
              .attr("class", "dots")
              .attr("clip-path", "url(#clip)")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
                 .attr("class", "context")
                 .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

var bars = svg.append("g")
                 .attr("class", "bars")
                 .attr("transform", "translate(" + margin3.left + "," + margin3.top + ")");
d3.queue()
  .defer(d3.csv, "bitcoin.csv")
  .defer(d3.csv, "ethereum.csv")
  .defer(d3.csv, "iota.csv")
  .defer(d3.csv, "nem.csv")
  .defer(d3.csv, "ripple.csv")
  .defer(d3.csv, "tether.csv")
  .defer(d3.csv, "vrc.csv")
  .defer(d3.csv, "bitcoinAttacks.csv")
  .await(function(error, bitcoinData, ethereumData, iotaData, nemData, rippleData, tetherData, vrcData, bitcoinAttackData) {
      if (error) {
        console.error('Oh mein Gott! Something went terribly wrong: ' + error);

      } else {
        renderCharts([bitcoinData, ethereumData, iotaData, nemData, rippleData, tetherData, vrcData], [bitcoinAttackData]);
      }
  });

function update(cryptoArray, y){
  y.domain(d3.extent(bitcoinData, function(d) { return d.close; }));
}

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
  x2.domain(x.domain());
  y2.domain(y.domain());

  var tip = d3.select('body')
    .append('div')
    .attr('class', 'tip')
    .style('border', '1px solid steelblue')
    .style('padding', '5px')
    .style('background-color', 'rgba(255,255,255,.9)')
    .style('position', 'absolute')
    .style('display', 'none')
    .on('mouseover', function(d, i) {
      tip.transition().duration(0);
    })
    .on('mouseout', function(d, i) {
      tip.style('display', 'none');
    });

  function appendCoin(data, color) {
    focus.append("path")
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

  appendCoin(bitcoinData, "green");
  appendCoin(ethereumData, "purple");
  appendCoin(iotaData, "silver");
  appendCoin(nemData, "lime");
  appendCoin(rippleData, "blue");
  appendCoin(tetherData, "white");
  appendCoin(vrcData, "yellow");

  focus.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  focus.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis);
    
  context.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height2 + ")")
    .call(xAxis2);

  context.append("g")
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, x.range());

  dots.selectAll("dot")
    .data(attackArray[0])
    .enter().append("circle")
    .attr("cx", function(d) { return x(parseNoFuckingDateIsTheSame(d.date)); })
    .attr("cy", function(d) { return y(closeVal(bitcoinData, d.date)); })
    .attr("class", function(d) {
      if (d.typeOfAttack == "Hack") {
        return "dot dot--green";
      } else if (d.typeOfAttack == "Scam") {
        return "dot dot--purple";
      } else {
        return "dot dot--red"
      }
    })
    .attr("r", function(d) {
      if (d.lossUSD > 250000 && d.lossUSD < 1000000) {
        return 8;
      } else if (d.lossUSD > 10000000 && d.lossUSD < 50000000) {
        return 12;
      } else if (d.lossUSD > 50000000) {
        return 16;
      } else {
        return 4;
      }
    })
    .on("click", function(d) {
      window.open(d["source"]); 
    })
    .on('mouseover', function(d, i) {
      tip.transition().duration(0);
        //  Get coordinates of mouse for tooltip positioning
      var coordinates = [0, 0];
      coordinates = d3.mouse(this); 
      var x = coordinates[0];
      var y = coordinates[1];
      //  Position tooltip
      tip.style("left", x + 145 + "px")
      tip.style("top", y - 5 + "px")
      tip.style('display', 'block');
      //  ES6 TEMPLATE string, this is the values given to tooltip
      var html = `               
      <h4>Click on circle to go to news article </h4>
        <ul>    
          <li>Platform of hack: ${d.platform} </li>
          <li>Date of hack: ${d.date} </li>
          <li>Loss in dollars: ${d.lossUSD} </li>
          <li>Loss in BTC: ${d.lossCrypti} </li>
          <li>Type of hack: ${d.typeOfAttack} </li>
          <li>Closing price of this day: ${d.close} </li>
        </ul>

      `;
      tip.html(html);     //  Give our template string to the tooltip for output
    })
    .on('mouseout', function(d, i) {  //  Mouseout
      tip.transition()
      .delay(800)
      .style('display', 'none');
    });
}

function brushed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
  var s = d3.event.selection || x2.range();
  x.domain(s.map(x2.invert, x2));
  focus.selectAll(".line").attr("d", line);
  focus.select(".axis--x").call(xAxis);
  dots.selectAll(".dot").attr("cx",function(d){
    return x(parseNoFuckingDateIsTheSame(d.date));
  })
  .attr("cy",function(d){
    return d3.select(this).attr("cy");
  });
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
  dots.selectAll(".dot").attr("cx", function(d) {
    return x(parseNoFuckingDateIsTheSame(d.date));
  })
  .attr("cy", function(d) {
    return d3.select(this).attr("cy");
  });
  context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
}

function closeVal(bitcoinData, date) {
  var found = bitcoinData.filter(function(datapoint) {
    var newDate = parseNoFuckingDateIsTheSame(date);
    return datapoint.date.getTime() === newDate.getTime();
  });

  if (found.length) {
    return found[0].close
  } 

  return 0;
} 