import React from "react";
import Navbar from "../dashboard/Navbar";
import picture from "../dashboard/icons/home-pic.jpg";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <Navbar />
      <div className="home-page-layout">
        <div className="home-page-left">
          <p className="homepage-big-text">BugYet,</p>
          <p className="homepage-big-text">There it is.</p>
          <p className="homepage-small-text">
            BugYet aims to help Pentesters and upcoming hackers automate their
            vulnerability-finding process. We offer a variety of features such
            as scanning subdomains, checking for firewall protection, and
            checking for domain reachability. You can also generate customizable
            and exportable reports. Create an account and get started today.
          </p>
          <Link to="/login">
            <button className="get-started-button">Get Started</button>
          </Link>
          <Link to="/register">
            <button className="demo-button">Try a demo</button>
          </Link>
        </div>
        <div className="home-page-right">
          <img src={picture} className="home-pic"></img>
        </div>
      </div>
    </div>
  );
};

export default Home;