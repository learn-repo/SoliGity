import { Formik } from "formik";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Navbar from "react-bootstrap/Navbar";
import { Redirect } from "react-router-dom";
import * as yup from "yup";
import Logo from "./assets/logo.png";
import { signUp } from "./requests";
import Icon from "./assets/icon.png";


const schema = yup.object({
    username: yup.string().required("Username is required"),
    password: yup.string().required("Password is required")
});

function SignUpPage() {
    const [redirect, setRedirect] = useState(false);

    const handleSubmit = async evt => {
        const isValid = await schema.validate(evt);
        if (!isValid) {
            return;
        }
        try {
            await signUp(evt);
            setRedirect(true);
        } catch (ex) {
            alert("Username already taken");
        }
    };
    if (redirect) {
        return <Redirect to="/" />;
    }
    return (
        <>
            <div className="limiter">
                <div className="container-login100">
                    <div className="wrap-login100">
                        <form className="login100-form validate-form">

                            <span className="login100-form-title p-b-26">
                                Sign Up Form
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

                        </form>
            
                           
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
                                                    <button  type="submit" className="login100-form-btn">
                                                        Sign Up
                                                    </button>
                                                </div>
                                            </div>



                                        </Form>
                                    )}
                            </Formik>
                    
                    </div>
                </div>
            </div>

            <script src="../public/vendor/jquery/jquery-3.2.1.min.js"></script>
            <script src="../public/vendor/animsition/js/animsition.min.js"></script>
            <script src="../public/vendor/bootstrap/js/popper.js"></script>
            <script src="../public/vendor/bootstrap/js/bootstrap.min.js"></script>  
            <script src="../public/vendor/select2/select2.min.js"></script>
            <script src="../public/vendor/daterangepicker/moment.min.js"></script>
            <script src="../public/vendor/daterangepicker/daterangepicker.js"></script>
            <script src="../public/vendor/countdowntime/countdowntime.js"></script>
            <script src="../public/js/main.js"></script>
            
        </>
    );
}
export default SignUpPage;