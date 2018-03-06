import React, { Component } from 'react';
import * as d3 from 'd3';
import scrollreveal from 'scrollreveal';
import './App.css';

class Visualization extends Component {
  componentDidMount() {
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

      // focus.append("text")
      //   .attr("transform", "rotate(-90)")
      //   .attr("y", 0 - margin.left)
      //   .attr("x",0 - (height / 2))
      //   .attr("dy", "1em")
      //   .style("text-anchor", "middle")
      //   .text("Price in USD");  

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
    
      if (found.length) {
        return found[0].close
      } 
    
      return 0;
    } 

    var sr = scrollreveal();
    sr.reveal('.section');
  }

  render() {
    return (
      <div className="section-container section-container--dark">
      <section className="section section--viz">
        <svg width="960" height="800"></svg>
      </section>
      <div class="hack--list">
        <h3>LIST OF HACKS</h3>

        <div class="hack--item hack bitcoin" id="a9">
          <h4 class="hack">Hack <em>$1.000.000</em></h4>
          <h5>Coin: <em>Bitcoin</em> Platform: <em>Inputs.io</em> </h5>
          <p>Bitcoin site Inputs.io loses £1m after hackers strike twice</p>
          <a href="https://www.theguardian.com/technology/2013/nov/08/hackers-steal-1m-from-bitcoin-tradefortress-site class=" class="btn btn-default">Read more</a>
      </div>
        <div class="hack--item hack bitcoin" id="a10">
          <h4 class="hack">Hack <em>$500.000</em></h4>
          <h5>Coin: <em>Bitcoin</em> Platform: <em>Picostocks</em> </h5>
          <p>Even niche bitcoin firms aren’t immune. Picostocks is an attempt to become one of the first bitcoin stock markets. Although it currently has just four companies trading on it – one of which is Picostocks itself – that didn’t stop hackers making off with 6000 BTC in late November 2013.</p>
          <a href="https://www.theguardian.com/technology/2014/mar/18/history-of-bitcoin-hacks-alternative-currency" class="btn btn-default">Read more</a>
        </div>
        <div class="hack--item hack bitcoin" id="a11">
          <h4 class="hack">Hack <em>$1.000.000</em></h4>
          <h5>Coin: <em>Bitcoin</em> Platform: <em>BIPS</em> </h5>
          <p>Danish Bitcoin exchange BIPS hacked and 1,295 Bitcoins worth $1 Million Stolen</p>
          <a href="https://thehackernews.com/2013/11/danish-bitcoin-exchange-bips-hacked-and_25.html" class="btn btn-default">Read more</a>
        </div>
        <div class="hack--item hack bitcoin" id="a12">
          <h4 class="hack">Hack <em>$397.000.000</em></h4>
          <h5>Coin: <em>Bitcoin</em> Platform: <em>MyCoin</em> </h5>
          <p>Hong Kong Bitcoin Exchange MyCoin “Lost”  $387 Million of Customers’ Money</p>
          <a href="https://www.ccn.com/hong-kong-bitcoin-exchange-mycoin-lost-387-million-customers-money/" class="btn btn-default">Read more</a>
        </div>
        <div class="hack--item hack bitcoin" id="a13">
          <h4>Hack <em>$473.000.000</em></h4>
          <h5>Coin: <em>Bitcoin</em> Platform: <em>Mt. Gox</em> </h5>
          <p>The Mt. Gox hack is the largest cryptocurrency disaster to ever occur to this date. In total, $473 million worth of Bitcoin was stolen from the exchange. This theft occured over several years.</p>
          <a href="http://storeofvalueblog.com/posts/cryptocurrency-hacks-so-far-august-24th/" class="btn btn-default">Read more</a>
        </div>
        <div class="hack--item hack vericoin" id="a14">
            <h4>Hack <em>$2.000.000</em></h4>
            <h5>Coin: <em>VeriCoin</em> Platform: <em>MintPal</em> </h5>
            <p>The Digital currency exchange platform MintPal has suffered a successful hack attack that resulted in the loss millions of vericoins from its hot wallet.</p>
            <a href="https://www.coindesk.com/bitcoin-protected-vericoin-stolen-mintpal-wallet-breach/" class="btn btn-default">Read more</a>
          </div>
          <div class="hack--item scam bitcoin" id="a15">
              <h4>Scam<em> $1.000.000</em></h4>
              <h5>Coin: <em>Bitcoin</em> Platform: <em>Primedice</em> </h5>
              <p>Primedice, an online gaming site, learned a hard lesson when it lost $1 million in bitcoin to a hacker that exploited its RNG (random number generation) system last year. The company recently shared its experience on Medium, a website where people share stories. Stunna, the author of the story said the company wanted to share its experience so that others can learn from it.</p>
              <a href="https://www.ccn.com/player-cheated-online-bitcoin-gaming-site-1-million-reward-offered-help/" class="btn btn-default">Read more</a>
            </div>
            <div class="hack--item scam bitcoin" id="a16">
              <h4>Scam<em> $2.600.000</em></h4>
              <h5>Coin: <em>Bitcoin</em> Platform: <em>MintPal</em> </h5>
              <p>Mintpal scammer Ryan Kennedy arrested in U.K over theft of 3.700 Bitcoins</p>
              <a href="https://siliconangle.com/blog/2015/02/23/mintpal-scammer-ryan-kennedy-arrested-in-u-k-over-theft-of-3700-bitcoins/" class="btn btn-default">Read more</a>
            </div>
            <div class="hack--item ponzi bitcoin" id="a17">
              <h4>Ponzi Scheme<em> $4.500.000</em></h4>
              <h5>Coin: <em>Bitcoin</em> Platform: <em>Savings and Trust</em> </h5>
              <p>Manhattan U.S Attorney And FBI Assistant Director Announce Securities And Wire Fraud Charges Against Texas Man for Running Bitcoin Ponzi Scheme</p>
              <a href="https://www.justice.gov/usao-sdny/pr/manhattan-us-attorney-and-fbi-assistant-director-announce-securities-and-wire-fraud" class="btn btn-default">Read more</a>
            </div>
            <div class="hack--item hack bitcoin" id="a18">
              <h4>Hack<em> $1.800.000</em></h4>
              <h5>Coin: <em>Bitcoin</em> Platform: <em>BitPay</em> </h5>
              <p>Atlanta's Bitpay got hacked for $1.8 million in bitcoins</p>
              <a href="https://www.bizjournals.com/atlanta/blog/atlantech/2015/09/atlantas-bitpay-got-hacked-for-1-8-million-in.html						" class="btn btn-default">Read more</a>
            </div>
            <div class="hack--item hack bitcoin" id="a19">
              <h4>Hack<em> $5.100.000</em></h4>
              <h5>Coin: <em>Bitcoin</em> Platform: <em>Bitstamp</em> </h5>
              <p>Bitstamp suspended trading in January 2015 after one of its active operational Bitcoin storage wallets (AKA hot wallets) was compromised. The hackers made away with 19,000 Bitcoins which represent roughly $5,000,000 at the time.</p>
              <a href="http://storeofvalueblog.com/posts/cryptocurrency-hacks-so-far-august-24th/">Read more</a>
            </div>
            <div class="hack--item scam bitcoin" id="a21">
              <h4>Scam<em> $500.000</em></h4>
              <h5>Coin: <em>Bitcoin</em> Platform: <em>BTC-E</em> </h5>
              <p>Bitcoin Ponzi CryptoDouble Disappears With At Least 2233 Bitcoins</p>
              <a href="https://www.ccn.com/bitcoin-ponzi-cryptodouble-disappears-least-2233-bitcoins/">Read more</a>
            </div>
            <div class="hack--item ponzi bitcoin" id="a22">
              <h4>Ponzi Scheme<em> $9.182.000</em></h4>
              <h5>Coin: <em>Bitcoin</em> Platform: <em>GAW/Paycoin</em> </h5>
              <p>GAW/Paycoin CEO Josh Garza Held Liable for $9 Million USD for Wire Fraud</p>
              <a href="https://news.bitcoin.com/josh-garza-held-liable-9-million-usd-wire-fraud/">Read more</a>
            </div>
            <div class="hack--item hack ethereum" id="a23">
              <h4>Hack<em> $50.000.000</em></h4>
              <h5>Coin: <em>Ethereum</em> Platform: <em>DAO</em> </h5>
              <p>The DAO was an Ethereum project. Its goal was to codify the rules and decision-making apparatus of an orgnization, eliminating the need for documents and people in governing, creating a structure with decentralized control.</p>
              <a href="http://storeofvalueblog.com/posts/cryptocurrency-hacks-so-far-august-24th/">Read more</a>
            </div>
            <div class="hack--item hack steem" id="a24">
              <h4>Hack<em> $85.000</em></h4>
              <h5>Coin: <em>Steem</em> Platform: <em>Steemit</em> </h5>
              <p>Steem is a social media blockchain where users get rewarded for creating or curating good content. Steemit.com is a website that hosts content posted on the Steem blockchain and it’s the original and most popular UI used to interact with the blockchain.</p>
              <a href="http://storeofvalueblog.com/posts/cryptocurrency-hacks-so-far-august-24th/">Read more</a>
            </div>
            <div class="hack--item hack bitcoin" id="a25">
              <h4>Hack<em> $66.000.000</em></h4>
              <h5>Coin: <em>Bitcoin</em> Platform: <em>Bitfinex</em> </h5>
              <p>The Bitfinex hack was the second-biggest breach of a Bitcoin exchange platform at the time (first place goes to Mt. Gox). A total of 120,000 Bitcoin were stolen. This was worth about $72 million at the time. Bitfinex first announced the security breach on August 2, 2016.</p>
              <a href="http://storeofvalueblog.com/posts/cryptocurrency-hacks-so-far-august-24th/">Read more</a>
            </div>
            <div class="hack--item fraud bitcoin" id="a26">
              <h4>Fraud<em> $8.450</em></h4>
              <h5>Coin: <em>Bitcoin</em> Platform: <em></em> </h5>
              <p>3 arrested over Bitcoin fraud in Japan first</p>
              <a href="https://mainichi.jp/english/articles/20161104/p2a/00m/0na/009000c">Read more</a>
            </div>
            <div class="hack--item ransomeware bitcoin" id="a27">
              <h4>Ransomeware<em> $140.000</em></h4>
              <h5>Coin: <em>Bitcoin</em> Platform: <em>WannaCry</em> </h5>
              <p>WannaCry Extortionists’ Ill-Gotten Bitcoins Are on the Move</p>
              <a href="https://www.ccn.com/wannacry-extortionists-ill-gotten-bitcoins-are-on-the-move/">Read more</a>
            </div>
            <div class="hack--item hack bitcoin" id="a28">
              <h4>Hack<em> $36.000</em></h4>
              <h5>Coin: <em>Bitcoin</em> Platform: <em></em> </h5>
              <p>Malware Snatches 13BTC ($36,000) From Bitcoin User.</p>
              <a href="https://www.ccn.com/malware-snatches-13btc-36000-bitcoin-user/">Read more</a>
            </div>
            <div class="hack--item hack ethereum" id="a29">
              <h4>Hack<em> $7.000.000</em></h4>
              <h5>Coin: <em>Bitcoin</em> Platform: <em>Coindash</em> </h5>
              <p>CoinDash is an Israeli startup that conducted an ICO in July of this year to raise funds. However, just 13 minutes into the crowdsale, a hacker was able to change the Ethereum address posted on the ICO’s website. This address is where interested investors should send their Ether to in order to receive CoinDash tokens in return.</p>
              <a href="http://storeofvalueblog.com/posts/cryptocurrency-hacks-so-far-august-24th/">Read more</a>
            </div>
            <div class="hack--item ponzi onecoin" id="a30">
              <h4>Ponzi Scheme<em> $12.000.000</em></h4>
              <h5>Coin: <em>OneCoin</em> Platform: <em></em> </h5>
              <p>Indian Police Label $12 Million OneCoin Operation a ‘Clear Ponzi Scheme’</p>
              <a href="https://www.ccn.com/indian-police-label-12-million-onecoin-operation-a-clear-ponzi-scheme/">Read more</a>
            </div>
            <div class="hack--item hack ethereum" id="a31">
              <h4>Hack<em> $32.000.000</em></h4>
              <h5>Coin: <em>Ethereum</em> Platform: <em>Parity Multisig Wallet</em> </h5>
              <p>The Parity hacker found a vulnerability in the Parity Multisig Wallet that allowed access to funds from the ICOs of Edgeless, Casino, Swarm City and aeternity blockchain.</p>
              <a href="https://www.ccn.com/indian-police-label-12-million-onecoin-operation-a-clear-ponzi-scheme/">Read more</a>
            </div>
            <div class="hack--item hack etherum" id="a32">
              <h4>Hack<em> $31.000.000</em></h4>
              <h5>Coin: <em>Ethereum </em> Platform: <em>  </em> </h5>
              <p>At noon on July 20, a hacker drained $31 million (153,037) out of three very large wallets, which belonged to Swarm City, Edgeless CAsiono and æternity.</p>
              <a href="https://99bitcoins.com/top-5-cryptocurrency-hacks-of-all-time/">Read more</a>
            </div>
            <div class="hack--item hack vericoin" id="a33">
              <h4>Hack<em> $8.000.000</em></h4>
              <h5>Coin: <em>VeriCoin </em> Platform: <em>  </em> </h5>
              <p>Veritaseum concluded their ICO on May 26th. I couldn’t find a source with information on how much the ICO raised. Nevertheless, on July 23rd, Middleton claimed in Veritaseum’s Slack group that hackers stole 36,000 VERI tokens out of a wallet held by the company. </p>
              <a href="http://storeofvalueblog.com/posts/cryptocurrency-hacks-so-far-august-24th/">Read more</a>
            </div>
            <div class="hack--item scam bitcoin" id="a34">
              <h4>Scam<em> $4.000.000</em></h4>
              <h5>Coin: <em>Bitcoin</em> Platform: <em>BTC-e</em> </h5>
              <p>BREAKING: Alleged BTC-E Admin Arrested for Laundering $4 Billion in Bitcoin </p>
              <a href="https://www.ccn.com/alleged-btc-e-admin-arrested-for-laundering-4-billion-in-bitcoin/">Read more</a>
            </div>
            <div class="hack--item hack ethereum" id="a35">
              <h4>Hack<em> $500.000</em></h4>
              <h5>Coin: <em>Ethereum</em> Platform: <em>Enigma ICO</em> </h5>
              <p>The Enigma ICO was hacked in a very different way from the CoinDash ICO. Enigma was started by a group of MIT graduates and the project was able to create a strong community of over 9,000 users who joined the project’s mailing list and Slack group. </p>
              <a href="http://storeofvalueblog.com/posts/cryptocurrency-hacks-so-far-august-24th/">Read more</a>
            </div>
            <div class="hack--item hack tether" id="a36">
              <h4>Hack<em> $30.900.000</em></h4>
              <h5>Coin: <em>Tether</em> Platform: <em></em> </h5>
              <p>Tether combines the best of fiat currence and blockchain technology, in order to create a form of digital money known as USD Tokens (USDT) You can use USDT for trading your "real world" money for Bitcoin, Litecoin, or Ethereum. </p>
              <a href="https://99bitcoins.com/top-5-cryptocurrency-hacks-of-all-time/">Read more</a>
            </div>
            <div class="hack--item ponzi bitcoin" id="a37">
              <h4>Ponzi Scheme<em> $375.000</em></h4>
              <h5>Coin: <em>Bitcoin</em> Platform: <em>Confido</em> </h5>
              <p>The SEC’s move comes just days after another high profile ICO fraud, Confido, made headlines on November 21st. In a story that’s become practically archetypal in the ICO scene, Confido’s cofounders made off with $375,000 of unwary investors’ cash. </p>
              <a href="https://www.99crypto.com/list-of-cryptocurrency-scams/						">Read more</a>
            </div>
            <div class="hack--item ponzi bitcoin" id="a38">
              <h4>Ponzi Scheme<em> $38.000.000</em></h4>
              <h5>Coin: <em>Bitcoin</em> Platform: <em></em> </h5>
              <p>Seven individuals in the South Korean province of Jeonbuk have been arrested for running a large-scale $38 million scam, alluring middle-aged investors into a ponzi scheme. </p>
              <a href="https://www.ccn.com/38-million-south-korean-bitcoin-scam-group-arrested/">Read more</a>
            </div>
            <div class="hack--item hack bitcoin" id="a39">
              <h4>Hack<em> $56.430.000</em></h4>
              <h5>Coin: <em>Bitcoin</em> Platform: <em>NiceHash</em> </h5>
              <p>NiceHash is a Slovenian company that helps cryptocurrency miners buy or sell computing power. Transactions are carried out in Bitcoins. Miners pay as they mine, without taking undue risks. There are no upfront fees.</p>
              <a href="https://99bitcoins.com/top-5-cryptocurrency-hacks-of-all-time/">Read more</a>
            </div>
            <div class="hack--item scam ethereum" id="a40">
              <h4>Scam<em> $250.000.000</em></h4>
              <h5>Coin: <em>Ethereum</em> Platform: <em>Mining Max</em> </h5>
              <p>Korean prosecutors have reportedly filed charges against several individuals associated with Mining Max, US-based cryptocurrency mining firm allegedly behind a major cryptocurrency mining scam.</p>
              <a href="https://www.ccn.com/250-million-ethereum-mining-scam-korean-prosecutors-file-charges/">Read more</a>
            </div>
            <div class="hack--item ponzi bitconnectcoin" id="a41">
              <h4>Ponzi<em> $2.600.000.000</em></h4>
              <h5>Coin: <em>BitConnectCoin</em> Platform: <em>BitConnect</em> </h5>
              <p>In a menacing turn of events yesterday, Bitcoin investment lending platform BitConnect abruptly announced it is shutting down its lending and exchange serveces. But while this sudden "curveball" might have come asa massive surpirse for thousands of gullible investors, the writing was on the wall all along.</p>
              <a href="https://thenextweb.com/hardfork/2018/01/17/bitconnect-bitcoin-scam-cryptocurrency/">Read more</a>
            </div>
            <div class="hack--item scam ethereum" id="a42">
              <h4>Scam<em> $11.000.000</em></h4>
              <h5>Coin: <em>Ethereum</em> Platform: <em>Prodeum</em> </h5>
              <p>Three blockchain experts lineked to an illegitimate startup called Prodeum told Business Insider they have nothing to do with the organization and are victims of identity theft. The startup, Prodeum, raised $11m in an online fundraiser before disappearing on Sudnay. Prodeum's website went blank late Sunday aside for the text "penis" in the upper-left corner.</p>
              <a href="http://www.businessinsider.de/cryptocurrencty-and-blockchain-startup-prodeum-pulled-an-exit-scam-2018-1?r=US&IR=T">Read more</a>
            </div>
            <div class="hack--item hack iota" id="a43">
              <h4>Hack<em> $4.000.000</em></h4>
              <h5>Coin: <em>IOTA</em> Platform: <em></em> </h5>
              <p>The IOTA project is again the target of public anger and criticism. This time the issue is a feature of the technology that apparently allowed scammers to steal around $4 million from many unsuspecting users.</p>
              <a href="https://news.bitcoin.com/iota-attacked-for-subpar-wallet-security-following-4m-hack">Read more</a>
            </div>
            <div class="hack--item hack nem" id="a44">
              <h4>Hack<em> $400.000.000</em></h4>
              <h5>Coin: <em>NEM</em> Platform: <em>CoinCheck</em> </h5>
              <p>Through means currently unknown, approximately 500 million NEM tokens were exfiltrated from leading Japanese cryptocurrency exchange Coincheck, valued at approximately $400 million. Bloomberg reports that, aside from Bitcoin, all trading on the platform has been suspended.</p>
              <a href="https://gizmodo.com/400-million-goes-missing-from-japanese-crypto-exchange-1822454084">Read more</a>
            </div>
            <div class="hack--item scam ethereum" id="a45">
              <h4>Scam<em> $2.000.000</em></h4>
              <h5>Coin: <em>Ethereum</em> Platform: <em></em> </h5>
              <p>Potential Seele ICO investors were recently scammed out of nearly $2 million by impersonators posing as admins, who used the company’s Telegram channel to get them to send their money over before the token sale began.</p>
              <a href="https://www.ccn.com/impersonators-scam-seele-ico-investors-out-of-2-million-worth-of-ether/">Read more</a>
            </div>
            <div class="hack--item scam bitcoin" id="a46">
              <h4>Scam<em> $115.000.000</em></h4>
              <h5>Coin: <em>Bitcoin</em> Platform: <em></em> </h5>
              <p>An alleged scam involving investments in bitcoin in Austria has reportedly affected over ten thousand investors in the country and around Europe.</p>
              <a href="https://www.ccn.com/austrian-bitcoin-scam-10000-victims-lose-12000-btc-115-million/">Read more</a>
            </div>
      </div>
    </div>
    );
  }
}

export default Visualization;
