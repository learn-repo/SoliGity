import React, { Component } from 'react';
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

class Addressbar extends Component {
    render() {
        return (
            <Navbar bg="light" variant="light">
            <Navbar.Collapse id="basic-navbar-nav">
            </Navbar.Collapse>
                <Nav className="topnav-right">
                    <Navbar.Text>
                        <medium className="text-black"><span id="account">{"Your Address: " + this.props.account}</span></medium>
                    </Navbar.Text>
                </Nav>
            </Navbar>
            // <nav className="navbar fixed-top flex-md-nowrap p-0 shadow">
            //     <ul className="navbar-nav px-12">
            //         <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
            //             <small className="text-black"><span id="account">{"Your Address: " + this.props.account}</span></small>
            //         </li>
            //     </ul>
            // </nav>
        );
    }
}

export default Addressbar;
