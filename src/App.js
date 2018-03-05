import React, { Component } from 'react';
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import Navbar from './Navbar.js';
import Home from './Home.js';
import Introduction from './Introduction.js';
import Visualization from './Visualization.js';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <HashRouter>
          <div>
            <h1>CryptoViz.fun</h1>
            <Navbar/>
            <div className="content">
              <Route exact path="/" component={Home}/>
              <Route path="/introduction" component={Introduction}/>
              <Route path="/visualization" component={Visualization}/>
            </div>
          </div>
        </HashRouter>
      </div>
    );
  }
}

export default App;
