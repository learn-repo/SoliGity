import React, { useState } from "react";
import Navbar from "react-bootstrap/Navbar";
import "./LoggedInTopBar.css";
import Nav from "react-bootstrap/Nav";
import { withRouter, Redirect } from "react-router-dom";
import Logo from "./assets/logo.png";

function LoggedInTopBar({ location }) {
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
                            src={Logo}
                            width="174.2"
                            height="100"
                            className="d-inline-block align-top"
                            alt="R
                        eact Bootstrap logo"
                        />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">

                        <Nav className="mr-auto">
                            <Nav.Link href="/repos" active={pathname === "/repos"}>
                                Repos
                            </Nav.Link>
                            <Nav.Link href="/participated" active={pathname === "/participated"}>
                                Main
                            </Nav.Link>
                            <Nav.Link href="/settings" active={pathname === "/settings"}>
                                Settings
                            </Nav.Link>
                        </Nav>
                        <Nav className="topnav-right">
                            <Nav.Link>
                                <span
                                    onClick={() => {
                                        localStorage.clear();
                                        setRedirect(true);
                                    }}
                                >
                                    Log Out
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