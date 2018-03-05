import React, { Component } from 'react';
import scrollreveal from 'scrollreveal';
import './App.css';

class Home extends Component {

  componentDidMount() {
    var sr = scrollreveal();
    sr.reveal('.section');
  }

  render() {
    return (
      <div className="section-container section-container--dark">
        <section className="section section--centered">
          <h2>Welcome to the world of cryptocurrencies and fraud! Understand the impact of 
          fraud on the capitalization of the affected currency and the trust of the community.</h2>
        </section>
      </div>
    );
  }
}

export default Home;
