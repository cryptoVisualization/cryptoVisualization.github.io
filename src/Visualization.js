import React, { Component } from 'react';
import { NavLink } from "react-router-dom";
import * as d3 from 'd3';
import scrollreveal from 'scrollreveal';
import './App.css';

class Visualization extends Component {
  
  state = {
    attackArray: []
  };

  componentWillReceiveProps(props) {
    console.log(props);
  }

  componentDidMount() {
    var that = this;
    var svg = d3.select("svg"),
        margin  = {top: 20, right: 20, bottom: 410, left: 40},
        margin2 = {top: 430, right: 20, bottom: 330, left: 40},
        margin3 = {top: 520, right: 20, bottom: 30, left: 40},
        width   = +svg.attr("width") - margin.left - margin.right,
        height  = +svg.attr("height") - margin.top - margin.bottom,
        height2 = +svg.attr("height") - margin2.top - margin2.bottom,
        height3 = +svg.attr("height") - margin3.top - margin3.bottom;

    var parseDate = d3.timeParse("%Y-%m-%d");
    
    var x  = d3.scaleTime().range([0, width]),
        x2 = d3.scaleTime().range([0, width]),
        x3 = d3.scaleTime().range([0, width]),
        y  = d3.scaleLinear().range([height, 0]),
        y2 = d3.scaleLinear().range([height2, 0]),
        y3 = d3.scaleLinear().rangeRound([0, height3]),
        z3 = d3.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
    
    var xAxis  = d3.axisBottom(x),
        xAxis2 = d3.axisBottom(x2),
        xAxis3 = d3.axisTop(x3),
        yAxis  = d3.axisLeft(y).ticks(5),
        yAxis3 = d3.axisLeft(y3).ticks(5);
    
    var brush = d3.brushX()
                  .extent([[0, 0], [width, height2]])
                  .on("brush end", brushed);
    
    var zoom = d3.zoom()
                 .scaleExtent([1, Infinity])
                 .translateExtent([[0, 0], [width, height]])
                 .extent([[0, 0], [width, height]])
                 .on("zoom", zoomed);
    
    var line = d3.area()
                 .x(function(d) { return x(d.date); })
                 .y(function(d) { return y(d.close); });
    
    var line2 = d3.line()
                  .x(function(d) { return x2(d.date); })
                  .y(function(d) { return y2(d.close); });

    // gridlines in y axis function
    function make_y_gridlines() {		
      return d3.axisLeft(y).ticks(5)
    }
    
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
    
    var stacks = svg.append("g")
                     .attr("class", "stacks")
                     .attr("transform", "translate(" + margin3.left + "," + margin3.top + ")");
    
    d3.queue()
      .defer(d3.csv, "datasets/coinmarketcap.csv")
      .defer(d3.csv, "datasets/attacks.csv")
      .defer(d3.csv, "datasets/formattedStack.csv")
      .await(function(error, coinmarketcap,  bitcoinAttackData, formattedData) {
        if (error) {
          console.error('Oh mein Gott! Something went terribly wrong: ' + error);
        } else {
          renderCharts(coinmarketcap, bitcoinAttackData, formattedData);
        }
      });
    
    function renderCharts(coinmarketcap, attackArray, formattedData) {

      that.setState({attackArray})

      var selectCoinData = function(coin) {
        return coinmarketcap.filter(function(d) {return d.coin === coin})
          .map(function(d) { 
          d.date = parseDate(d.date); 
          return d;
        });
      }

      var bitcoinData   = selectCoinData("Bitcoin"),
          ethereumData  = selectCoinData("Ethereum"),
          iotaData      = selectCoinData("IOTA"),
          nemData       = selectCoinData("NEM"),
          rippleData    = selectCoinData("Ripple"),
          tetherData    = selectCoinData("Tether"),
          steemData     = selectCoinData("Steem"),
          vrcData       = selectCoinData("VeriCoin");
    
      for (var i = 0; i < formattedData.length; i++) {
        var d = formattedData[i];
        formattedData[i].total = parseInt(d['Bitcoin'], 10) + parseInt(d['Ethereum'], 10) + parseInt(d['Ripple'], 10);
      }

      var keys = formattedData.columns.slice(1);
    
      x.domain(d3.extent(coinmarketcap, function(d) { return +d.date; }));
      y.domain(d3.extent(coinmarketcap, function(d) { return +d.close; }));
      x2.domain(x.domain());
      y2.domain(y.domain());
      x3.domain(x.domain());
      y3.domain([0, d3.max(formattedData, function(d) { return +d.total; })]).nice();
      z3.domain(keys)
    
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

      focus.append("g")			
        .attr("class", "grid")
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat("")
        )

      focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    
      focus.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);

      appendCoin(bitcoinData, "green", line, line2, focus, context);
      appendCoin(ethereumData, "purple", line, line2, focus, context);
      appendCoin(iotaData, "silver", line, line2, focus, context);
      appendCoin(nemData, "lime", line, line2, focus, context);
      appendCoin(rippleData, "blue", line, line2, focus, context);
      appendCoin(tetherData, "white", line, line2, focus, context);
      appendCoin(steemData, "red", line, line2, focus, context);
      appendCoin(vrcData, "yellow", line, line2, focus, context);

