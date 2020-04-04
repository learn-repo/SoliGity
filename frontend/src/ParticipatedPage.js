import { Component, default as React } from "react";
import Button from "react-bootstrap/Button";
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Jumbotron from "react-bootstrap/Jumbotron";
import { Link } from "react-router-dom";
import Web3 from 'web3';
import SoliGity from './abis/SoliGity';
import LoggedInTopBar from "./LoggedInTopBar";
import "./ParticipatedPage.css";


class ParticipatedPage extends Component {
    state = {
        initialized: false,
        loading: true,
        projectNumber: 0,
        participated: []
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
                const event = await deployedSoliGity.methods.Projects(i).call();
                this.setState({
                    participated: [...this.state.participated, event]
                });
            }
            this.setState({ loading: false })
        } else {
            window.alert('SoliGity contract is not found in your blockchain.')
        }
    }

    render() {
        return (
            <>
                <LoggedInTopBar />
                <div className="page">
                    <div>
                        <h1 class="display-4">Participated Repositories</h1>
                        <p class="lead">These are the projects you are currently working on.</p>
                        <hr class="my-4"></hr>
                    </div>
                    {this.state.participated.map(rc => {
                        return (
                            <Jumbotron>
                                <h1>{rc.name}</h1>
                                <p> {rc.description}</p>
                                <p>
                                    <Link className="btn btn-primary" to={`/repo?repo=${rc.name}&?owner=${rc.owner}`}>View Project</Link>
                                    <Button variant="success" href={rc.url}>Link to Repository</Button>
                                </p>
                            </Jumbotron>
                            
                        );
                    })}
                </div>

            
            </>
        );
    }
}

export default ParticipatedPage;