import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import axios from "axios";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { sendNotification } from "./notification";
import {
  AppBar,
  Box,
  Dialog,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Typography, FormControlLabel, Checkbox, List
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
function Profile({ setLoggedIn, setUser }) {
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [activeTab, setActiveTab] = useState(0);

  const [notifToggles, setNotifToggles] = useState(
    JSON.parse(localStorage.getItem("notifToggles")) || {
      subdomainScanner: false,
      domainReachability: false,
      dnsScanner: false,
      portScanner: false,
      techScanner: false,
      profileEdit: false,
    }
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const toggleNotif = (event, name) => {
    setNotifToggles((prevState) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

  useEffect(() => {
    localStorage.setItem("notifToggles", JSON.stringify(notifToggles));
  }, [notifToggles]);

  
  useEffect(() => {
    setFirstname(setUser.firstname);
    setLastname(setUser.lastname);
    setEmail(setUser.email);
    setWebhookUrl(setUser.webhook);
  }, [setUser]);

  async function handleUpdateProfile(event) {
    event.preventDefault();
    setIsUpdating(true); // set isUpdating to true to disable the update button and show "Updating..." text
    try {
      // update user profile data in the database
      const updatedProfile = await updateUserProfile({
        firstname,
        lastname,
        email,
        webhookUrl,
      });
      setError("Profile updated successfully");
      setIsUpdating(false); // set isUpdating back to false to re-enable the update button
      console.log(updatedProfile); // log updated profile data to the console for testing
      let token = Cookies.get("jwt");
      try {
        const notificationData = {
          title: "New Notification",
          message: "Your profile details were updated!",
          feature: "profileEdit",
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
    } catch (error) {
      setError("Failed to update user profile data");
    } finally {
      setIsUpdating(false); // set isUpdating back to false to re-enable the update button
    }
  }

  async function updateUserProfile({ firstname, lastname, email, webhookUrl }) {
    // axios post user profile data in https://bugyet.repl.co/update-profile
    const jwt = Cookies.get("jwt");
    if (!jwt) {
      // If no JWT is present, redirect to the login page
      setLoggedIn(false);
      return;
    }
    // If a JWT is present, include it in the request header
    axios.defaults.headers.common.Authorization = `${jwt}`;

    const response = await axios.post("https://bugyet.repl.co/update-profile", {
      firstname,
      lastname,
      email,
      webhookUrl,
    });
    return response.data;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {error && <p>{error}</p>}
      {!isLoggedIn && <p>Please log in to view your profile</p>}
      {isLoggedIn && (
        <Paper
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: "600px",
          }}
        >
          {/* Add the AppBar with Tabs */}
          <AppBar position="static">
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Edit Profile" />
              <Tab label="Edit Notifications" />
            </Tabs>
          </AppBar>

          {/* Edit Profile Tab */}
          {activeTab === 0 && (
            <form
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
              onSubmit={handleUpdateProfile}
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
                  label="Lastname"
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
                label="Webhook URL"
                type="text"
                value={webhookUrl}
                onChange={(event) => setWebhookUrl(event.target.value)}
                style={{
                  margin: "10px 0",
                  width: "100%",
                  // minHeight: '100px',
                  resize: "vertical",
                  borderRadius: "5px",
                }}
                InputLabelProps={{ shrink: true }}
                multiline
              />

              <button
                type="submit"
                onClick={handleUpdateProfile}
                disabled={isUpdating}
                style={{
                  margin: "10px 0",
                  width: "300px",
                  height: "40px",
                  borderRadius: "5px",
                  backgroundColor: "#4caf50",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {isUpdating ? "Updating..." : "Update"}
              </button>
            </form>
          )}
          {/* Edit Notifications Tab */}
          {activeTab === 1 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <List>
                {/* Subdomain scanner */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notifToggles.subdomainScanner}
                      onChange={(event) => toggleNotif(event, "subdomainScanner")}
                    />
                  }
                  label="Subdomain scanner notifications"
                />

                {/* domain reachability */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notifToggles.domainReachability}
                      onChange={(event) =>
                        toggleNotif(event, "domainReachability")
                      }
                    />
                  }
                  label="Domain reachability notifications"
                />

                {/* DNS scanner */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notifToggles.dnsScanner}
                      onChange={(event) => toggleNotif(event, "dnsScanner")}
                    />
                  }
                  label="DNS scanner notifications"
                />

                {/* Port scanner */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notifToggles.portScanner}
                      onChange={(event) => toggleNotif(event, "portScanner")}
                    />
                  }
                  label="Port scanner notifications"
                />

                {/* Technology scanner */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notifToggles.technologyScanner}
                      onChange={(event) =>
                        toggleNotif(event, "technologyScanner")
                      }
                    />
                  }
                  label="Technology scanner notifications"
                />
                
                {/* Profile edit */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notifToggles.profileEdit}
                      onChange={(event) => toggleNotif(event, "profileEdit")}
                    />
                  }
                  label="Profile edit notifications"
                />
              </List>
            </div>
          )}
          {/* return to dashboard */}
          <Link to="/dashboard" style={{ textDecoration: "none" }}>
            {" "}
            Return to dashboard{" "}
          </Link>
        </Paper>
      )}
    </div>
  );
}

export default Profile;
