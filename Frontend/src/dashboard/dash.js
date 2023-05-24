import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import SubdomainFinder from "../modules/subdomainfinder";
import DomainReachability from "../modules/domainreachability";
import DNSScanner from "../modules/dns";
import PortScanner from "../modules/port";
import {
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Grid,
  Hidden,
  Drawer, IconButton, useMediaQuery, useTheme, Accordion, AccordionSummary,
  AccordionDetails,
  AccountCircle,
  Bookmark,
  ExitToApp,
  Menu
} from "@mui/material";
import Popover from '@mui/material/Popover';

import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import ProfileMenu from "./ProfileMenu";
import VulnerabilityNews from './VulnerabilityNews';
import WaybackArchive from "../modules/wayback";
import NucleiScanner from "../modules/NucleiScanner";

import PersonIcon from '@mui/icons-material/Person';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SearchIcon from "@mui/icons-material/Search";

import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import "./dash.css";
import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Summary from "../modules/summary";
import CircularCounter from "./counter";
import TodoList from "./todo";
import Profile from "../profile";
import { Link } from "react-router-dom";
import Technology from "../modules/technology";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import SecretKeyFinder from "../modules/secretkeyfinder";

//local icons
import dns_icon from "./icons/dns.png";
import port_icon from "./icons/port.png";
import subdomain_icon from "./icons/subdomain.png";
import reachability_icon from "./icons/reachability.png";
import technology_icon from "./icons/tech.png";

