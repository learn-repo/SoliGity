import { Formik } from "formik";
import { Component, default as React } from "react";
import Button from "react-bootstrap/Button";
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import { withRouter } from "react-router-dom";
import Web3 from 'web3';
import * as yup from "yup";
import SoliGity from './abis/SoliGity';
import LoggedInTopBar from "./LoggedInTopBar";
import { approvePullRequest, closePullRequest, createIssue, createPullRequest, currentUser, forkRepo } from "./requests";

const moment = require("moment");
const querystring = require("querystring");


const schema = yup.object({
    title: yup.string(),
    description: yup.string(),
    bountyAmount: yup.string(),
});

class RepoPage extends Component {
    state = {
        initialized: false,
        info: null,
        account: '',
        eventNumber: 0,
        rewardEvents: [],
        loading: true
    }

    async componentDidMount() {
        const name = querystring.decode(window.location.search)["?repo"];
        const owner = querystring.decode(window.location.search)["?owner"];
        await this.getWeb3Provider();
        await this.connectToBlockchain(name, owner);
        this.state.initialized = true;
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

    async connectToBlockchain(name, owner) {
        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        this.setState({ account: accounts[0] })
        const networkId = await web3.eth.net.getId()
        const networkData = SoliGity.networks[networkId];
        if (networkData) {
            const deployedSoliGity = new web3.eth.Contract(SoliGity.abi, networkData.address);
            this.setState({ deployedSoliGity: deployedSoliGity });
            const eventNumber = await deployedSoliGity.methods.eventNumber().call();
            this.setState({ eventNumber });

            for (var i = 1; i <= eventNumber; i++) {
                const event = await deployedSoliGity.methods.RewardEvents(i).call();
                this.setState({
                    rewardEvents: [...this.state.rewardEvents, event]
                });
            }
            const projectNumber = await deployedSoliGity.methods.projectNumber().call();

            for (var i = 1; i <= projectNumber; i++) {
                const event = await deployedSoliGity.methods.Projects(i).call();
                if (event.name === name && event.owner === owner) {
                    this.setState({ info: event });
                }
            }
            this.setState({ loading: false })
        } else {
            window.alert('SoliGity contract is not found in your blockchain.')
        }
    }

    handleSubmit = async (evt) => {
        const isValid = await schema.validate(evt);
        if (!isValid) {
            return;
        }
        try {
            this.setState({ loading: true });

            const title = evt.title;
            const description = evt.description;
            let bountyAmount = Number(evt.bountyAmount);
            const projectID = Number(this.state.info.ProjectID);
            let user = await currentUser();
            const sponsorName = user.data.gitHubUsername;
            if (isNaN(bountyAmount) || isNaN(projectID)) {
                throw new Error("invalid");
            }
            bountyAmount = window.web3.utils.toWei(bountyAmount.toString(), 'Ether');
            const gasAmount = await this.state.deployedSoliGity.methods.createIssue(projectID, title, sponsorName, bountyAmount).estimateGas({ from: this.state.account });
            this.state.deployedSoliGity.methods.createIssue(projectID, title, sponsorName, bountyAmount).send({ from: this.state.account, gas: gasAmount })
                .once('receipt', async (receipt) => {
                    let data = {
                        owner: this.state.info.owner,
                        repo: this.state.info.name,
                        title: title,
                        body: description
                    }
                    const response = await createIssue(data);
                    await this.componentDidMount();
                    this.setState({ loading: false });
                })
        } catch (ex) {
            alert("Fail to create Issue!");
            this.setState({ loading: false });
        }
    };

    render() {

        return (
            <>
                <LoggedInTopBar />

                {this.state.info ?
                    <div className="page">
                        <h1 className="text-center">{this.state.info.name}</h1>

                        <Button variant="success" href={this.state.info.url}>Repo Link</Button>
                        <Button variant="success"
                            onClick={async (event) => {
                                event.preventDefault();
                                let data = {
                                    owner: this.state.info.owner,
                                    repo: this.state.info.name,
                                }
                                const response = await forkRepo(data);
                                alert("ok");
                            }}>Fork</Button>
                        <Formik validationSchema={schema} onSubmit={this.handleSubmit}>
                            {({
                                handleSubmit,
                                handleChange,
                                handleBlur,
                                values,
                                touched,
                                isInvalid,
                                errors
                            }) => (
                                    <Form noValidate onSubmit={handleSubmit}>
                                        <Form.Group controlId="Title">
                                            <Form.Label>Title</Form.Label>
                                            <Form.Control type='text' name='title' value={values.title || ""} onChange={handleChange}
                                                placeholder="Enter Title" />
                                        </Form.Group>

                                        <Form.Group controlId="Description">
                                            <Form.Label>Description</Form.Label>
                                            <Form.Control type='text' name='description' value={values.description || ""} onChange={handleChange}

                                                placeholder="Enter Description" />
                                        </Form.Group>

                                        <Form.Group controlId="BountyAmount">
                                            <Form.Label>Bounty Amount</Form.Label>
                                            <Form.Control type='text' name='bountyAmount' value={values.bountyAmount || ''} onChange={handleChange}
                                                placeholder="Enter bounty Amount" />
                                        </Form.Group>

                                        <Button variant="success" type="submit">Create Issue</Button>
                                    </Form>
                                )}
                        </Formik>


                        {this.state.loading
                            ?
                            <div><p className="text-center">Loading ...</p></div>
                            :
                            <test>
                                {this.state.rewardEvents.filter((r) => {
                                    return r.projectID === this.state.info.ProjectID.toString();
                                }).map(rc => {
                                    return (
                                        <Card style={{ width: "90vw", margin: "0 auto" }}>
                                            <Card.Body>
                                                <Card.Title>{rc.title}</Card.Title>
                                                <Card.Text>eventID: {rc.eventID}</Card.Text>
                                                <Card.Text>projectID: {rc.projectID}</Card.Text>
                                                <Card.Text>sponsorName: {rc.sponsorName}</Card.Text>
                                                <Card.Text>sponsorAddress: {rc.sponsorAddress}</Card.Text>
                                                <Card.Text>bountyHunterName: {rc.bountyHunterName}</Card.Text>
                                                <Card.Text>bountyHunterAddress: {rc.bountyHunterAddress}</Card.Text>
                                                <Card.Text>PR #: {rc.PR}</Card.Text>
                                                <Card.Text>bountyAmount: {window.web3.utils.fromWei(rc.bountyAmount.toString(), 'Ether')} ETH</Card.Text>
                                                <Card.Text>status: {rc.status}</Card.Text>

                                                <ButtonToolbar>

                                                    <Button variant="success"
                                                        onClick={async (event) => {
                                                            event.preventDefault();
                                                            try {
                                                                let user = await currentUser();
                                                                let bountyHunterName = user.data.gitHubUsername;

                                                                let data = {
                                                                    owner: this.state.info.owner,
                                                                    repo: this.state.info.name,
                                                                    title: `soliGity Pull & Request ${rc.title} from ${bountyHunterName}`,
                                                                    head: `${user.data.gitHubUsername}:master`,
                                                                    base: "master"
                                                                }

                                                                const response = await createPullRequest(data);
                                                                let eventID = rc.eventID;
                                                                let PR = response.data.data.number;
                                                                this.setState({ loading: true });
                                                                const gasAmount = await this.state.deployedSoliGity.methods.requestReview(eventID, bountyHunterName, PR).estimateGas({ from: this.state.account });
                                                                this.state.deployedSoliGity.methods.requestReview(eventID, bountyHunterName, PR).send({ from: this.state.account, gas: gasAmount })
                                                                    .once('receipt', async (receipt) => {
                                                                        await this.componentDidMount();
                                                                        this.setState({ loading: false });
                                                                    })

                                                            } catch (ex) {
                                                                alert("Fail to create Pull & Request!");
                                                                this.setState({ loading: false });
                                                            }
                                                        }}>Request Review</Button>

                                                    <Button variant="success"
                                                        onClick={async (event) => {
                                                            event.preventDefault();
                                                            try {
                                                                let eventID = rc.eventID;
                                                                let price = rc.bountyAmount;
                                                                this.setState({ loading: true });
                                                                const gasAmount = await this.state.deployedSoliGity.methods.approvePR(eventID).estimateGas({ from: this.state.account, value: price });
                                                                this.state.deployedSoliGity.methods.approvePR(eventID).send({ from: this.state.account, gas: gasAmount, value: price })
                                                                    .once('receipt', async (receipt) => {
                                                                        let data = {
                                                                            owner: this.state.info.owner,
                                                                            repo: this.state.info.name,
                                                                            pull_number: rc.PR
                                                                        }
                                                                        await approvePullRequest(data);
                                                                        await this.componentDidMount();
                                                                        this.setState({ loading: false });
                                                                    })
                                                            } catch (ex) {
                                                                alert("Fail to approve Pull & Request!");
                                                                this.setState({ loading: false });
                                                            }
                                                        }}>Approve Pull Request</Button>
                                                    <Button variant="success"
                                                        onClick={async (event) => {
                                                            event.preventDefault();
                                                            try {
                                                                let eventID = rc.eventID;
                                                                this.setState({ loading: true });
                                                                const gasAmount = await this.state.deployedSoliGity.methods.rejectPR(eventID).estimateGas({ from: this.state.account });
                                                                this.state.deployedSoliGity.methods.rejectPR(eventID).send({ from: this.state.account, gas: gasAmount })
                                                                    .once('receipt', async (receipt) => {
                                                                        let data = {
                                                                            owner: this.state.info.owner,
                                                                            repo: this.state.info.name,
                                                                            pull_number: rc.PR
                                                                        }
                                                                        await closePullRequest(data);
                                                                        await this.componentDidMount();
                                                                        this.setState({ loading: false });
                                                                    })
                                                            } catch (ex) {
                                                                alert("Fail to reject Pull & Request!");
                                                                this.setState({ loading: false });
                                                            }
                                                        }}>Reject Pull Request</Button>
                                                </ButtonToolbar>
                                            </Card.Body>
                                        </Card>
                                    );
                                })}
                            </test>
                        }
                    </div>
                    :
                    <div><p className="text-center">Loading ...</p></div>
                }
            </>
        );
    }
}

export default withRouter(RepoPage);