import Navbar from "./dashboard/Navbar";
import React from "react";
import Card from "react-bootstrap/Card";

const Pricing = () => {
  return (
    <div>
      <Navbar />
      <p style={{ textAlign: "center", fontSize: "45px", marginBottom: "5px" }}>
        Pricing
      </p>
      <p style={{ textAlign: "center", fontSize: "20px", marginTop: 0 }}>
        Choose a pricing model that fits your needs.
      </p>
      <div className="cards">
        <Card
          style={{
            width: "200px",
            margin: "10px",
            borderStyle: "solid",
            borderRadius: "5px",
            padding: "25px",
            alignItems: "center",
          }}
        >
          <Card.Body>
            <Card.Title style={{ fontWeight: "bold" }}>Free</Card.Title>
          </Card.Body>
        </Card>
        <Card
          style={{
            width: "200px",
            margin: "10px",
            borderStyle: "solid",
            borderRadius: "5px",
            padding: "25px",
          }}
        >
          <Card.Body>
            <Card.Title style={{ fontWeight: "bold" }}>Pro</Card.Title>
          </Card.Body>
        </Card>
        <Card
          style={{
            width: "200px",
            margin: "10px",
            borderStyle: "solid",
            borderRadius: "5px",
            padding: "25px",
          }}
        >
          <Card.Body>
            <Card.Title style={{ fontWeight: "bold" }}>Enterprise</Card.Title>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};
export default Pricing;
