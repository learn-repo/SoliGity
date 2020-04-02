import { Formik } from "formik";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Navbar from "react-bootstrap/Navbar";
import { Link, Redirect } from "react-router-dom";
import * as yup from "yup";
import Logo from "./assets/logo.png";
import "./HomePage.css";
import { logIn } from "./requests";

const schema = yup.object({
    username: yup.string().required("Username is required"),
    password: yup.string().required("Password is required")
});

function HomePage() {
    const [redirect, setRedirect] = useState(false);
    const handleSubmit = async evt => {
        const isValid = await schema.validate(evt);
        if (!isValid) {
            return;
        }
        try {
            const response = await logIn(evt);
            localStorage.setItem("token", response.data.token);
            setRedirect(true);
        } catch (ex) {
            alert("Invalid username or password");
        }
    };
    if (redirect) {
        return <Redirect to="/repos" />;
    }
    return (
        <>
            <Navbar bg="light" expand="lg" variant="light">
                <Navbar.Brand href="#home">
                    <img
                        src={Logo}
                        width="174.2"
                        height="100"
                        className="d-inline-block align-top"
                        alt="R
                    eact Bootstrap logo"
                    />
                </Navbar.Brand>
            </Navbar>
            <div className="page">
                <h1 className="text-center">Log In</h1>
                <Formik validationSchema={schema} onSubmit={handleSubmit}>
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
                                        <Form.Label>Username</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="username"
                                            placeholder="Username"
                                            value={values.username || ""}
                                            onChange={handleChange}
                                            isInvalid={touched.username && errors.username}
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
                                <Button type="submit" style={{ marginRight: "10px" }}>
                                    Log In
              </Button>
                                <Link
                                    className="btn btn-primary"
                                    to="/signup"
                                    style={{ marginRight: "10px", color: "white" }}
                                >
                                    Sign Up
              </Link>
                            </Form>
                        )}
                </Formik>
            </div>
        </>
    );
}
export default HomePage;