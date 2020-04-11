import { Component, default as React } from "react";
import Button from "react-bootstrap/Button";
import Jumbotron from "react-bootstrap/Jumbotron";
import { Link } from "react-router-dom";
import Web3 from 'web3';
import SoliGity from './abis/SoliGity';
import Footer from "./Footer";
import LoggedInTopBar from "./LoggedInTopBar";
import "./ParticipatedPage.css";


class ParticipatedPage extends Component {
    state = {
        initialized: false,
        loading: true,
        projectNumber: 0,
        participated: [],
        balance: 0
    }

    async componentDidMount() {
        await this.getWeb3Provider();
        await this.connectToBlockchain();
        this.setState({ initialized: true });
    }

    async getWeb3Provider() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
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
            const projectNumber = await deployedSoliGity.methods.projectNumber().call();
            this.setState({ projectNumber });

            for (var i = 1; i <= projectNumber; i++) {
                const event = await deployedSoliGity.methods.projects(i).call();
                this.setState({
                    participated: [...this.state.participated, event]
                });
            }
            let balance = await web3.eth.getBalance(accounts[0]); //Will give value in.
            balance = web3.utils.fromWei(balance);
            balance = Number(balance).toFixed(2);
            this.setState({ balance: balance });
            this.setState({ loading: false })
        } else {
            window.alert('SoliGity contract is not found in your blockchain.')
        }
    }

    render() {
        return (
            <>
                <LoggedInTopBar account={this.state.account} balance={this.state.balance} />
                <div className="page">
                    <div>
                        <h1 class="display-5">Project Catalog</h1>
                        <p class="lead"></p>
                        <hr class="my-4"></hr>
                    </div>
                    {this.state.participated.map(rc => {
                        return (
                            <Jumbotron className="customShadow" style={{ paddingTop: "25px", paddingBottom: "25px", display:'flex', flexDirection: 'row', justifyContent:'space-between', alignItems:'center'}} >
                                <div>
                                    <h2>{rc.name}</h2>
                                    <p>{`Owner: ${rc.owner}`}</p>
                                    <p> {rc.description}</p>
                                </div>
                                <div style={{display:'flex', flexDirection: 'column', justifyContent:'space-between'}}>
                                    <Link className="btn btn-primary float-right" to={`/repo?repo=${rc.name}&?owner=${rc.owner}`}>View Project</Link>
                                    <Button variant="success float-right" href={rc.url}>Go to Repository</Button>
                                </div>
                            </Jumbotron>

                        );
                    })}
                </div>
                <Footer />
            </>
        );
    }
}

export default ParticipatedPage;