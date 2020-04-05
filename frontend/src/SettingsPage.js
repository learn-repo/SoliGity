import { Formik } from "formik";
import { Component, default as React } from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Web3 from 'web3';
import * as yup from "yup";
import SoliGity from './abis/SoliGity';
import Footer from "./Footer";
import LoggedInTopBar from "./LoggedInTopBar";
import { changePassword, currentUser, setGithubCredentials } from "./requests";

const userFormSchema = yup.object({
    username: yup.string().required("Username is required"),
    password: yup.string().required("Password is required")
});

const githubFormSchema = yup.object({
    gitHubUsername: yup.string().required("Username is required"),
    gitHubPassword: yup.string().required("Password is required")
});

class SettingsPage extends Component {

    state = {
        initialized: false,
        balance: 0,
        user: {},
        githubUser: {},
    }

    async componentDidMount() {
        await this.getWeb3Provider();
        await this.connectToBlockchain();
        await this.getCurrentUser();
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

    // const[initialized, setInitialized] = useState(false);
    // const[user, setUser] = useState({ });
    // const[githubUser, setGithubUser] = useState({ });
    handleUserSubmit = async evt => {
        const isValid = await userFormSchema.validate(evt);
        if (!isValid) {
            return;
        }
        try {
            await changePassword(evt);
            alert("Password changed");
        } catch (error) {
            alert("Password change failed");
        }
    };

    handlegithubSubmit = async evt => {
        const isValid = await githubFormSchema.validate(evt);
        if (!isValid) {
            return;
        }
        try {
            await setGithubCredentials(evt);
            alert("github credentials changed");
        } catch (error) {
            alert("github credentials change failed");
        }
    };

    getCurrentUser = async () => {
        const response = await currentUser();
        const { username, gitHubUsername } = response.data;
        this.setState({ user: { username: username } });
        this.setState({ githubUser: { gitHubUsername: gitHubUsername } });
    };


    render() {
        return (
            <>
                <LoggedInTopBar account={this.state.account} balance={this.state.balance} />

                <div className="limiter">
                    <div className="container-login100">
                        <div className="wrap-login100">
                            <div>
                                <h1 class="display-4">Settings</h1>
                                <p class="lead"></p>
                                <hr class="my-4"></hr>
                            </div>
                            <h2>User Settings</h2>
                            <Formik
                                validationSchema={userFormSchema}
                                onSubmit={this.handleUserSubmit}
                                initialValues={this.state.user}
                                enableReinitialize={true}
                            >
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
                                            <Form.Row>
                                                <Form.Group as={Col} md="12" controlId="username">
                                                    <Form.Label >Username</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="username"
                                                        placeholder="Username"
                                                        value={values.username || ""}
                                                        onChange={handleChange}
                                                        isInvalid={touched.username && errors.username}
                                                        disabled
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.username}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                                <Form.Group as={Col} md="12" controlId="password">
                                                    <Form.Label>Password</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        name="password"
                                                        placeholder="Password"
                                                        value={values.password || ""}
                                                        onChange={handleChange}
                                                        isInvalid={touched.password && errors.password}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.password}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Form.Row>
                                            <div className="container-login100-form-btn">
                                                <div className="wrap-login100-form-btn">
                                                    <div className="login100-form-bgbtn"></div>
                                                    <button type="submit" className="login100-form-btn">
                                                        Save
                                        </button>
                                                </div>
                                            </div>
                                        </Form>
                                    )}
                            </Formik>
                            <br /><br /><br />
                            <h2>GitHub Settings</h2>
                            <Formik
                                validationSchema={githubFormSchema}
                                onSubmit={this.handlegithubSubmit}
                                initialValues={this.state.githubUser}
                                enableReinitialize={true}
                            >
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
                                            <Form.Row>
                                                <Form.Group as={Col} md="12" controlId="gitHubUsername">
                                                    <Form.Label>GitHub Username</Form.Label>

                                                    <Form.Control
                                                        type="text"
                                                        name="gitHubUsername"
                                                        placeholder="GitHub Username"
                                                        value={values.gitHubUsername || ""}
                                                        onChange={handleChange}
                                                        isInvalid={
                                                            touched.gitHubUsername && errors.gitHubUsername
                                                        }
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.gitHubUsername}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                                <Form.Group as={Col} md="12" controlId="gitHubPassword">
                                                    <Form.Label >Password</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        name="gitHubPassword"
                                                        placeholder="GitHub Password"
                                                        value={values.gitHubPassword || ""}
                                                        onChange={handleChange}
                                                        isInvalid={
                                                            touched.gitHubPassword && errors.gitHubPassword
                                                        }
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.gitHubPassword}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Form.Row>

                                            <div className="container-login100-form-btn">
                                                <div className="wrap-login100-form-btn">
                                                    <div className="login100-form-bgbtn"></div>
                                                    <button type="submit" className="login100-form-btn">
                                                        Save
                                        </button>
                                                </div>
                                            </div>
                                        </Form>
                                    )}
                            </Formik>
                        </div>
                    </div>
                </div>
                <Footer />
            </>

        )
    };

}
export default SettingsPage;