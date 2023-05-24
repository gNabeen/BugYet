// @author: Nabin Gautam
// @description: The register page of the application.

import React, { useState } from "react";
import axios from "axios";
import { TextField } from "@mui/material";
import { Link } from "react-router-dom";
import logo from "../dashboard/icons/favicon.ico";

const Register = () => {
  /* Setting the state of the component. */
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setLoggedIn] = useState(false);

  /**
   * It takes the user's input and sends it to the server
   * @param event - The event object that is passed to the function.
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    axios
      .post("https://bugyet.repl.co/reg", {
        firstname,
        lastname,
        email,
        password,
      })
      .then((response) => {
        if (response.data.success) {
          setLoggedIn(true);
          setError("Account created successfully! Login to continue.");
        } else {
          setError(response.data.message);
        }
      })
      .catch((error) => {
        console.error(error);
        if (
          error.response &&
          error.response.data ===
            "Too many login attempts, please try again later"
        ) {
          setError(
            "You have exceeded the maximum number of register attempts. Please try again later."
          );
        } else if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          setError(error.response.data.error);
        } else {
          setError("There was an error signing up. Please try again later.");
        }
      });
  };

  /* Returning the JSX code that is rendered on the page. */
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        margin: "100px",
      }}
    >
      <img src={logo} className="signin-logo" />
      <p className="signin-text">Sign Up</p>
      {error && <p>{error}</p>}
      {!isLoggedIn && (
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "300px",
            }}
          >
            <TextField
              label="First name"
              type="text"
              value={firstname}
              onChange={(event) => setFirstname(event.target.value)}
              style={{
                margin: "10px 0",
                width: "145px",
                height: "30px",
                borderRadius: "5px",
              }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Last name"
              type="text"
              value={lastname}
              onChange={(event) => setLastname(event.target.value)}
              style={{
                margin: "10px 0",
                width: "145px",
                height: "30px",
                borderRadius: "5px",
              }}
              InputLabelProps={{ shrink: true }}
            />
          </div>
          <br />

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={{
              margin: "10px 0",
              width: "300px",
              height: "30px",
              borderRadius: "5px",
            }}
            InputLabelProps={{ shrink: true }}
          />

          <br />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={{
              margin: "10px 0",
              width: "300px",
              height: "30px",
              borderRadius: "5px",
            }}
            InputLabelProps={{ shrink: true }}
          />
          <br />
          <button type="submit" className="signin-button">
            Register
          </button>
        </form>
      )}
      <p className="signin-bottom-text">
        Already have an account?
        <a href="/login">
          <button className="signin-page-register-button">Login</button>
        </a>
      </p>
    </div>
  );
};
/* Exporting the component so that it can be imported in other files. */
export default Register;
