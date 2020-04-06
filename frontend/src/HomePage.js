import { Formik } from "formik";
import React, { useState } from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { Redirect } from "react-router-dom";
import * as yup from "yup";
import Icon from "./assets/icon.png";
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
        return <Redirect to="/participated" />;
    }
    return (
        <>

            <div className="limiter">
                <div className="container-login100">
                    <div className="wrap-login100">
                        {/* <form className="login100-form validate-form"> */}

                        <span className="login100-form-title p-b-26">
                            Welcome
                            </span>
                        <span className="login100-form-title p-b-48">
                            <img
                                src={Icon}
                                width="83"
                                // height="100"
                                className="d-inline-block align-top"
                                alt="React Bootstrap logo"
                            />
                        </span>


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

                                        <div className="container-login100-form-btn">
                                            <div className="wrap-login100-form-btn">
                                                <div className="login100-form-bgbtn"></div>
                                                <button type="submit" className="login100-form-btn">
                                                    Login
                                        </button>
                                            </div>
                                        </div>


                                        <div className="text-center p-t-115">
                                            <span className="txt1">
                                                Don’t have an account?
                                    </span>

                                            <a className="txt2" href="/signup">
                                                Sign Up
                                    </a>

                                        </div>

                                    </Form>
                                )}
                        </Formik>
                        {/* </form> */}
                    </div>
                </div>
            </div>

        </>
    );
}
export default HomePage;