      context.append("g")			
        .attr("class", "grid")
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat("")
        )

      context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);
    
      context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range());
    
      dots.selectAll("dot")
        .data(attackArray)
        .enter().append("circle")
        .attr("cx", function(d) { return x(parseDate(d.date)); })
        .attr("cy", function(d) { return y(closeVal(bitcoinData, d.date)); })
        .attr("class", addDotClass)
        .attr("r", dotSize)
        .on("click", function(d) {
          window.open(d["source"]); 
        })
        .on('mouseover', function(d, i) {
          tip.transition().duration(0);
            //  Get coordinates of mouse for tooltip positioning
          var coordinates = d3.mouse(this); 
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
    
      stacks.append("g")
        .attr("class", "axis axis--x")
        .call(xAxis3);
    
      stacks.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis3);
    
      stacks.append("g")
        .attr("clip-path", "url(#clip)")
        .selectAll("g")
        .data(d3.stack().keys(keys)(formattedData))
        .enter().append("g")
          .attr("fill", function(d) { return z3(d.key); })
        .selectAll("rect")
        .data(function(d) {return d;})
        .enter().append("rect")
          .attr("class", "stack")
          .attr("x", function(d) { return x3(parseDate(d.data.date)); })
          .attr("y", 0)
          .attr("width", 25)
          .attr("height", function(d) { return y3(parseInt(d[1], 10)) - y3(parseInt(d[0], 10)); });
    }
    
    function appendCoin(data, color, line, line2, target, brushTarget) {
      target.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line)
            .attr("fill", 'red')
            .attr("stroke", color)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5);
    
      brushTarget.append("path")
            .datum(data)
            .attr("d", line2)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 2);
    }
    
    function addDotClass(d) {
      if (d.typeOfAttack === "Hack") {
        return "dot dot--green";
      } else if (d.typeOfAttack === "Scam") {
        return "dot dot--purple";
      } else {
        return "dot dot--red"
      }
    }
    
    function dotSize(d) {
      if (d.lossUSD > 250000 && d.lossUSD < 1000000) {
        return 8;
      } else if (d.lossUSD > 10000000 && d.lossUSD < 50000000) {
        return 12;
      } else if (d.lossUSD > 50000000) {
        return 16;
      } else {
        return 4;
      }
    }
    
    function brushed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
      var s = d3.event.selection || x2.range();
      x.domain(s.map(x2.invert, x2));
      x3.domain(s.map(x2.invert, x2));
      focus.selectAll(".line").attr("d", line);
      focus.select(".axis--x").call(xAxis);
      stacks.select(".axis--x").call(xAxis3);
      dots.selectAll(".dot").attr("cx",function(d){
        return x(parseDate(d.date));
      })
      .attr("cy",function(d){
        return d3.select(this).attr("cy");
      });
      stacks.selectAll(".stack").attr("x", function(d){
        return x(parseDate(d.data.date));
      })
      .attr("y",function(d){
        return d3.select(this).attr("y");
      });
      svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0));
    }
    
    function zoomed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;
      var t = d3.event.transform;
      x.domain(t.rescaleX(x2).domain());
      x3.domain(t.rescaleX(x2).domain());
      focus.selectAll(".line").attr("d", line);
      focus.select(".axis--x").call(xAxis);
      stacks.select(".axis--x").call(xAxis3);
      dots.selectAll(".dot").attr("cx", function(d) {
        return x(parseDate(d.date));
      })
      .attr("cy", function(d) {
        return d3.select(this).attr("cy");
      });
      stacks.selectAll(".stack").attr("x", function(d){
        return x(parseDate(d.data.date));
      })
      .attr("y",function(d){
        return d3.select(this).attr("y");
      });
      context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
    }
    
    function closeVal(bitcoinData, date) {
      var found = bitcoinData.filter(function(datapoint) {
        var newDate = parseDate(date);
        return datapoint.date && newDate && datapoint.date.getTime() === newDate.getTime();
      });
    
      if (found.length) return found[0].close;
    
      return 0;
    } 

    // var sr = scrollreveal();
    // sr.reveal('.section');
  }

  render() {  

    function renderHack(hack, i) {
      var className = `hack-list__item ${hack.typeOfAttack} ${hack.cryptocurrency}`
      return (
        <div className={className} id={hack.id} key={i}>
          <div className="hack">{hack.typeOfAttack} {hack.lossUSD} USD</div>
          <div>Coin: {hack.cryptocurrency}</div>
          <div>Platform: {hack.platform}</div>
          <p>{hack.headline}</p>
          <a href={hack.source} className="hack-list__button" target="_blank">Read more</a>
        </div>        
      )
    }

    function renderList (attackArray) {
      return attackArray.map(function(hack, i) {
        return renderHack(hack, i);
      });
    }

    return (
      <div className="section-container section-container--dark">
      <section className="section section--viz">
        <svg width="960" height="800"></svg>
      </section>
      <div className="hack-list">
        {renderList(this.state.attackArray)}
      </div>
    </div>
    );
  }
}

export default Visualization;
