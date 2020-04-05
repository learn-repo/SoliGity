import { Component, default as React } from "react";
import Jumbotron from "react-bootstrap/Jumbotron";
import Pagination from "react-bootstrap/Pagination";
import { Link } from "react-router-dom";
import Web3 from 'web3';
import SoliGity from './abis/SoliGity';
import Footer from "./Footer";
import LoggedInTopBar from "./LoggedInTopBar";
import { repos } from "./requests";

class ReposPage extends Component {
    state = {
        initialized: false,
        repositories: [],
        page: 1,
        totalPages: 1,
        loading: true,
        balance: 0
    }

    getRepos = async page => {
        const response = await repos(page);
        this.setState({ repositories: response.data.data })
        this.setState({ totalPages: Math.ceil(response.data.size / response.data.pagelen) });
    };

    async componentDidMount() {
        await this.getWeb3Provider();
        await this.connectToBlockchain();
        await this.getRepos(1);
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
            let balance = await web3.eth.getBalance(accounts[0]); //Will give value in.
            balance = web3.utils.fromWei(balance);
            balance = Number(balance).toFixed(2);
            this.setState({ balance: balance });
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
                        <h1 class="display-4">My Repositories</h1>
                        <p class="lead"></p>
                        <hr class="my-4"></hr>
                    </div>
                    {this.state.repositories.map((r, i) => {
                        return (
                            <Jumbotron style={{ paddingTop: "30px", paddingBottom: "30px" }} >
                                <h1>{r.name}</h1>
                                <p>{r.description ? r.description : "No Description."}</p>
                                <Link className="btn btn-success" onClick={async (event) => {
                                    try {
                                        const [owner, repo] = r.full_name.split("/");
                                        const description = r.description || "No Description";
                                        console.log(r);
                                        const url = r.html_url;
                                        event.preventDefault();
                                        this.setState({ loading: true });
                                        const gasAmount = await this.state.deployedSoliGity.methods
                                            .createProject(owner, repo, description, url)
                                            .estimateGas({ from: this.state.account });
                                        this.state.deployedSoliGity.methods
                                            .createProject(owner, repo, description, url)
                                            .send({ from: this.state.account, gas: gasAmount })
                                            .once('receipt', async (receipt) => {
                                                this.setState({ loading: false });
                                            })
                                    } catch (ex) {
                                        alert("Fail to participate this project!");
                                        this.setState({ loading: false });
                                    }
                                }}>
                                    Participate
                                </Link>
                            </Jumbotron>
                        );
                    })}
                    <br />

                    <Pagination style={{ width: "90vw", margin: "0 auto" }}>
                        <Pagination.First onClick={() => this.getRepos(1)} />
                        <Pagination.Prev
                            onClick={() => {
                                let p = this.state.page - 1;
                                this.getRepos(p);
                                this.setState({ page: p });
                            }}
                        />
                        <Pagination.Next
                            onClick={() => {
                                let p = this.state.page + 1;
                                this.getRepos(p);
                                this.setState({ page: p });
                            }}
                        />
                        <Pagination.Last onClick={() => this.getRepos(this.state.totalPages)} />
                    </Pagination>
                    <br />
                </div>
                <Footer />
            </>
        )
    }
}
export default ReposPage;