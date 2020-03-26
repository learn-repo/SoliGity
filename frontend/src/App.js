import React, { Component } from "react";
import HomePage from "./HomePage";
import "./App.css";
import ReposPage from "./ReposPage";
import ParticipatedPage from "./ParticipatedPage";
import SettingsPage from "./SettingsPage";
import { createBrowserHistory as createHistory } from "history";
import { Router, Route } from "react-router-dom";
import SignUpPage from "./SignUpPage";
import RequireAuth from "./RequireAuth";
import Web3 from 'web3';
import SoliGity from './abis/SoliGity';

import Addressbar from './Addressbar';
import Test from "./Test";

const history = createHistory();

class App extends Component {
  state = {
    account: '',
    eventNumber: 0,
    rewardEvents: [],
    loading: true
  }

  async componentDidMount() {
    await this.getWeb3Provider();
    await this.connectToBlockchain();
  }

  async getWeb3Provider() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  async connectToBlockchain() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = SoliGity.networks[networkId];
    if (networkData) {
      const deployedSoliGity = new web3.eth.Contract(SoliGity.abi, networkData.address);
      this.setState({ deployedSoliGity: deployedSoliGity });
      const eventNumber = await deployedSoliGity.methods.eventNumber().call();
      console.log(`eventNumber: ${eventNumber}`);
      this.setState({ eventNumber });

      for (var i = 1; i <= eventNumber; i++) {
        const event = await deployedSoliGity.methods.RewardEvents(i).call();
        this.setState({
          rewardEvents: [...this.state.rewardEvents, event]
        });
      }
      this.setState({ loading: false })
      console.log(this.state.rewardEvents);
    } else {
      window.alert('SoliGity contract is not found in your blockchain.')
    }
  }

  createIssue = async (projectID, title, sponsorID, sponsorName, bountyAmount) => {
    this.setState({ loading: true });
    const gasAmount = await this.state.deployedSoliGity.methods.createIssue(projectID, title, sponsorID, sponsorName, bountyAmount).estimateGas({ from: this.state.account });
    this.state.deployedSoliGity.methods.createIssue(projectID, title, sponsorID, sponsorName, bountyAmount).send({ from: this.state.account, gas: gasAmount })
      .once('receipt', (receipt) => {
        this.setState({ loading: false });
      })
  }

  requestReview = async (eventID, bountyHunterID, bountyHunterName) => {
    this.setState({ loading: true });
    const gasAmount = await this.state.deployedSoliGity.methods.requestReview(eventID, bountyHunterID, bountyHunterName).estimateGas({ from: this.state.account });
    this.state.deployedSoliGity.methods.requestReview(eventID, bountyHunterID, bountyHunterName).send({ from: this.state.account, gas: gasAmount })
      .once('receipt', (receipt) => {
        this.setState({ loading: false });
      })
  }

  approvePR = async (eventID) => {
    // let price = 2; // FIXME: ??
    let price = window.web3.utils.toWei("2", 'Ether')
    console.log(price);
    this.setState({ loading: true });
    const gasAmount = await this.state.deployedSoliGity.methods.approvePR(eventID).estimateGas({ from: this.state.account, value: price });
    this.state.deployedSoliGity.methods.approvePR(eventID).send({ from: this.state.account, gas: gasAmount, value: price })
      .once('receipt', (receipt) => {
        this.setState({ loading: false });
      })
  }

  rejectPR = async (eventID) => {
    this.setState({ loading: true });
    const gasAmount = await this.state.deployedSoliGity.methods.rejectPR(eventID).estimateGas({ from: this.state.account });
    this.state.deployedSoliGity.methods.rejectPR(eventID).send({ from: this.state.account, gas: gasAmount })
      .once('receipt', (receipt) => {
        this.setState({ loading: false });
      })
  }

  render() {
    return (
      <div className="App">
        <Addressbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <test>
              {this.state.loading
                ?
                <div><p className="text-center">Loading ...</p></div>
                :
                <Test rewardEvents={this.state.rewardEvents}
                  createIssue={this.createIssue}
                  buyItem={this.buyItem}
                />}
            </test>
          </div>
        </div>
        <Router history={history}>
          <Route path="/" exact component={HomePage} />
          <Route path="/signup" exact component={SignUpPage} />
          <Route
            path="/settings"
            component={props => (
              <RequireAuth {...props} Component={SettingsPage} />
            )}
          />
          <Route
            path="/repos"
            exact
            component={props => <RequireAuth {...props} Component={ReposPage} />}
          />
          <Route
            path="/participated"
            exact
            render={props => < ParticipatedPage {...props}
              createIssue={this.createIssue}
              requestReview={this.requestReview}
              approvePR={this.approvePR}
              rejectPR={this.rejectPR} />}
          />
        </Router>
      </div >
    );
  }
}

export default App;