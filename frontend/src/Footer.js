import React, { useState } from "react";
import Logo from "./assets/logo.png";
import { Redirect, withRouter } from "react-router-dom";
import "./Footer.css";

function Footer({ location }) {
    const [redirect, setRedirect] = useState(false);
    if (redirect) {
        return <Redirect to="/" />;
    }
    return (
        <div class="mt-5 pt-5 pb-5 footer">
        <div class="container">
        <div class="row">
            <div class="col-lg-5 col-xs-5 about-company">
            <h3>SoliGity</h3>
            <h5 class="pr-5 text-blcak">Post, Contribute, Award.</h5>
            </div>
            <div class="col-lg-3 col-xs-12 links">
            <h3 class="mt-lg-0 mt-sm-3">Links</h3>
                <ul class="m-0 p-0">
                <a href="https://github.com/SoliGity">GitHub Page</a><br/>
                <a href="https://solidity.readthedocs.io/">Solidity</a><br/>
                <a href="https://web3js.readthedocs.io/">web3.js</a><br/>
                </ul>
            </div>
            <div class="col-lg-4 col-xs-12 location">
            <h3 class="mt-lg-0 mt-sm-4">Contact</h3>
                <p>Electrical and Computer Engineering<br />
                    The University of British Columbia<br />
                    5500 - 2332 Main Mall<br />
                    Vancouver BC V6T 1Z4<br />
                    Canada</p>  
            </div>
        </div>
        <div class="row mt-5">
            <div class="col copyright">
            <p class=""><small class="text-black">© 2020 SoliGity All Rights Reserved.</small></p>
            </div>
        </div>
        </div>
        </div>
    );
}

export default Footer;
