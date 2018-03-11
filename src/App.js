import React, { Component } from 'react';
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import scrollreveal from 'scrollreveal';
import Navbar from './Navbar.js';
import Home from './Home.js';
import Introduction from './Introduction.js';
import Cryptocurrencies from './Cryptocurrencies.js';
import Attacks from './Attacks.js';
import Visualization from './Visualization.js';
import Conclusions from './Conclusions.js';
import References from './References.js';
import AboutUs from './AboutUs.js';
import './App.css';

class App extends Component {

  componentDidMount() {
    var sr = scrollreveal();
    sr.reveal('.navbar__link', { duration: 2000 }, 50);
  }

  render() {
    return (
      <HashRouter>
        <div className="App">
          <Navbar/>          
          <div className="content">
            <NavLink to="/"><h1>CryptoViz.fun</h1></NavLink>
            <Route exact path="/" component={Home}/>
            <Route path="/introduction" render={(props) => (<Introduction test="hi" {...props}/>)}/>
            <Route path="/cryptocurrencies" component={Cryptocurrencies}/>
            <Route path="/attacks" component={Attacks}/>
            <Route path="/visualization" component={Visualization}/>
            <Route path="/conclusions" component={Conclusions}/>
            <Route path="/references" component={References}/>
            <Route path="/aboutus" component={AboutUs}/>
          </div>
        </div>
      </HashRouter>
    );
  }
}

export default App;
