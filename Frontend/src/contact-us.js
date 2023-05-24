import React from "react";
import Card from "react-bootstrap/Card";
import Navbar from "./dashboard/Navbar";
import accountIcon from "./dashboard/icons/add-user.png";
import notificationIcon from "./dashboard/icons/notification.png";
import proxyIcon from "./dashboard/icons/www.png";
import domainIcon from "./dashboard/icons/protocols.png";

const contactUs = () => {
  return (
    <div>
      <Navbar />
      <div className="contact-page-header">
        <p className="contact-page-text">Need Help Using BugYet?</p>
        <button className="submit-request-button">Submit a Request</button>
      </div>
      <hr />
      <p className="popular-topics" style={{ margin: "40px 85px 0 85px" }}>
        Popular topics
      </p>
      <div className="cards">
        <Card
          style={{
            width: "200px",
            margin: "10px",
            borderStyle: "solid",
            padding: "25px",
            alignItems: "center",
          }}
        >
          <Card.Img
            variant="top"
            src={accountIcon}
            style={{ width: "120px" }}
          />
          <Card.Body>
            <Card.Title style={{ fontWeight: "bold" }}>
              Creating an Account
            </Card.Title>
          </Card.Body>
        </Card>
        <Card
          style={{
            width: "200px",
            margin: "10px",
            borderStyle: "solid",
            padding: "25px",
          }}
        >
          <Card.Img
            variant="top"
            src={notificationIcon}
            style={{ width: "120px" }}
          />
          <Card.Body>
            <Card.Title style={{ fontWeight: "bold" }}>
              Customize Notifications
            </Card.Title>
          </Card.Body>
        </Card>
        <Card
          style={{
            width: "200px",
            margin: "10px",
            borderStyle: "solid",
            padding: "25px",
          }}
        >
          <Card.Img variant="top" src={proxyIcon} style={{ width: "120px" }} />
          <Card.Body>
            <Card.Title style={{ fontWeight: "bold" }}>
              How to Setup Proxy?
            </Card.Title>
          </Card.Body>
        </Card>
        <Card
          style={{
            width: "200px",
            margin: "10px",
            borderStyle: "solid",
            padding: "25px",
          }}
        >
          <Card.Img variant="top" src={domainIcon} style={{ width: "120px" }} />
          <Card.Body>
            <Card.Title style={{ fontWeight: "bold" }}>
              Domain Reachability
            </Card.Title>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};
export default contactUs;
