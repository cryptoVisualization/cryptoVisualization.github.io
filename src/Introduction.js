import React, { Component } from 'react';
import scrollreveal from 'scrollreveal';
import './App.css';

class Introduction extends Component {

  componentDidMount() {
    var sr = scrollreveal();
    sr.reveal('.section');
  }

  render() {
    console.log(this.props)
    return (
      <div className="section-container section-container--dark">
        <section className="section">
          <h2>Introduction</h2>
          <p>There is currently a craze surrounding the relatively new concept of cryptocurrencies. Currencies that carry no real value other than the ability to trade them anonymously and without a central agency in control. This current obsession with the concept causes a very volatile market with prices increasing and dropping incredibly fast and huge amounts of people flocking to invest in the currencies.</p>
          <p>A huge new volatile market like this attracts not only hopeful investors, but also malicious activity in the forms of scams, ponzi schemes and hacks that seek to capitalize on the widespread hype combined with the lack of knowledge surrounding the new market. This is why we seek to visualize these attacks, to serve as a tool allowing users to clearly see what is happening in the cryptocurrency market in terms of prices changing over time, comparing different currencies to one another, and most importantly to showcase some of the dangers potential investors must be careful to avoid in this new market.</p>          
        </section>
      </div>
    );
  }
}

export default Introduction;
