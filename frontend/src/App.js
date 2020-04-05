import { createBrowserHistory as createHistory } from "history";
import React, { Component } from "react";
import { Route, Router } from "react-router-dom";
import Web3 from 'web3';
import SoliGity from './abis/SoliGity';
import Addressbar from './Addressbar';
import "./App.css";
import HomePage from "./HomePage";
import ParticipatedPage from "./ParticipatedPage";
import RepoPage from "./RepoPage";
import ReposPage from "./ReposPage";
import RequireAuth from "./RequireAuth";
import SettingsPage from "./SettingsPage";
import SignUpPage from "./SignUpPage";


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
        const event = await deployedSoliGity.methods.rewardEvents(i).call();
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

  render() {
    return (
      <div className="App">
        {/* <Addressbar account={this.state.account} /> */}
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
            component={props => <RequireAuth {...props} Component={ParticipatedPage} />}
          />

          <Route
            path="/repo"
            exact
            component={props => <RequireAuth {...props} Component={RepoPage} />}
          />
        </Router>
      </div >
    );
  }
}

export default App;