import React, { Component } from 'react';
import scrollreveal from 'scrollreveal';
import './App.css';

class Cryptocurrencies extends Component {

  componentDidMount() {
    var sr = scrollreveal();
    sr.reveal('.section');
  }

  render() {
    return (
      <div className="section-container section-container--light">
        <section className="section">
          <h2>What are cryptocurrencies?</h2>
          <p>A cryptocurrency is a digital currency based around the idea of using cryptography to allow for decentralization of the control of the currency. This works through the use of so called blockchains, which are essentially public digital ledgers holding a list of blocks that typically contain a cryptographic hash of the prior block in the blockchain along with transaction data and a timestamp. The blockchains work on the basis of proof-of-work schemes that use hashing algorithms to prove work done, as they can be used to create tasks that are demanding to solve but it is trivial to check whether a solution is correct. This proof of work allows for the protocol to be secure by design by always favoring a blockchain that has more work done as the valid blockchain.</p>
          <p>The result is a system that does not require a central authority or trust between users as it is infeasible to fake a transaction because of the system being authenticated by mass collaboration based on collective self interest. A blockchain containing a fake transaction would eventually end up being replaced by the valid blockchain once more work has been done in the valid blockchain, which means that in order to theoretically fake transactions you would need to be in control of a majority of the processing power within the system.</p>
        </section>
      </div>
    );
  }
}

export default Cryptocurrencies;