const Dash = ({ setLoggedIn }) => {
  // define state variables
  const [user, setUser] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [middleColumns, setMiddleColumns] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  // const [tabOrder, setTabOrder] = useState([]);
  const [tabName, setTabName] = useState("");
  // const [showProfile, setShowProfile] = useState(false);
  const [tabIdCounter, setTabIdCounter] = useState(0);
  const [selectedTab, setSelectedTab] = useState(0);

  // State for the drawer (side menu)
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [open, setMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleClose = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleEditProfileClick = () => {
    // Handle edit profile logic here
    console.log("Edit Profile Clicked");
    handleClose();
  };

  const theme = useTheme();
  const matches = useMediaQuery('(max-width: 1000px)');

  // const handleProfileClick = () => {
  //   setShowProfile(!showProfile);
  // };
  // Drawer open and close handlers
  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  useEffect(() => {
    // Get the JWT from the cookie
    const jwt = Cookies.get("jwt");
    if (!jwt) {
      // If no JWT is present, redirect to the login page
      setLoggedIn(false);
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
          console.log("User data fetched successfully. home");
          setUser(response.data);
          setLoggedIn(true);
          setIsLoading(false);
        } else {
          // Cookies.remove("jwt");
          // setLoggedIn(false);
          console.error(response.data.error);
          setError(response.data.error);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error(error);
        setError(
          "There was an error fetching your user data. Please try again later."
        );
        setIsLoading(false);
      });
  }, []);
  const date = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const handleLogout = () => {
    // Clear the JWT from the cookie
    Cookies.remove("jwt");

    // Remove the Authorization header from axios
    delete axios.defaults.headers.common.Authorization;

    // Set the loggedIn state to false
    setLoggedIn(false);
    // Redirect to the login page
    // window.location.href = "/";
  };

  const handleScannerClick = () => {
    if (middleColumns.length >= 6) return;
    const updatedMiddleColumns = [
      ...middleColumns,
      { component: <SubdomainFinder />, name: "Subdomain Scanner", tabId: tabIdCounter },
    ];
    setMiddleColumns(updatedMiddleColumns);
    setActiveTab(tabIdCounter);
    setTabIdCounter(tabIdCounter + 1);
  };

  const handleReachabilityClick = () => {
    if (middleColumns.length >= 6) return;
    const updatedMiddleColumns = [
      ...middleColumns,
      { component: <DomainReachability />, name: "Domain Reachability" },
    ];
    setMiddleColumns(updatedMiddleColumns);
    setActiveTab(updatedMiddleColumns.length - 1);
  };

  const handleDnsClick = () => {
    if (middleColumns.length >= 6) return;
    const updatedMiddleColumns = [
      ...middleColumns,
      { component: <DNSScanner />, name: "DNS Scanner" },
    ];
    setMiddleColumns(updatedMiddleColumns);
    setActiveTab(updatedMiddleColumns.length - 1);
  };

  const handleTechnologyClick = () => {
    if (middleColumns.length >= 6) return;
    const updatedMiddleColumns = [
      ...middleColumns,
      { component: <Technology />, name: "Technology Scanner" },
    ];
    setMiddleColumns(updatedMiddleColumns);
    setActiveTab(updatedMiddleColumns.length - 1);
  };

  const handlePortClick = () => {
    if (middleColumns.length >= 6) return;
    const updatedMiddleColumns = [
      ...middleColumns,
      { component: <PortScanner />, name: "Port Scanner" },
    ];
    setMiddleColumns(updatedMiddleColumns);
    setActiveTab(updatedMiddleColumns.length - 1);
  };

  const handleSecretKeyClick = () => {
    if (middleColumns.length >= 6) return;
    const updatedMiddleColumns = [
      ...middleColumns,
      { component: <SecretKeyFinder />, name: "Secret Key Finder" },
    ];
    setMiddleColumns(updatedMiddleColumns);
    setActiveTab(updatedMiddleColumns.length - 1);
  };

  const handleWaybackClick = () => {
    if (middleColumns.length >= 6) return;
    const updatedMiddleColumns = [
      ...middleColumns,
      { component: <WaybackArchive />, name: "Wayback Machine" },
    ];
    setMiddleColumns(updatedMiddleColumns);
    setActiveTab(updatedMiddleColumns.length - 1);
  };

  const handleNucleiClick = () => {
    if (middleColumns.length >= 6) return;
    const updatedMiddleColumns = [
      ...middleColumns,
      { component: <NucleiScanner />, name: "Nuclei Scanner" },
    ];
    setMiddleColumns(updatedMiddleColumns);
    setActiveTab(updatedMiddleColumns.length - 1);
  };


  const handleCloseTab = (index) => {
    const updatedMiddleColumns = middleColumns.filter((_, i) => i !== index);
    setMiddleColumns(updatedMiddleColumns);
    setActiveTab((prevActiveTab) => (prevActiveTab >= updatedMiddleColumns.length ? prevActiveTab - 1 : prevActiveTab));
  };

  const handleEditClick = (index) => {
    // // Display an input box for the user to edit the tab name
    // let newTabName = prompt("Enter New Tab Name:");
    // // Update the tab label in the tabs array
    // let updatedMiddleColumns = [...middleColumns];
    // updatedMiddleColumns[index]["label"] = newTabName;
    // const updatedMiddleColumns =updatedMiddleColumns);
    // // Update the tabName state variable
    // setTabName(newTabName);
  };

  const renderMiddleColumn = () => {
    if (middleColumns.length === 0 || activeTab === -1) {
      return <Summary />;
    }
  };
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };
  
  const renderSelectedTabContent = () => {
    switch (selectedTab) {
      case 0:
        return (
          matches ? (
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <h4>Working Hours</h4>
              </AccordionSummary>
              <AccordionDetails>
                <CircularCounter />
              </AccordionDetails>
            </Accordion>
          ) : (
            <CircularCounter />
          )
        );
      case 1:
        return (
          matches ? (
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <h4>Vulnerabilities News</h4>
              </AccordionSummary>
              <AccordionDetails>
                <VulnerabilityNews />
              </AccordionDetails>
            </Accordion>
          ) : (
            <VulnerabilityNews />
          )
        );
      default:
        return null;
    }
  };

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    // textAlign: 'center',
    color: theme.palette.text.secondary,
    margin: theme.spacing(1),
    // box shadow all sides
    boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.2)",
    border: "1px solid #e0e0e0",
    // msOverflowX: "scroll",
    overflowX: "Hidden",
    overflowY: "Hidden",
    marginLeft: "20px",
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  }));
  return (
    <>
      {isLoading ? (
        <div className="loading-main">
          <CircularProgress />
          <p>Almost there...</p>
        </div>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Item>
                <div className="top-bar">
                    {/* Hamburger menu toggle button */}
                    {matches ? (
                      <Grid item>
                        <IconButton
                          color="inherit"
                          aria-label="open drawer"
                          edge="end"
                          onClick={handleDrawerOpen}
                          style={{ marginRight: "16px" }} // Add a right margin
                        >
                          <MenuIcon />
                        </IconButton>
                      </Grid>
                    ) : (
                      <Grid item>
                        <b>👨‍🎓 Welcome {user.firstname}</b>
                      </Grid>
                    )}

                    {/* Search bar */}
                    <Grid item className="search-bar">
                      {/* <SearchOffRounded /> */}

                      <input type="text" placeholder="Search" />
                    </Grid>

                    <Grid item>
                    {/* hide date when hamburger menu is visible */}
                    {!matches && <div className="date"><b>{date}</b></div>}
                    </Grid>

                    {/* Bookmark */}
                    <Grid item>
                      <Link to="/bookmark" style={{ textDecoration: "none" }}>
                        {matches ? (
                          <IconButton>
                            <BookmarkIcon style={{ color: "black" }} />
                          </IconButton>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                              color: "black",
                              border: "1px solid black",
                              padding: "5px",
                              borderRadius: "5px",
                            }}
                          >
                            <BookmarkIcon />
                            <span style={{ textAlign: "center" }}>Bookmarks</span>
                          </div>
                        )}
                      </Link>
                    </Grid>

                    {/* Profile */}
                  <Grid item>
                    <ProfileMenu handleLogout={handleLogout} user={user} />
                    </Grid>
                </div>
              </Item>
            </Grid>

            {/* Side menu with drawer for smaller screens */}
            {matches ? (
              <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerClose}>
                <div className="side-menu">
                  {/* ... side menu content */}
                  <div className="modules" onClick={handleScannerClick}>
                    <img
                      src={subdomain_icon}
                      className="icon"
                      alt="Subdomain Scanner"
                      style={{ width: "30px", height: "30px" }}
                    />
                    <Hidden smDown>
                      <span className="module-text">Subdomain Scanner</span>
                    </Hidden>
                  </div>

                  <div className="modules" onClick={handleReachabilityClick}>
                    <img
                      src={reachability_icon}
                      className="icon"
                      alt="Domain Reachability"
                      style={{ width: "30px", height: "30px" }}
                    />
                    <Hidden smDown>
                      <span className="module-text">Domain Reachability</span>
                    </Hidden>
                  </div>

                  <div className="modules" onClick={handleDnsClick}>
                    <img
                      src={dns_icon}
                      className="icon"
                      alt="DNS Scanner"
                      style={{ width: "30px", height: "30px" }}
                    />
                    <Hidden smDown>
                      <span className="module-text">DNS Scanner</span>
                    </Hidden>
                  </div>

                  <div className="modules" onClick={handlePortClick}>
                    <img
                      src={port_icon}
                      className="icon"
                      alt="Port Scanner"
                      style={{ width: "30px", height: "30px" }}
                    />
                    <Hidden smDown>
                      <span className="module-text">Port Scanner</span>
                    </Hidden>
                  </div>

                  <div className="modules" onClick={handleTechnologyClick}>
                    <img
                      src={technology_icon}
                      className="icon"
                      alt="Technology Scanner"
                      style={{ width: "30px", height: "30px" }}
                    />
                    <Hidden smDown>
                      <span className="module-text">Technology Scanner</span>
                    </Hidden>
                  </div>
                    <div className="modules" onClick={handleSecretKeyClick}>
                      <img
                        src={technology_icon}
                        className="icon"
                        alt="Secret Key Scanner"
                        style={{ width: "30px", height: "30px" }}
                      />
                      <Hidden smDown>
                        <span className="module-text">Secret Key Scanner</span>
                      </Hidden>
                  </div>
                  <div className="modules" onClick={handleWaybackClick}>
                    <img
                      src={technology_icon}
                      className="icon"
                      alt="Way back Scanner"
                      style={{ width: "30px", height: "30px" }}
                    />
                    <Hidden smDown>
                      <span className="module-text">List APIs</span>
                    </Hidden>
                  </div>
                  <div className="modules" onClick={handleNucleiClick}>
                    <img
                      src={technology_icon}
                      className="icon"
                      alt="Nuclei Scanner"
                      style={{ width: "30px", height: "30px" }}
                    />
                    <Hidden smDown>
                      <span className="module-text">Nuclei Scanner</span>
                    </Hidden>
                    </div>
                </div>
              </Drawer>
            ) : (
              // Regular side menu for larger screens
              <Grid item xs={12} sm={4} md={3} lg={2}>
                <Item>
                    <div className="side-menu">
                      {/* ... side menu content */}
                      <div className="modules" onClick={handleScannerClick}>
                        <img
                          src={subdomain_icon}
                          className="icon"
                          alt="Subdomain Scanner"
                          style={{ width: "30px", height: "30px" }}
                        />
                        <Hidden smDown>
                          <span className="module-text">Subdomain Scanner</span>
                        </Hidden>
                      </div>

                      <div className="modules" onClick={handleReachabilityClick}>
                        <img
                          src={reachability_icon}
                          className="icon"
                          alt="Domain Reachability"
                          style={{ width: "30px", height: "30px" }}
                        />
                        <Hidden smDown>
                          <span className="module-text">Domain Reachability</span>
                        </Hidden>
                      </div>

                      <div className="modules" onClick={handleDnsClick}>
                        <img
                          src={dns_icon}
                          className="icon"
                          alt="DNS Scanner"
                          style={{ width: "30px", height: "30px" }}
                        />
                        <Hidden smDown>
                          <span className="module-text">DNS Scanner</span>
                        </Hidden>
                      </div>

                      <div className="modules" onClick={handlePortClick}>
                        <img
                          src={port_icon}
                          className="icon"
                          alt="Port Scanner"
                          style={{ width: "30px", height: "30px" }}
                        />
                        <Hidden smDown>
                          <span className="module-text">Port Scanner</span>
                        </Hidden>
                      </div>

                      <div className="modules" onClick={handleTechnologyClick}>
                        <img
                          src={technology_icon}
                          className="icon"
                          alt="Technology Scanner"
                          style={{ width: "30px", height: "30px" }}
                        />
                        <Hidden smDown>
                          <span className="module-text">Technology Scanner</span>
                        </Hidden>
                      </div>

                      <div className="modules" onClick={handleSecretKeyClick}>
                        <img
                          src={technology_icon}
                          className="icon"
                          alt="Secret Key Scanner"
                          style={{ width: "30px", height: "30px" }}
                        />
                        <Hidden smDown>
                          <span className="module-text">Secret Key Scanner</span>
                        </Hidden>
                      </div>
                      <div className="modules" onClick={handleWaybackClick}>
                        <img
                          src={technology_icon}
                          className="icon"
                          alt="Secret Key Scanner"
                          style={{ width: "30px", height: "30px" }}
                        />
                        <Hidden smDown>
                          <span className="module-text">List APIs</span>
                        </Hidden>
                      </div>
                      <div className="modules" onClick={handleNucleiClick}>
                      <img
                        src={technology_icon}
                        className="icon"
                        alt="Nuclei Scanner"
                        style={{ width: "30px", height: "30px" }}
                      />
                      <Hidden smDown>
                        <span className="module-text">Nuclei Scanner</span>
                      </Hidden>
                    </div>
                    </div>
                </Item>
              </Grid>
            )}
            <Grid item xs={12} sm={11} md={9} lg={8}>
            {renderMiddleColumn()}
              <Tabs
                value={activeTab}
                onChange={(event, value) => setActiveTab(value)}
                variant="scrollable"
              >
                {middleColumns.map((column, index) => (
                  <Tab
                    key={index}
                    label={`${column.name} ${index + 1}`}
                    icon={
                      <>
                        <CloseIcon onClick={() => handleCloseTab(index)} />
                      </>
                    }
                  />
                ))}
              </Tabs>

              {middleColumns.map((column, index) => (
                <div key={index} hidden={activeTab !== index}>
                  {column.component}
                </div>
              ))}
          </Grid>
            <Grid item xs={12} sm={12} md={12} lg={2}>
              <Item>
                <Tabs
                  value={selectedTab}
                  onChange={handleTabChange}
                  indicatorColor="primary"
                  textColor="primary"
                  centered
                  variant="fullWidth"
                >
                  <Tab label="Working Hours" />
                  <Tab label="Vulnerabilities News" />
                </Tabs>
                {renderSelectedTabContent()}
              </Item>
              <Item>
                {matches ? (
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel2a-content"
                      id="panel2a-header"
                    >
                      <h4>Daily Agenda</h4>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TodoList />
                    </AccordionDetails>
                  </Accordion>
                ) : (
                  <TodoList />
                )
                }
              </Item>
            </Grid>
        </Grid>
      )}
    </>
  );
};

export default Dash;
