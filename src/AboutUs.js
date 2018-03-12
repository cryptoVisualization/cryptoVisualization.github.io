import React, { Component } from 'react';
import scrollreveal from 'scrollreveal';
import './App.css';

class AboutUs extends Component {

  componentDidMount() {
    var sr = scrollreveal();
    sr.reveal('.section');
  }

  render() {
    return (
      <div className="section-container section-container--deco1 section-container--dark">
        <section className="section">
          <h2>About us</h2>
          <p>We are a group of students at the Royal Institute of Technology (KTH) in Stockholm, Sweden with a great interest in data visualization, cryptocurrencies and computer security. These interests led us to create this visualization as a tool to analyze prices and attacks concerning cryptocurrencies.</p>
        </section>
      </div>
    );
  }
}

export default AboutUs;
