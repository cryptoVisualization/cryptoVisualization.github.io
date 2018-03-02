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


var bitcoinLogo = document.querySelector("#bitcoin-logo");
var ethLogo = document.querySelector("#eth-logo");
var rippleLogo = document.querySelector("#ripple-logo");
var nemLogo = document.querySelector("#nem-logo");
var vericoinLogo = document.querySelector("#vericoin-logo");
var  hackDivs = $(".hack--item");
// var mtGoxHack= document.querySelector(".MtGox");

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
  .defer(d3.csv, "bitcoinAttacksWithHeadlines3.csv")
  .await(function(error, bitcoinData, ethereumData, iotaData, nemData, rippleData, tetherData, vrcData, bitcoinAttackDataWithHeadlines) {
      if (error) {
        console.error('Oh mein Gott! Something went terribly wrong: ' + error);

      } else {
        renderCharts([bitcoinData, ethereumData, iotaData, nemData, rippleData, tetherData, vrcData], [bitcoinAttackDataWithHeadlines]);
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


  // ToDo Functions didn't append the paths correctly, find out the scoping problem

    //  Add paths for all coins
    addBitcoinPath(bitcoinData);         
    addEthereumPath(ethereumData);
    addIotaPath(iotaData);
    addNemPath(nemData);
    addRipplePath(rippleData);
    addTetherPath(tetherData);
    addVrcPath(vrcData);
    
    
    bitcoinLogo.addEventListener("click", function() {
      bitcoinLogo.classList.toggle("crypto-logo-clicked");   
      //  Get opacity of bitcoin
      var opacity =  d3.select("#bitcoinData").style("opacity");
      //  Change line opacity to hide when button is clicked etc
      if (opacity > 0) {
         d3.select("#bitcoinData").style("opacity", 0);
      } else {
         d3.select("#bitcoinData").style("opacity", 1);
 
      }
    });

     
    ethLogo.addEventListener("click", function() {
      ethLogo.classList.toggle("crypto-logo-clicked");   
      //  Get opacity of bitcoin
      var opacity =  d3.select("#ethData").style("opacity");
      //  Change line opacity to hide when button is clicked etc
      if (opacity > 0) {
         d3.select("#ethData").style("opacity", 0);
      } else {
         d3.select("#ethData").style("opacity", 1);
 
      }
    });



         
    rippleLogo.addEventListener("click", function() {
      rippleLogo.classList.toggle("crypto-logo-clicked");   
      //  Get opacity of bitcoin
      var opacity =  d3.select("#rippleData").style("opacity");
      //  Change line opacity to hide when button is clicked etc
      if (opacity > 0) {
         d3.select("#rippleData").style("opacity", 0);
      } else {
         d3.select("#rippleData").style("opacity", 1);
 
      }
    });

         
    nemLogo.addEventListener("click", function() {
      nemLogo.classList.toggle("crypto-logo-clicked");   
      //  Get opacity of bitcoin
      var opacity =  d3.select("#nemData").style("opacity");
      //  Change line opacity to hide when button is clicked etc
      if (opacity > 0) {
         d3.select("#nemData").style("opacity", 0);
      } else {
         d3.select("#nemData").style("opacity", 1);
 
      }
    });



         
    vericoinLogo.addEventListener("click", function() {
      vericoinLogo.classList.toggle("crypto-logo-clicked");   
      //  Get opacity of bitcoin
      var opacity =  d3.select("#veriData").style("opacity");
      //  Change line opacity to hide when button is clicked etc
      if (opacity > 0) {
         d3.select("#veriData").style("opacity", 0);
      } else {
         d3.select("#veriData").style("opacity", 1);
 
      }
    });






    hackDivs.mouseover(function() {
      var clickedDiv = "#" + $(this).closest('div').attr('id');
      console.log(clickedDiv);
      d3.select(clickedDiv)
        .attr("class", "dot--selected");
    });
    hackDivs.mouseout(function() {
      var clickedDiv = "#" + $(this).closest('div').attr('id');
      if ( $(this).hasClass("hack")) {
        d3.select(clickedDiv)
        .attr("class", "dot dot--green");
      } else if ( $(this).hasClass("scam")) {
        d3.select(clickedDiv)
        .attr("class", "dot dot--purple");
      } else {
        d3.select(clickedDiv)
        .attr("class", "dot dot--red");
      }
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


  svg.append("rect")
    .attr("class", "zoom")
    .attr("width", width)
    .attr("height", height)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(zoom);

  


  console.log(attackArray[0][1]);





  svg.selectAll("dot")
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
    .attr("id", function(d) { return d.id} )
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




function addBitcoinPath(bitcoinData) {
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
  .attr("id", "bitcoinData")
  .attr("stroke-linejoin", "round")
  .attr("stroke-linecap", "round")
  .attr("stroke-width", 1.5);
}


function addEthereumPath(ethereumData) {
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
  .attr("id", "ethData")
  .attr("stroke-linejoin", "round")
  .attr("stroke-linecap", "round")
  .attr("stroke-width", 1.5);
}


function addIotaPath (iotaData) {
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
}


function addNemPath(nemData) {
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
    .attr("id", "nemData")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5);

}


function addRipplePath(rippleData) {
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
    .attr("id", "rippleData")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5);
}



function addTetherPath (tetherData) {
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
}



function addVrcPath(vrcData) {
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
    .attr("id", "veriData")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5);
}