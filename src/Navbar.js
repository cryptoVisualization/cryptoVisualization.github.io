import React, { Component } from 'react';
import { NavLink } from "react-router-dom";
import './App.css';

class Navbar extends Component {
  render() {
    return (
      <ul className="header">
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/introduction">Intro</NavLink></li>
        <li><NavLink to="/cryptocurrencies">Cryptocurrencies</NavLink></li>
        <li><NavLink to="/attacks">Attacks</NavLink></li>
        <li><NavLink to="/visualization">Visualization</NavLink></li>
        <li><NavLink to="/conclusions">Conclusions</NavLink></li>
        <li><NavLink to="/references">References</NavLink></li>
        <li><NavLink to="/aboutus">About us</NavLink></li>
      </ul>
    );
  }
}

export default Navbar;
