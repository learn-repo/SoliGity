import { Formik } from "formik";
import { Component, default as React } from "react";
import Button from "react-bootstrap/Button";
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Accordion from "react-bootstrap/Accordion";
import Form from "react-bootstrap/Form";
import { withRouter } from "react-router-dom";
import Web3 from 'web3';
import * as yup from "yup";
import SoliGity from './abis/SoliGity';
import LoggedInTopBar from "./LoggedInTopBar";
import { approvePullRequest, rejectPullRequest, createIssue, createPullRequest, currentUser, forkRepo, closeIssue } from "./requests";
import "./RepoPage.css";

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
        loading: true,
        balance: 0
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

            const projectNumber = await deployedSoliGity.methods.projectNumber().call();
            let self = null;
            for (var i = 1; i <= projectNumber; i++) {
                const event = await deployedSoliGity.methods.projects(i).call();
                if (event.name === name && event.owner === owner) {
                    self = event;
                }
            }
            this.setState({ info: self });
            this.setState({ rewardEvents: [] });

            let temp = [];
            for (var i = 1; i <= eventNumber; i++) {
                const event = await deployedSoliGity.methods.rewardEvents(i).call();
                temp = [...temp, event];
            }
            temp = temp.filter((r) => {
                return r.projectId === self.id.toString();
            }).sort((a, b) => {
                return a.status - b.status;
            })
            this.setState({ rewardEvents: temp });

            let balance = await web3.eth.getBalance(accounts[0]); //Will give value in.
            balance = web3.utils.fromWei(balance);
            balance = Number(balance).toFixed(2);
            this.setState({ balance: balance });

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
            const projectId = Number(this.state.info.id);
            let user = await currentUser();
            let data = {
                owner: this.state.info.owner,
                repo: this.state.info.name,
                title: title,
                body: description
            }
            const response = await createIssue(data);
            let issue = Number(response.data.data.number);
            const sponsorName = user.data.gitHubUsername;
            if (isNaN(bountyAmount) || isNaN(projectId) || isNaN(issue)) {
                throw new Error("invalid");
            }
            bountyAmount = window.web3.utils.toWei(bountyAmount.toString(), 'Ether');
            const gasAmount = await this.state.deployedSoliGity.methods
                .createIssue(projectId, title, sponsorName, bountyAmount, issue)
                .estimateGas({ from: this.state.account });
            this.state.deployedSoliGity.methods
                .createIssue(projectId, title, sponsorName, bountyAmount, issue)
                .send({ from: this.state.account, gas: gasAmount })
                .once('receipt', async (receipt) => {
                    await this.componentDidMount();
                    this.setState({ loading: false });
                })
        } catch (ex) {
            console.log(ex);
            alert("Fail to create Issue!");
            this.setState({ loading: false });
        }
    };

    render() {

        return (
            <>
                <LoggedInTopBar account={this.state.account} balance={this.state.balance} />

                {this.state.info ?
                    <div className="page">
                        <div>
                            <h1 class="display-4">{this.state.info.name}
                                <p class="lead"></p>
                                <Button variant="success" href={this.state.info.url}>Go to Repository</Button>
                                <Button variant="success"
                                    onClick={async (event) => {
                                        try {
                                            event.preventDefault();
                                            let data = {
                                                owner: this.state.info.owner,
                                                repo: this.state.info.name,
                                            }
                                            const response = await forkRepo(data);
                                            alert(`You have forked Repository ${this.state.info.name} successfully!`);
                                        } catch (ex) {
                                            alert(`Fail to Fork Repository ${this.state.info.name}!`);
                                        }
                                    }}>Fork</Button>
                                <hr></hr>
                            </h1>
                        </div>

                        <h3 class="display-5">
                            Create a new issue using the form below:
                        </h3>
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
                                            <Form.Label class="form-label-text">Title</Form.Label>
                                            <Form.Control type='text' name='title' value={values.title || ""} onChange={handleChange}
                                                placeholder="Enter Title" />
                                        </Form.Group>

                                        <Form.Group controlId="Description">
                                            <Form.Label class="form-label-text">Description</Form.Label>
                                            <Form.Control type='text' name='description' value={values.description || ""} onChange={handleChange}

                                                placeholder="Enter Description" />
                                        </Form.Group>

                                        <Form.Group controlId="BountyAmount">
                                            <Form.Label class="form-label-text">Bounty Amount</Form.Label>
                                            <Form.Control type='text' name='bountyAmount' value={values.bountyAmount || ''} onChange={handleChange}
                                                placeholder="Enter bounty Amount" />
                                        </Form.Group>

                                        <Button variant="success" type="submit">Create Issue</Button>
                                    </Form>
                                )}
                        </Formik>

                        <h3 class="display-5-with-top-margin" >
                            Existing Issues:
                        </h3>
                        {this.state.loading
                            ?
                            <div><p className="text-center">Loading ...</p></div>
                            :
                            <test>
                                {this.state.rewardEvents.map(rc => {
                                    return (
                                        <Card>
                                            <Card.Body>
                                                <Card.Title class="card-issue-title">{rc.title}</Card.Title>
                                                <Card.Subtitle class="card-issue-subtitle">Bounty Amount - {window.web3.utils.fromWei(rc.bountyAmount.toString(), 'Ether')} ETH</Card.Subtitle>
                                                <Card.Text class="card-issue-text">Sponsor Name: {rc.sponsorName}</Card.Text>
                                                <Card.Text class="card-issue-text">Status:&nbsp;
                                                     {(() => {
                                                        switch (rc.status) {
                                                            case "0":
                                                                return <Badge variant="primary">Accepting Contribution</Badge>;
                                                            case "1":
                                                                return < Badge variant="primary" >Pending Approval</Badge>;
                                                            case "2":
                                                                return <Badge variant="success">Done</Badge>;
                                                        }
                                                    })()}
                                                </Card.Text>
                                                <Accordion defaultActiveKey="0">
                                                    <Accordion.Toggle as={Button} variant="link" eventKey="1">
                                                        <p class="expand-customized">View Extra Information</p>
                                                    </Accordion.Toggle>
                                                    <Accordion.Collapse eventKey="1">
                                                        <ul>
                                                            <Card.Text>Project Id: {rc.projectId}</Card.Text>
                                                            <Card.Text>Issue #: {rc.issue}</Card.Text>
                                                            <Card.Text>Event Id: {rc.eventId}</Card.Text>
                                                            <Card.Text>Sponsor Address: {rc.sponsorAddress}</Card.Text>
                                                            <Card.Text>Bounty Hunter Name: {rc.bountyHunterName}</Card.Text>
                                                            <Card.Text>Bounty Hunter Address: {rc.bountyHunterAddress}</Card.Text>
                                                            <Card.Text>Pull Reqest #: {rc.pullRequest}</Card.Text>
                                                        </ul>
                                                    </Accordion.Collapse>
                                                </Accordion>

                                                <ButtonToolbar>
                                                    <Button variant="success"
                                                        disabled={rc.status !== "0"}

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
                                                                let eventId = rc.eventId;
                                                                let PR = response.data.data.number;
                                                                this.setState({ loading: true });
                                                                const gasAmount = await this.state.deployedSoliGity.methods
                                                                    .requestReview(eventId, bountyHunterName, PR)
                                                                    .estimateGas({ from: this.state.account });
                                                                this.state.deployedSoliGity.methods
                                                                    .requestReview(eventId, bountyHunterName, PR)
                                                                    .send({ from: this.state.account, gas: gasAmount })
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
                                                        disabled={!(this.state.account === rc.sponsorAddress && rc.status === "1")}
                                                        onClick={async (event) => {
                                                            event.preventDefault();
                                                            try {
                                                                let eventId = rc.eventId;
                                                                let price = rc.bountyAmount;
                                                                this.setState({ loading: true });
                                                                const gasAmount = await this.state.deployedSoliGity.methods
                                                                    .approvePullRequest(eventId)
                                                                    .estimateGas({ from: this.state.account, value: price });
                                                                this.state.deployedSoliGity.methods
                                                                    .approvePullRequest(eventId)
                                                                    .send({ from: this.state.account, gas: gasAmount, value: price })
                                                                    .once('receipt', async (receipt) => {
                                                                        let data = {
                                                                            owner: this.state.info.owner,
                                                                            repo: this.state.info.name,
                                                                            pull_number: rc.pullRequest
                                                                        }
                                                                        await approvePullRequest(data);
                                                                        data = {
                                                                            owner: this.state.info.owner,
                                                                            repo: this.state.info.name,
                                                                            issue_number: rc.issue
                                                                        }
                                                                        await closeIssue(data);
                                                                        await this.componentDidMount();
                                                                        this.setState({ loading: false });
                                                                    })
                                                            } catch (ex) {
                                                                alert("Fail to approve Pull & Request!");
                                                                this.setState({ loading: false });
                                                            }
                                                        }}>Approve Pull Request</Button>

                                                    <Button variant="success"
                                                        disabled={!(this.state.account === rc.sponsorAddress && rc.status === "1")}
                                                        onClick={async (event) => {
                                                            event.preventDefault();
                                                            try {
                                                                let eventId = rc.eventId;
                                                                this.setState({ loading: true });
                                                                const gasAmount = await this.state.deployedSoliGity.methods
                                                                    .rejectPullRequest(eventId)
                                                                    .estimateGas({ from: this.state.account });
                                                                this.state.deployedSoliGity.methods
                                                                    .rejectPullRequest(eventId)
                                                                    .send({ from: this.state.account, gas: gasAmount })
                                                                    .once('receipt', async (receipt) => {
                                                                        let data = {
                                                                            owner: this.state.info.owner,
                                                                            repo: this.state.info.name,
                                                                            pull_number: rc.pullRequest
                                                                        }
                                                                        await rejectPullRequest(data);
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