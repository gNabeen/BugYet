import React, { useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";

/**
 * It sends a request to the server to get the user's email, and if the user is not verified, it sends
 * a request to the server to send a verification email to the user
 */
const EmailVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const resendEmail = async () => {
    setIsLoading(true);
    try {
      const jwt = Cookies.get("jwt");
      axios.defaults.headers.common.Authorization = `${jwt}`;
      const res = await axios.get("https://bugyet.repl.co/user");
    } catch (error) {
      console.log("the error is " + error);
      console.log(error.response.data.email);
      if (error.response.data.email) {
        const email = error.response.data.email;
        const sendRes = await axios.post(
          "https://bugyet.repl.co/request-verification-email",
          { email }
        );
        if (sendRes.data.success) {
          setMessage("Verification email sent");
          Cookies.remove("jwt");
        } else {
          setMessage(
            sendRes.data.message || "Error sending verification email"
          );
        }
      } else {
        setMessage("Error fetching user details");
      }
    }
    setIsLoading(false);
  };
  /* Returning the html code. */
  return (
    <div>
      <p>
        Your email address is not verified. Please check your email for a
        verification link.
      </p>
      {message !== "Verification email sent" ? (
        <button onClick={resendEmail}>Resend Verification Email</button>
      ) : (
        <p>Check your email and click the verification link to verify.</p>
      )}
      {isLoading && <p>Loading...</p>}
      {message && <p>{message}</p>}
    </div>
  );
};

/* Exporting the EmailVerification component. */
export default EmailVerification;
