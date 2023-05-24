import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Link, Routes, useLocation, useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";
import axios from "axios";
import Dash from "./dashboard/dash";
import Login from "./auth/login";
import Register from "./auth/register";
import CircularProgress from "@mui/material/CircularProgress";
import EmailVerification from "./auth/emailverification";
import Home from "./homepage/home";
import Profile from "./profile";
import NotFound from "./NotFound";
import Bookmark from "./bookmark";
import ContactUs from "./contact-us";
import Faq from "./faq";
import Pricing from "./pricing";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const fetchUserData = () => {
    console.log("Fetching user data");
    // Get the JWT from the cookie
    const jwt = Cookies.get("jwt");
    if (!jwt) {
      // If no JWT is present, set loading to false and return
      setLoading(false);
      return;
    }
    // If a JWT is present, include it in the request header
    axios.defaults.headers.common.Authorization = `${jwt}`;
    // Fetch the user's details from the server
    axios
      .get("https://bugyet.repl.co/user")
      .then((response) => {
        console.log(response.data);
        if (response.data.success) {
          console.log("User data fetched successfully. app");
          setUser(response.data);
          setLoggedIn(true);
          setLoading(false);
          setDataFetched(true);
        } else {
          console.error(response.data);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!dataFetched) {
      fetchUserData();
    }
  }, []);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (loggedIn) {
      if (location.pathname === "/login" || location.pathname === "/register") {
        navigate("/dashboard");
        // } else {
        //   navigate('/login');
      }
    } else {
      if (location.pathname === "/dashboard") {
        navigate("/login");
      }
    }
  }, [location.pathname, loggedIn, navigate]);

  /* Showing a loading screen while the user data is being fetched from the server. */
  if (loading) {
    return (
      <div className="loading-main">
        <CircularProgress />
        <p>Authenticating</p>
      </div>
    );
  }

  /* Rendering the routes. */
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            loggedIn ? (
              <Dash setUser={setUser} setLoggedIn={setLoggedIn} />
            ) : (
              <Login setLoggedIn={setLoggedIn} setUser={setUser} />
            )
          }
        />
        <Route
          path="/register"
          element={
            loggedIn ? (
              <Dash setUser={setUser} setLoggedIn={setLoggedIn} />
            ) : (
              <Register setLoggedIn={setLoggedIn} setUser={setUser} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            loggedIn ? (
              <Dash setUser={setUser} setLoggedIn={setLoggedIn} />
            ) : (
              <Login setLoggedIn={setLoggedIn} setUser={setUser} />
            )
          }
        />
        <Route
          path="/profile"
          element={
            loggedIn ? (
              <Profile setUser={user} setLoggedIn={loggedIn} />
            ) : (
              <Login setLoggedIn={setLoggedIn} setUser={setUser} />
            )
          }
        />
        <Route path="/bookmark" element={<Bookmark />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="*" element={<NotFound />} />
        </Routes>
    </>
  );
};

export default App;
