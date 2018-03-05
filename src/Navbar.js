import React, { Component } from 'react';
import { NavLink } from "react-router-dom";
import './App.css';

class Navbar extends Component {
  render() {
    return (
      <ul className="navbar">
        <li className="navbar__item"><NavLink className="navbar__link" to="/"></NavLink></li>
        <li className="navbar__item"><NavLink className="navbar__link" to="/introduction">01</NavLink></li>
        <li className="navbar__item"><NavLink className="navbar__link" to="/cryptocurrencies">02</NavLink></li>
        <li className="navbar__item"><NavLink className="navbar__link" to="/attacks">03</NavLink></li>
        <li className="navbar__item"><NavLink className="navbar__link" to="/visualization">04</NavLink></li>
        <li className="navbar__item"><NavLink className="navbar__link" to="/conclusions">05</NavLink></li>
        <li className="navbar__item"><NavLink className="navbar__link" to="/references">06</NavLink></li>
        <li className="navbar__item"><NavLink className="navbar__link" to="/aboutus">07</NavLink></li>
      </ul>
    );
  }
}

export default Navbar;
