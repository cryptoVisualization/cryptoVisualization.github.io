import React, { Component } from 'react';
import scrollreveal from 'scrollreveal';
import './App.css';

class Attacks extends Component {

  componentDidMount() {
    var sr = scrollreveal();
    sr.reveal('.section');
  }

  render() {
    return (
      <div className="section-container section-container--deco section-container--dark">
        <section className="section">
          <h2>What are the different kind of attacks?</h2>
          <div className="attack-block">
            <h3>Hack:</h3>
            <p>A hack is an attack abusing a software vulnerability allowing an attacker to get access to data they should not be able to access making it possible to for example make transactions using other people’s funds. This is the most common type of attack that we analyze in our visualization.</p>
          </div>
          <div className="attack-block">
            <h3>Scam:</h3>
            <p>A scam is an attack where the attacker gains access to funds through manipulation of people rather than accessing the funds directly, examples of this often make use of tactics such as identity theft or fraudulent services posing as legitimate in order to steal.</p>
          </div>
          <div className="attack-block">
            <h3>Ponzi Scheme:</h3>
            <p>Some cryptocurrency attacks are based around having an exchange service or even an entire currency function as a ponzi scheme, where earlier adopters of the service fraudulently profit from newer users investing in the service.</p> 
          </div>
        </section>
      </div>
    );
  }
}

export default Attacks;
