import React from "react";
import {
  Nav,
  NavLink,
  Bars,
  NavMenu,
  NavBtn,
  NavBtnLink,
  NavButtons,
} from "./NavbarElements";

const Navbar = () => {
  return (
    <>
      <Nav>
        <NavLink to="/" >
          <img
            src={require("../icons/favicon.ico")}
            alt="logo"
            className="navbar-logo"
          />
        </NavLink>
        <Bars />
        <NavMenu>
          <NavLink to="/products" activeStyle>
            Products
          </NavLink>
          <NavLink to="/pricing" activeStyle>
            Pricing
          </NavLink>
          <NavLink to="/faq" activeStyle>
            FAQ
          </NavLink>
          <NavLink to="/contact-us" activeStyle>
            Contact Us
          </NavLink>
          {/* Second Nav */}
          {/* <NavBtnLink to='/sign-in'>Sign In</NavBtnLink> */}
        </NavMenu>
        <NavButtons>
          <NavBtn className="nav-buttons">
            <NavBtnLink to="/login">Sign In</NavBtnLink>
          </NavBtn>
          <NavBtn className="nav-buttons">
            <NavBtnLink to="/register">Sign Up</NavBtnLink>
          </NavBtn>
        </NavButtons>
      </Nav>
    </>
  );
};

export default Navbar;
