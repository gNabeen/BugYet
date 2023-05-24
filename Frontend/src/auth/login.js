// @ author: Nabin Gautam
// @ description: The login page of the application.

import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import EmailVerification from "./emailverification";
import { TextField } from "@mui/material";
import { sendNotification } from "../notification";
import logo from "../dashboard/icons/favicon.ico";

const Login = ({ setLoggedIn, setUser }) => {
  /* Creating a state variable for each of the variables. */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loggedInButUnverified, setLoggedInButUnverified] = useState(false);

  /**
   * It takes the email and password from the form, sends it to the server, and if the server
   * responds with a success message, it sets the user as logged in
   * @param event - The event that triggered the function.
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    setIsLoading(true);
    axios
      .post("https://bugyet.repl.co/login", {
        email,
        password,
      })
      .then((response) => {
        if (response.data.success) {
          setLoggedIn(true);
          setUser(response.data.user);
          setError("Logged in successfully!");
          Cookies.set("jwt", response.data.data.token);
          setIsLoading(false);
          let token = Cookies.get("jwt");
          try {
            const notificationData = {
              title: "Critical Notification",
              message: "New Login on your account!",
            };
            sendNotification(token, notificationData)
              .then((response) => {
                console.log("Notification sent successfully:", response);
              })
              .catch((error) => {
                console.error("Failed to send notification:", error);
              });
          } catch (error) {
            console.error("Failed to send notification:", error);
          }
        } else {
          setError(response.data.message);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.log(error.response);
        console.error(error.response.data.message);
        if (
          error.response &&
          error.response.data ===
            "Too many login attempts, please try again later"
        ) {
          setError(
            "You have exceeded the maximum number of login attempts. Please try again later."
          );
        } else if (
          error.response &&
          error.response.data === "Incorrect email or password"
        ) {
          setError("Incorrect email or password");
        } else if (
          error.response &&
          error.response.data.message ===
            "Please verify your email before logging in."
        ) {
          setError("Please verify your email before logging in.");
          Cookies.set("jwt", error.response.data.token);
          setLoggedInButUnverified(true);
        } else if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          setError(error.response.data.error);
        } else {
          setError("There was an error logging in. Please try again later.");
        }
        setIsLoading(false);
      });
  };

  /* A ternary operator. It is a shorthand for an if-else statement. */
  return loggedInButUnverified ? (
    <EmailVerification />
  ) : (
    <div className="signup">
      <img src={logo} className="signin-logo" />
      <p className="signin-text">Sign In</p>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {error && <p>{error}</p>}
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          InputLabelProps={{ shrink: true }}
          style={{
            margin: "10px 0",
            width: "300px",
            height: "30px",
            borderRadius: "5px",
          }}
        />
        <br />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          InputLabelProps={{ shrink: true }}
          style={{
            margin: "10px 0",
            width: "300px",
            height: "30px",
            borderRadius: "5px",
          }}
        />
        <br />
        <button className="signin-button" type="submit">
          {isLoading ? <>Signing in...</> : <>Sign In</>}
        </button>
      </form>
      <p className="signin-bottom-text">
        Don't have an account?{" "}
        <a href="/register">
          <button className="signin-page-register-button">Register</button>
        </a>
      </p>
    </div>
  );
};

/* Exporting the Login component. */
export default Login;
