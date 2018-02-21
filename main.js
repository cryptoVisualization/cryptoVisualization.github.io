window.onload = function () { 
    
    // PAINTING THE GRAPH = g

    var margin = {top: 20, right: 20, bottom: 30, left: 50};
    
    
    var svg = d3.select("svg");
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;


    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");



    //  Create time parsers
    var parseTime = d3.timeParse("%d/%m/%Y");
    var parseTime2 = d3.timeParse("%Y-%m-%d");


    // Set scales, 
    // x is a scale for time
    var x = d3.scaleTime()
        .range([0, width]);

    // y is a scale mapping value to height
    var y = d3.scaleLinear()
        .range([height, 0]);

    // the line maps x from date and y from closing value
    var line = d3.line()
        .x(function(d) { return x(d.Date); })
        .y(function(d) {
          return y(d.Close); });


d3.csv("bitcoin.csv", function(error1, data1) {                   //  Load bitcoin values from csv
   d3.csv("BitcoinHacksInDollars.csv", function(error2, data2) {  //  Load hack values from csv
    
    //  Filter bitcoin values
    dataset = data1.map(function(d) { return { Date: parseTime(d.Date), Close: +d["Close"] } });  
    // Filter hacks values
    dataset2 = data2.map(function(d) {             
      return {
        Date: parseTime2(d.Date),
        Loss: +d["Loss in $"],
        Website: d["Source"],
        TypeOfFraud: d["Fraud/Hack"],
        Platform: d["Platform/Service"],
        lossInBTC: d["Loss in BTC"]
      }
    });
    
    //  Tooptip stuff
    var tip = d3.select('body')
      .append('div')
      .attr('class', 'tip')
      .html('I am a tooltip...')
      .style('border', '1px solid steelblue')
      .style("border-radius","10px")
      .style('padding', '5px')
      .style('background-color', '5px')
      .style('position', 'absolute')
      .style('display', 'none')
      .on('mouseover', function(d, i) {
        tip.transition().duration(0);
      })
      .on('mouseout', function(d, i) {
        tip.style('display', 'none');
      });



    // Scale the range of the data
    x.domain(d3.extent(dataset, function(d) { return d.Date; }));
    console.log(x.domain());
    y.domain(d3.extent(dataset, function(d) { return d.Close; }));

    // filter out hacks that are outside of our timeline
    var startDate = x.domain()[0].getTime();
    var endDate = x.domain()[1].getTime();
    dataset2 = dataset2.filter(o => o.Date.getTime() <= endDate && o.Date.getTime() > startDate);

    for(var i = 0; i < dataset2.length; i++){
      d = dataset2[i];
      d.Close = dataset.filter(o => o.Date.getTime() == d.Date.getTime()).map(o => o.Close)[0];
    }

    //  Axis
    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    g.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Price ($)");

    //  Path
    g.append("path")
      .datum(dataset) //  Use dataset that holds bitcoin closing values for line chart
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", function(d) {
        return line(d); });

    // Add the scatterplot
   svg.selectAll("dot")
      .data(dataset2)                     //  Use dataset2 that holds all the hacks for scatterplot
      .enter().append("circle")
      .attr("cx", function(d) { return x(d.Date); })    //  use date coordiantes for x axis
      .attr("cy", function(d) { return y(d.Close); })
      .style("fill", function(d) {        //  Diffrent colors for diffrent hacks
        if (d.TypeOfFraud == "Hack") {
          return "Green";
        } else if (d.TypeOfFraud == "Scam") {
          return "Purple";
        } else {
          return "Red"
        }
      })
      .attr("r", function(d) {          //  Diffrent size of circles for diffrent amount of loss
        if (d.Loss > 250000 && d.Loss < 1000000) {
          return 10;
        } else if (d.Loss > 10000000 && d.Loss < 50000000) {
          return 15;
        } else if (d.Loss > 50000000) {
          return 20;
        } else {
          return 5;
        }
      })
      .on("click", function(d) {      //  On click go to the website that describes hack
        window.open(d["Website"]); 
      })
      .on('mouseover', function(d, i) {   //  Mouseover
        tip.transition().duration(0);
          //  Get coordinates of mouse for tooltip positioning
        var coordinates = [0, 0];
        coordinates = d3.mouse(this); 
        var x = coordinates[0];
        var y = coordinates[1];
        //  Position tooltip
        tip.style("left", x + 25 + "px")
        tip.style("top", y - 140 + "px")
        tip.style('display', 'block');
        //  ES6 TEMPLATE string, this is the values given to tooltip
        var html = `               
        <h4>Click on circle to go to news article </h4>
          <ul>    
            <li>Platform of hack: ${d.Platform} </li>
            <li>Date of hack: ${d.Date} </li>
            <li>Loss in dollars: ${d.Loss} </li>
            <li>Loss in BTC: ${d.lossInBTC} </li>
            <li>Type of hack: ${d.TypeOfFraud} </li>
            <li>Closing price of this day: ${d.Close} </li>
          </ul>

        `;
        tip.html(html);     //  Give our template string to the tooltip for output
      })
      .on('mouseout', function(d, i) {  //  Mouseout
        tip.transition()
        .delay(800)
        .style('display', 'none');
      });



   });
 });

 }