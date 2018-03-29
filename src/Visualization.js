import React, { Component } from 'react';
import { cloneDeep } from "lodash";
import * as d3 from 'd3';
import $ from "jquery";
import './App.css';

import BitCoinLogo from "./assets/images/btc.svg"
import EthereumLogo from "./assets/images/eth.svg"
import vrcLogo from "./assets/images/vrc.svg"
import xrcLogo from "./assets/images/xrp.svg"
import iotaLogo from "./assets/images/iota.svg"
import steemLogo from "./assets/images/steem.svg"
import nemLogo from "./assets/images/nem.svg"
import tetherLogo from "./assets/images/tether.svg"

import './Visualization.css';

class Visualization extends Component {
  
  state = {
    attackArray: []
  };

  componentDidMount() {
    var currencyMap = {}
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
        z3 = d3.scaleOrdinal().range(["orange", "purple", "silver", "lime", "blue", "white", "red", "yellow"]);

    var xAxis  = d3.axisBottom(x),
        xAxis2 = d3.axisBottom(x2),
        xAxis3 = d3.axisTop(x3),
        yAxis  = d3.axisLeft(y).ticks(5),
        yAxis3 = d3.axisLeft(y3).ticks(5).tickFormat(d3.formatPrefix(".1", 1e6));
    
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
      return d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat("")
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
    
    var global_coinmarketcap = {}

    d3.queue()
      .defer(d3.csv, "datasets/coinmarketcap.csv")
      .defer(d3.csv, "datasets/attacks.csv")
      .await(function(error, coinmarketcap,  bitcoinAttackData) {
        if (error) {
          console.error('Oh mein Gott! Something went terribly wrong: ' + error);
        } else {
          renderCharts(coinmarketcap, bitcoinAttackData);
        }
      });
    
    function renderCharts(coinmarketcap, attackArray) {

      global_coinmarketcap = coinmarketcap;

      var plottedCoins = ['Bitcoin', 'Ethereum', 'IOTA', 'NEM', 'Ripple', 'Tether', 'Steem', 'Vericoin'];

      var yearMonthAttacks = cloneDeep(attackArray).map(function(d) {
        d.date = d.date.slice(0,7);
        return d;
      })

      var processedMonths = [];

      var reduceCoin = function(arr, coin) {
        return arr.reduce(function(acc, curr) {
          return curr.cryptocurrency === coin 
            ? acc + parseInt(curr.lossUSD, 10)
            : acc
        }, 0)
      }

      var attackAggregated = yearMonthAttacks.map(function(d) {
        if (!processedMonths.includes(d.date)) {
          processedMonths.push(d.date);
          
          var monthHacks = yearMonthAttacks.filter(function(a) {
            return a.date === d.date; 
          });

          var result = {
            date: new Date(d.date),
            Bitcoin: reduceCoin(monthHacks, 'Bitcoin'),
            Vericoin: reduceCoin(monthHacks, 'Vericoin'),
            NEM: reduceCoin(monthHacks, 'NEM'),
            IOTA: reduceCoin(monthHacks, 'IOTA'),
            Ripple: reduceCoin(monthHacks, 'Ripple'),
            Ethereum: reduceCoin(monthHacks, 'Ethereum'),
            Tether: reduceCoin(monthHacks, 'Tether'),
            Steem: reduceCoin(monthHacks, 'Steem'),
          }

          result.total = result.Bitcoin 
                       + result.Vericoin
                       + result.NEM
                       + result.IOTA
                       + result.Ripple
                       + result.Ethereum
                       + result.Tether
                       + result.Steem;

          return result;
        } else {
          return undefined
        }
      });

      var aggregatedData = attackAggregated.filter(function(d) {
        return d !== undefined && d.total !== 0
      });

      that.setState({attackArray})

      var selectCoinData = function(coin) {
        return coinmarketcap.filter(function(d) {
          return d.coin === coin;
        }).map(function(d) { 
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

      currencyMap = {
        "Bitcoin" : bitcoinData,
        "Ethereum" : ethereumData,
        "IOTA" : iotaData,
        "NEM" : nemData,
        "Ripple" : rippleData,
        "Tether" : tetherData,
        "Steem" : steemData,
        "VeriCoin" : vrcData,
      };

      var keys = [...plottedCoins];
    
      x.domain(d3.extent(coinmarketcap, function(d) { return +d.date; }));
      y.domain(d3.extent(coinmarketcap, function(d) { return +d.close; }));
      x2.domain(x.domain());
      y2.domain(y.domain());
      x3.domain(x.domain());
      y3.domain(d3.extent(aggregatedData, function(d) { return +d.total; }));
      z3.domain(keys)

      var tip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip');

      focus.append("g")			
        .attr("class", "grid")
        .call(make_y_gridlines()
        )

      focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      focus.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);

      appendCoin(bitcoinData, "orange", line, line2, focus, context);
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
        .attr("cx", function(d) { 
          return x(parseDate(d.date)); })
        .attr("cy", function(d) { 
          return y(closeVal(d.cryptocurrency,coinmarketcap, d.date, d)); })
        .attr("class", addDotClass)
        .attr("r", dotSize)
        .on("click", function(d) {
          window.open(d["source"]); 
        })
        .on('mouseover', function(d, i) {
          var $hackList = $('.hack-list');
          var $hackItem = $("#" + d.id);

          $hackItem.addClass('hack-list__item--highlighted');
          $hackList.dequeue().animate({scrollTop: $hackItem.offset().top + $hackList.scrollTop()}, 1000);

          tip.transition().duration(0);
            //  Get coordinates of mouse for tooltip positioning
          var coordinates = d3.mouse(this); 
          var x = coordinates[0];
          var y = coordinates[1];
          //  Position tooltip
          tip.style("left", x + "px")
          .style("top", y + "px")
          .style('display', 'block')
          //  ES6 TEMPLATE string, this is the values given to tooltip
          var html = `               
            <div>    
              <div>${d.platform} </div>
              <div>${d.date} </div>
              <div>${formatUSD(d.lossUSD)}</div>
            </div>`;
          tip.html(html);     //  Give our template string to the tooltip for output
        })
        .on('mouseout', function(d, i) {  //  Mouseout
          $("#" + d.id).removeClass('hack-list__item--highlighted');
          tip.transition()
            .delay(800)
            .style('display', 'none');
        });

      stacks.append("g")
        .attr("class", "axis axis--x")
        .call(xAxis3);
    
      stacks.append("g")
        .attr("class", "axis axis--y axis--margin")
        .call(yAxis3);

      stacks.append("g")
        .attr("clip-path", "url(#clip)")
        .selectAll("g")
        .data(d3.stack().keys(keys)(aggregatedData))
        .enter().append("g")
          .attr("fill", function(d) { 
            return z3(d.key); })
        .selectAll("rect")
        .data(function(d) {return d;})
        .enter().append("rect")
        .attr("class", "stack")
        .attr("x", function(d) { 
          return x3(d.data.date) - (width / 74); })
        .attr("y", 1)
        .attr("width", function(d) {             
          return width / 74 })
        .attr("height", function(d) { 
          return y3(parseInt(d[1], 10)) - y3(parseInt(d[0], 10)); })
        .on('mouseover', function(d, i) {
          tip.transition().duration(0);
          var coordinates = d3.mouse(this); 
          var x = coordinates[0];
          var y = coordinates[1];
          tip.style("left", x + 100 + "px")
             .style("top", y + 500 + "px")
             .style('display', 'block')

          var html = `               
            <div>
              Total loss: ${formatUSD(d[1])}
              <ul>`
              html += d.data.Bitcoin ? `<li>Bitcoin: ${formatUSD(d.data.Bitcoin)}</li>` : ''
              html += d.data.Ethereum ? `<li>Ethereum: ${formatUSD(d.data.Ethereum)}</li>` : ''
              html += d.data.Ripple ? `<li>Ripple: ${formatUSD(d.data.Ripple)}</li>` : ''
              html += d.data.IOTA ? `<li>IOTA: ${formatUSD(d.data.IOTA)}</li>` : ''
              html += d.data.NEM ? `<li>NEM: ${formatUSD(d.data.NEM)}</li>` : ''
              html += d.data.Steem ? `<li>Steem: ${formatUSD(d.data.Steem)}</li>` : ''
              html += d.data.Tether ? `<li>Tether: ${formatUSD(d.data.Tether)}</li>` : ''
              html += d.data.Vericoin ? `<li>Vericoin: ${formatUSD(d.data.Vericoin)}</li>` : ''
              html += ` 
              </ul>
            </div>`;
          tip.html(html);     //  Give our template string to the tooltip for output
        })
        .on('mouseout', function(d, i) {  //  Mouseout
          tip.transition()
            .delay(800)
            .style('display', 'none');
        });
    }
    
    function appendCoin(data, color, line, line2, target, brushTarget) {
      target.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("id",data[0].coin)
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
        return x(d.data.date);
      })
      .attr("y",function(d){
        return d3.select(this).attr("y");
      });
      svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0));
      update();
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
        return x(d.data.date);
      })
      .attr("y",function(d){
        return d3.select(this).attr("y");
      });
      context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
    }
    
    function closeVal(cryptocurrency,coinmarketcap,date,d){
      if(d.close){
        return d.close;
      }
      var currency = currencyMap[cryptocurrency];
      if(!currency){
        d.close = 0
        return 0;
      }
      var found = currency.filter(function(datapoint) {
        var newDate = parseDate(date);
        var correctDate = datapoint.date && newDate && datapoint.date.getTime() === newDate.getTime();
        // var correctCurrency = datapoint.coin == cryptocurrency
        return correctDate;
      });
      if (found.length){
        d.close = found[0].close;
        return found[0].close;
      }
      d.close = 0;
      return 0;
    } 

    var currentCurrencies = [
      "Bitcoin",
      "Ethereum",
      "Ripple",
      "NEM",
      "VeriCoin",
      "IOTA",
      "Steem",
      "Tether"
    ];

    function update(){
      var minmaxArray = []
      for(var i = 0; i < currentCurrencies.length; i++){
        var currencyData = d3.select("#"+currentCurrencies[i]).data()[0];
        currencyData = currencyData.filter(
          function(d){
            return (d.date.getTime() < x.domain()[1].getTime()) && 
            (d.date.getTime() > x.domain()[0].getTime());});
        minmaxArray.push(d3.extent(currencyData, function(d) { 
          return +d.close; }));
      }
      var min = d3.min(minmaxArray,function(d){ return d[0]})
      var max = d3.max(minmaxArray,function(d){ return d[1]});
      
      y.domain([min,max]);

      focus.select(".grid").transition().duration(1000).call(make_y_gridlines())

      focus.select(".axis--y").transition().duration(1000).call(yAxis);
      var s = d3.event.selection || x2.range();
      x.domain(s.map(x2.invert, x2));
      x3.domain(s.map(x2.invert, x2));
      focus.selectAll(".line").transition().duration(1000).attr("d", line);
      focus.select(".axis--x").call(xAxis);
      stacks.select(".axis--x").call(xAxis3);
      console.time();
      dots.selectAll(".dot")
      .transition().duration(1000)
      .attr("display", function(d){
        if(currentCurrencies.includes(d.cryptocurrency)){
          return "block";
        } else {
          return "none";
        }
      })
      .attr("cx",function(d){
        return x(parseDate(d.date));
      })
      .attr("cy",function(d) { 
        return y(closeVal(d.cryptocurrency,global_coinmarketcap,d.date,d)); 
      });
      console.timeEnd();
    }

    d3.selectAll(".crypto-logo-block").on("click",function(){
      var currency = this.dataset.cryptocurrency;
      var currencyLine = d3.select("#"+currency);
      if(currentCurrencies.includes(currency)){
        currentCurrencies = currentCurrencies.filter(o => o !== currency);
        currencyLine.classed("invisible",true);
        this.classList.remove("crypto-logo--active");
      } else {
        currentCurrencies.push(currency);
        currencyLine.classed("invisible",false);
        this.classList.add("crypto-logo--active");
      }
      update();
    });
  }

  render() {  

    function renderHack(hack, i) {
      var className = `hack-list__item ${hack.typeOfAttack} ${hack.cryptocurrency}`
      return (
        <div className={className} id={hack.id} key={i}>
          <div className="hack">{hack.typeOfAttack} {formatUSD(hack.lossUSD)}</div>
          <div>Coin: {hack.cryptocurrency}</div>
          { hack.platform && <div>Platform: {hack.platform}</div> }
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
          <div className="viz-wrap">
            <div className="crypto-logo-container">
              <div className="crypto-logo-container-row">
                <div className="crypto-logo-block crypto-logo--active" data-cryptocurrency="Bitcoin" id="bitcoinLogo">
                  <img src={BitCoinLogo} className="crypto-logo" alt=""/>
                  <div className="crypto-name crypto-name--orange">Bitcoin</div>
                </div>
                <div className="crypto-logo-block crypto-logo--active" data-cryptocurrency="Ethereum" id="ethereumLogo">
                  <img src={EthereumLogo} className="crypto-logo" alt=""/>
                  <div className="crypto-name crypto-name--purple">Ethereum</div>
                </div>
                <div className="crypto-logo-block crypto-logo--active" data-cryptocurrency="Ripple" id="rippleLogo">
                  <img src={xrcLogo} className="crypto-logo" alt=""/>
                  <div className="crypto-name crypto-name--blue">Ripple</div>
                </div>
                <div className="crypto-logo-block crypto-logo--active" data-cryptocurrency="NEM" id="nemLogo">
                  <img src={nemLogo} className="crypto-logo" alt=""/>
                  <div className="crypto-name crypto-name--lime">NEM</div>
                </div>
              </div>
              <div className="crypto-logo-container-row">
                <div className="crypto-logo-block crypto-logo--active" data-cryptocurrency="VeriCoin" id="vrcLogo">
                  <img src={vrcLogo} className="crypto-logo" alt=""/>
                  <div className="crypto-name crypto-name--yellow">VeriCoin</div>
                </div>
                <div className="crypto-logo-block crypto-logo--active" data-cryptocurrency="IOTA" id="iotaLogo">
                  <img src={iotaLogo} className="crypto-logo" alt=""/>
                  <div className="crypto-name crypto-name--silver">IOTA</div>
                </div>
                <div className="crypto-logo-block crypto-logo--active" data-cryptocurrency="Steem" id="steemLogo">
                  <img src={steemLogo} className="crypto-logo" alt=""/>
                  <div className="crypto-name crypto-name--red">Steem</div>
                </div>
                <div className="crypto-logo-block crypto-logo--active" data-cryptocurrency="Tether" id="tetherLogo">
                  <img src={tetherLogo} className="crypto-logo" alt=""/>
                  <div className="crypto-name crypto-name--white">Tether</div>
                </div>
              </div>
            </div>
            <section className="section section--viz">
              <svg width="960" height="800"></svg>
            </section>
          </div>
          <div className="hack-list">
            {renderList(this.state.attackArray)}
          </div>
        </div>
    );
  }
}

function formatUSD(number) {
  return new Intl.NumberFormat('en-EN', { style: 'currency', currency: 'USD' }).format(number);
}

export default Visualization;
