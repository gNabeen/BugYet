import React, { useState, useEffect } from "react";
import "./dash.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faTrashRestore,
} from "@fortawesome/free-solid-svg-icons";
import { sendNotification } from "../notification";
import Cookies from "js-cookie";

function TodoList() {
  /* A React hook that allows us to use state in a functional component. */
  const [tasks, setTasks] = useState([]);
  const [totalTasks, setTotalTasks] = useState([]);

  /* This is a React hook that allows us to use state in a functional component. */
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    const totalSavedTasks = localStorage.getItem("totalTasks");
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      // sort tasks by timestamp in descending order
      parsedTasks.sort((a, b) => b.timestamp - a.timestamp);
      setTasks(parsedTasks);
    }
    if (totalSavedTasks) {
      setTotalTasks(JSON.parse(totalSavedTasks));
    }
  }, []);

  /* This is a React hook that allows us to use state in a functional component. */
  const [inputValue, setInputValue] = useState("");

  /**
   * `handleInputChange` is a function that takes an event as an argument and sets the inputValue state
   * to the value of the event target
   * @param event - The event object is a JavaScript event that is sent to an element when an event
   * occurs on it.
   */
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  /**
   * When the user clicks the add task button, the input value is checked to see if it's empty. If
   * it's not empty, a new task object is created and added to the tasks array. The input value is
   * then cleared and a notification is sent to the user
   */
  const handleAddTask = () => {
    if (inputValue.trim()) {
      const newTask = {
        id: Date.now(),
        text: inputValue,
        done: false,
        timestamp: new Date(),
      };
      setTasks([...tasks, newTask]);
      setTotalTasks([...totalTasks, newTask]);
      setInputValue("");
      let token = Cookies.get("jwt");
      try {
        const notificationData = {
          title: "New Task",
          message: `You added a new task: ${inputValue}`,
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
    }
  };

  /* This is a React hook that allows us to use state in a functional component. */
  /**
   * When the tasks or totalTasks state changes, update the localStorage with the new values.
   * @param taskId - The id of the task that was clicked.
   */
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("totalTasks", JSON.stringify(totalTasks));
  }, [tasks, totalTasks]);

  const handleToggleDone = (taskId) => {
    setTasks((tasks) =>
      tasks.map((task) =>
        task.id === taskId ? { ...task, done: !task.done } : task
      )
    );

    setTotalTasks((totalTasks) =>
      totalTasks.map((task) =>
        task.id === taskId ? { ...task, done: !task.done } : task
      )
    );
  };

  /**
   * If the user clicks the "Clear Tasks" button, then show the confirmation modal
   */
  const handleClearTasks = () => {
    setShowConfirmation(true);
  };

  /**
   * When the user clicks the "Clear Tasks" button, the confirmation modal is shown. If the user clicks
   * the "Yes" button, the tasks array is emptied and the confirmation modal is hidden
   */
  const handleConfirmClearTasks = () => {
    setTasks([]);
    setShowConfirmation(false);
  };

  /**
   * It sets the showConfirmation state to false
   */
  const handleCancelClearTasks = () => {
    setShowConfirmation(false);
  };

  /* Filtering the tasks based on whether they are done or not. */
  const incompleteTasks = tasks.filter((task) => !task.done);
  const completeTasks = tasks.filter((task) => task.done);

  const totalIncompleteTasks = totalTasks.filter((task) => !task.done);
  const totalCompleteTasks = totalTasks.filter((task) => task.done);

  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", width: "100%" }}>
        <input
          className="fa fa-search"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          style={{ flexGrow: 1 }} // change the inline style from 100% to flexGrow: 1
          placeholder="What's your agenda for today?"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleAddTask();
            }
          }}
        />
        <button
          onClick={handleAddTask}
          style={{
            background: "#A68BFA",
            color: "whitesmoke",
            borderRadius: "5px",
            marginInline: "5px",
            border: "none",
            height: "30px",
            width: "40px",
          }}
        >
          Add
        </button>
      </div>
      <ul style={{ listStyleType: "none", padding: 5, margin: 5 }}>
        {tasks.length === 0 ? (
          <div>
            <li style={{ fontSize: "15px", color: "rebeccapurple" }}>
              {" "}
              You have no pending tasks!
            </li>
            {/* add a space seperator */}
            <p>
              {" "}
              <b>Note:</b>
              <li style={{ fontSize: "15px", background: "#F1FDF9" }}>
                {" "}
                Click on the task to mark it as done.
              </li>
              <li style={{ fontSize: "15px", background: "#FFF2F9" }}>
                {" "}
                Click on the trash icon to clear all tasks.
              </li>
            </p>
          </div>
        ) : (
          tasks
            .slice()
            .reverse()
            .map((task) => (
              <li
                key={task.id}
                onClick={() => handleToggleDone(task.id)}
                style={{
                  textDecoration: task.done ? "line-through" : "none",
                  color: task.done ? "black" : "black",
                  cursor: "pointer",
                  fontSize: "20px",
                  backgroundColor: task.done ? "#F1FDF9" : "#FFF2F9",
                  borderRadius: "5px",
                  padding: "5px",
                  margin: "5px",
                }}
              >
                {task.text}
              </li>
            ))
        )}
      </ul>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "10px",
        }}
      >
        <span
          style={{ fontSize: "18px", fontWeight: "bold", marginRight: "10px" }}
        >
          <FontAwesomeIcon
            icon={faTimes}
            style={{ color: "red", marginRight: "5px" }}
          />
          TODO: {incompleteTasks.length}
        </span>
        <span
          style={{ fontSize: "18px", fontWeight: "bold", marginRight: "10px" }}
        >
          <FontAwesomeIcon
            icon={faCheck}
            style={{ color: "green", marginRight: "5px" }}
          />
          DONE: <span className="done-count">{completeTasks.length}</span>
        </span>
        <FontAwesomeIcon
          icon={faTrashRestore}
          style={{
            color: "red",
            cursor: "pointer",
            height: "20px",
            width: "20px",
          }}
          onClick={handleClearTasks}
        />
      </div>

      {showConfirmation ? (
        <div>
          <p>Are you sure you want to clear all tasks?</p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "center",
              marginTop: "10px",
            }}
          >
            <button onClick={handleConfirmClearTasks}>Confirm</button>
            <button onClick={handleCancelClearTasks}>Cancel</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* Exporting the TodoList component so that it can be imported in other files. */
export default TodoList;
