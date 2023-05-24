import React, { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FaPlay, FaPause, FaSyncAlt } from "react-icons/fa";
// import "./index.css";
import { sendNotification } from "../notification";
import Cookies from "js-cookie";

function CircularCounter() {
  /* Setting the initial state of the component. */
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeAlert, setTimeAlert] = useState("");
  const [customTime, setCustomTime] = useState(1); // default value is 1 hour

  // Load the saved time from local storage on initial render
  useEffect(() => {
    const savedTime = localStorage.getItem("savedTime");
    const savedIsRunning = localStorage.getItem("savedIsRunning");

    if (savedTime && savedIsRunning) {
      setTime(parseInt(savedTime));
      setIsRunning(savedIsRunning === "true");
    }
  }, []);

  // Update the time every second if the counter is running
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1000);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Save the current time and isRunning state to local storage when the component unmounts
  useEffect(() => {
    localStorage.setItem("savedTime", time.toString());
    localStorage.setItem("savedIsRunning", isRunning.toString());
  }, [time, isRunning]);

  // Start the counter and save the current time to local storage
  const handleStart = () => {
    localStorage.setItem("savedIsRunning", "true");
    setIsRunning(true);
    setTimeAlert("");
    // setTime(customTime * 3600000); // set the time to the custom time in hours
    // localStorage.setItem("savedTime", (customTime * 3600000).toString()); // save the time to local storage
    let token = Cookies.get("jwt");
    try {
      const notificationData = {
        title: "Session Started",
        message: "You have started a new working session.",
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
  };

  // Stop the counter and save the current time to local storage
  const handlePause = () => {
    localStorage.setItem("savedTime", time.toString());
    localStorage.setItem("savedIsRunning", "false");
    setIsRunning(false);
  };

  // Reset the counter to zero and remove saved time and isRunning state from local storage
  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    localStorage.removeItem("savedTime");
    localStorage.removeItem("savedIsRunning");
    setTimeAlert("00:00:00");
  };

  // Convert the time in milliseconds to hours, minutes, and seconds
  const hours = Math.floor(time / 3600000);
  const minutes = Math.floor((time % 3600000) / 60000);
  const seconds = Math.floor((time % 60000) / 1000);

  // Format the time as a string with leading zeros
  const timeString = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // Calculate the progress as a percentage
  const progress = Math.min((time / (customTime * 3600000)) * 100, 100);

  //  if progress is 100% then stop the counter
  if (progress === 100 && isRunning) {
    // stop the counter
    handlePause();
    // alert("Time is up!");
    setTimeAlert("Break Time!");
  }

  // handle custom time
  const handleCustomTime = () => {
    // setTime(customTime * 3600000); // set the time to the custom time in hours
    // set time to 59 minutes
    setTime(3540000);
    localStorage.setItem("savedTime", (customTime * 3600000).toString()); // save the time to local storage
  };

  return (
    <div className="circular-counter flex items-center justify-center" style={{ maxWidth: '100%', height: '100%' }}>
      <div
        style={{
          maxHeight: '500px', // Set the max height here
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
      <div className="progress-container relative">
        <CircularProgressbar
          value={progress}
          text={timeAlert ? timeAlert : timeString}
          styles={buildStyles({
            strokeLinecap: "butt",
            // textSize: "20px",
            // text size 16px when progress is 100%
            textSize: progress === 100 ? "15px" : "20px",
            pathColor: "#4CAF50",
            textColor: progress === 100 ? "#f00" : "#4CAF50",
            trailColor: "#d6d6d6",
          })}
        />
        <div className="button-container absolute inset-0 flex flex-col items-center justify-center">
          <input
            type="number"
            min="1"
            max="24"
            defaultValue={1}
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCustomTime();
              }
            }}
          />

          {!isRunning ? (
            <button
              onClick={handleStart}
              className="text-white hover:text-gray-100 focus:outline-none"
            >
              <FaPlay className="text-4xl" />
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="text-white hover:text-gray-100 focus:outline-none"
            >
              <FaPause className="text-4xl" />
            </button>
          )}
          <button
            onClick={handleReset}
            className="text-white hover:text-gray-100 focus:outline-none"
          >
            <FaSyncAlt className="text-4xl" />
          </button>
        </div>
      </div>
      </div>
      </div>
  );
}

export default CircularCounter;
