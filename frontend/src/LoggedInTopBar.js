import React, { useState, Component } from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Redirect, withRouter } from "react-router-dom";
import Logo from "./assets/logo.png";
import Icon from "./assets/icon.png";
import "./LoggedInTopBar.css";

function LoggedInTopBar({ location, account }) {
    const [redirect, setRedirect] = useState(false);
    const { pathname } = location;
    const isLoggedIn = () => !!localStorage.getItem("token");
    if (redirect) {
        return <Redirect to="/" />;
    }

    return (
        <div>
            {isLoggedIn() ? (
                <Navbar bg="light" expand="lg" variant="light">
                    <Navbar.Brand href="/participated">
                        <img
                            src={Icon}
                            width="83"
                            // height="100"
                            className="d-inline-block align-top"
                            alt="React Bootstrap logo"
                        />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">

                        <Nav className="mr-auto">
                            <Nav.Link href="/participated" active={pathname === "/participated"}>
                                Home
                            </Nav.Link>
                            <Nav.Link href="/repos" active={pathname === "/repos"}>
                                My Repositories
                            </Nav.Link>
                            <Nav.Link href="/settings" active={pathname === "/settings"}>
                                Settings
                            </Nav.Link>
                        </Nav>

                        {/* <Nav className="topnav-right">
                            <Navbar.Text >
                                <span id="account">{"Your Address: " + account}</span>
                            </Navbar.Text>
                        </Nav> */}
                        {/* 
                        <Nav className='topnav-right hover-nav'>

                        </Nav> */}

                        <Nav className="topnav-right">
                            <Navbar.Text className="hover-nav">
                                <span class='hover-nav-off'>Your Address</span>
                                <span class='hover-nav-on'>{account}</span>
                            </Navbar.Text>
                            <Nav.Link>
                                <span
                                    onClick={() => {
                                        localStorage.clear();
                                        setRedirect(true);
                                    }}                                >Log Out
                                </span>
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
            ) : null}
        </div>
    );
}
export default withRouter(LoggedInTopBar);