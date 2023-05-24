import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { saveAs } from "file-saver";
import { Form } from "react-bootstrap";
import { TextField, InputAdornment } from "@mui/material";
import {
  FaDownload,
  FaFileAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { CloudUploadOutlined } from "@mui/icons-material";
import { sendNotification } from "../notification";
import Modal from "react-modal";
Modal.setAppElement("#root");
const PortScanner = () => {
  const [method, setMethod] = useState("comma");
  const [commaDomains, setCommaDomains] = useState("");
  const [fileInput, setFileInput] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [tempPage, setTempPage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  let domainArray;

  /* The above code is using the useEffect hook to check if there is a jwt cookie. If there is a jwt
cookie, it will set the Authorization header to the jwt cookie. */
  useEffect(() => {
    const jwt = Cookies.get("jwt");
    if (jwt) {
      axios.defaults.headers.common.Authorization = `${jwt}`;
    }
  }, []);

  /**
   * `handleFileInputChange` is a function that takes an event as an argument and sets the fileInput
   * state to the first file in the event's target's files array
   * @param event - The event that triggered the function.
   */
  const handleFileInputChange = (event) => {
    const fileInput = event.target.files[0];
    setFileInput(fileInput);
  };
  /* Setting the tempPage to the currentPage. */
  useEffect(() => {
    setTempPage(currentPage);
  }, [currentPage]);
  const checkReachability = () => {
    // create an array of initial result objects with a "status" field set to "fetching"
    const initialResults = domainArray.map((domain) => ({
      domain,
      status: "fetching",
    }));
    setResults(initialResults);

    domainArray.forEach((domain, index) => {
      axios
        .post("https://bugyet.repl.co/portscanner", { domain })
        .then((response) => {
          console.log(response.data);
          // update the result object with the "status" field set to "done"
          const updatedResult = { ...response.data, status: "done" };
          setResults((prevResults) => [
            ...prevResults.slice(0, index),
            updatedResult,
            ...prevResults.slice(index + 1),
          ]);
          let token = Cookies.get("jwt");
          try {
            const notificationData = {
              title: "New Scan",
              message: "Port Scan Completed",
              feature: "portScanner"
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
        })
        .catch((error) => {
          console.error(error);
          setError(
            "There was an error checking the reachability of the domains. Please try again later."
          );
          setIsLoading(false);
        });
    });
    setIsLoading(false);
  };
  // Save the number of times the task has been run
  function saveTaskCount(count) {
    localStorage.setItem("portScannerTaskCount", parseInt(count));
  }

  // Retrieve the number of times the task has been run
  function getTaskCount() {
    return parseInt(localStorage.getItem("portScannerTaskCount") || 0);
  }

  // Increment the task count by 1 and save it
  function incrementTaskCount() {
    const count = getTaskCount();
    saveTaskCount(count + 1);
  }

  // Run the task
  function runTask() {
    incrementTaskCount();
    // Run the "subdomain finder" task here
  }

  /**
   * It takes the user's input, and then runs the task
   * @param event - The event that triggered the function.
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    // Run the task
    runTask();

    setError("");
    setIsLoading(true);
    setResults([]); // reset the results

    // use the selected method to get the list of domains
    if (method === "comma") {
      console.log(commaDomains);
      domainArray = commaDomains.split(",").map((domain) => domain.trim());
      console.log(domainArray);
      try {
        checkReachability();
      } catch (e) {
        console.log(e);
      }
    } else if (method === "file") {
      const reader = new FileReader();
      reader.onload = (event) => {
        domainArray = event.target.result
          .split("\n")
          .map((domain) => domain.trim());
        checkReachability();
      };
      reader.readAsText(fileInput);
    } else if (method === "url") {
      axios
        .get(urlInput)
        .then((response) => {
          domainArray = response.data
            .split("\n")
            .map((domain) => domain.trim());
          checkReachability();
        })
        .catch((error) => {
          console.error(error);
          setError(
            "There was an error checking the ports of the IP(s). Please try again later."
          );
          setIsLoading(false);
        });
    }
  };

  // pagination
  const pageSize = 20;
  const pageCount = Math.ceil(results.length / pageSize);

  /**
   * It takes the value of the input field and sets it to the tempPage variable
   * @param event - The event object that is passed to the event handler.
   */
  const handleCurrentPageInputChange = (event) => {
    setTempPage(event.target.value);
  };

  /**
   * If the user presses the Enter key, then we parse the value of the input field and if it's a valid
   * page number, we set the current page to that value
   * @param event - The event object that was triggered.
   */
  const handleCurrentPageInputKeyDown = (event) => {
    if (event.key === "Enter") {
      const newPage = parseInt(tempPage);
      if (newPage > 0 && newPage <= pageCount) {
        setCurrentPage(newPage);
      }
    }
  };

  /**
   * If the current page is greater than 1, then subtract 1 from the current page
   * @param event - The event object that is passed to the event handler.
   */
  const handlePreviousPageButtonClick = (event) => {
    if (currentPage > 1) {
      setCurrentPage((prevCurrentPage) => parseInt(prevCurrentPage) - 1);
    }
  };

  /**
   * If the current page is less than the total number of pages, then increment the current page by one
   * @param event - The event that triggered the function.
   */
  const handleNextPageButtonClick = (event) => {
    if (currentPage < pageCount) {
      setCurrentPage((prevCurrentPage) => parseInt(prevCurrentPage) + 1);
    }
  };

  const downloadResults = () => {
    // Get the selected columns from the state
    const { domain, statusCode, description } = selectedColumns;
    // Create the CSV string, including only the selected columns
    const csvString = `${domain ? "Domain" : ""}${
      statusCode ? ",Status Code" : ""
    }${description ? ",Description" : ""}\n${results
      .map(
        (result) =>
          `${domain ? `${result.returnDomain}` : ""}${
            statusCode ? `,${result.statusCode}` : ""
          }${description ? `,${result.statusCodeMeaning}` : ""}`
      )
      .join("\n")}`;
    // Create a Blob object with the CSV string as its content
    const file = new Blob([csvString], { type: "text/csv;charset=utf-8" });
    // Save the file using the saveAs function from the FileSaver library
    saveAs(file, "results.csv");
  };

  /**
   * It converts the results array to a CSV string, creates a Blob object with the CSV string as its
   * content, and opens the file in a new window using the URL.createObjectURL function
   */
  const previewResults = () => {
    // Convert the results array to a CSV string
    const csvString = `Domain,Status Code,Description\n${results
      .map(
        (result) =>
          `${result.returnDomain},${result.statusCode},${result.statusCodeMeaning}`
      )
      .join("\n")}`; // Create a Blob object with the CSV string as its content
    const file = new Blob([csvString], { type: "text/csv;charset=utf-8" });
    // Open the file in a new window using the URL.createObjectURL function
    window.open(URL.createObjectURL(file), "_blank");
  };
  /**
   * It renders the pagination buttons
   * @returns a div with a class of pagination. Inside the div, there are two divs with classes of
   * pagination-left and pagination-center. The pagination-left div contains two Font Awesome icons. The
   * pagination-center div contains three Font Awesome icons and a div with a class of pagination-middle.
   * The pagination-middle div contains two input elements
   */
  const renderPaginationButtons = () => {
    return (
      <div className="pagination">
        <div className="pagination-left">
          <FaDownload onClick={openColumnSelectionModal} />
          <FaFileAlt onClick={previewResults} />
        </div>
        <div className="pagination-center">
          <FaChevronLeft onClick={() => handlePreviousPageButtonClick()} />
          <div className="pagination-middle">
            <input
              type="text"
              value={tempPage}
              onChange={(event) => setTempPage(event.target.value)}
              onKeyDown={handleCurrentPageInputKeyDown}
            />
            <span> / </span>
            <input type="text" value={pageCount} disabled />
          </div>
          <FaChevronRight onClick={() => handleNextPageButtonClick()} />
        </div>
      </div>
    );
  };

  /* Filtering the results based on the search term. */
  const filteredResults = searchTerm
    ? results.filter(
        (result) => result.domain && result.domain.includes(searchTerm)
      )
    : results;

  // get the current page of results
  /* Taking the current page and page size and returning the current results. */
  const currentResults = filteredResults.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  /* The above code is using the useState hook to create a state variable called
isColumnSelectionModalOpen and setIsColumnSelectionModalOpen. The state variable
isColumnSelectionModalOpen is set to false and the setIsColumnSelectionModalOpen is a function that
can be used to change the value of isColumnSelectionModalOpen. The same is done for selectedColumns
and setSelectedColumns. */
  const [isColumnSelectionModalOpen, setIsColumnSelectionModalOpen] =
    useState(false);
  const [selectedColumns, setSelectedColumns] = useState({
    domain: true,
    ip: true,
    ports: true,
    hostnames: true,
  });

  /**
   * "When the user clicks the button, open the column selection modal."
   *
   * Now, let's add the `onClick` event handler to the button:
   */
  const openColumnSelectionModal = () => {
    setIsColumnSelectionModalOpen(true);
  };

  /**
   * It sets the `isColumnSelectionModalOpen` state variable to `false`
   */
  const closeColumnSelectionModal = () => {
    setIsColumnSelectionModalOpen(false);
  };

  /**
   * It takes a column name as an argument, and then toggles the value of that column in the
   * selectedColumns object
   * @param column - The column name
   */
  const handleColumnChange = (column) => {
    setSelectedColumns({
      ...selectedColumns,
      [column]: !selectedColumns[column],
    });
  };

  return (
    <div className="container mt-5">
      <Form className="search-form" onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Control
            as="select"
            value={method}
            onChange={(event) => setMethod(event.target.value)}
          >
            <option value="comma">Manual Input</option>
            <option value="url">URL Input</option>
            <option value="file">File Input</option>
          </Form.Control>
        </Form.Group>
        {(method === "comma" || method === "url") && (
          <input
            type="text"
            id={method === "comma" ? "domains" : "urlInput"}
            value={method === "comma" ? commaDomains : urlInput}
            onChange={(event) => {
              if (method === "comma") {
                setCommaDomains(event.target.value);
              } else {
                setUrlInput(event.target.value);
              }
            }}
          />
        )}
        {method === "file" && (
          <TextField
            type="file"
            id="fileInput"
            onChange={handleFileInputChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CloudUploadOutlined />
                </InputAdornment>
              ),
            }}
          />
        )}
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Checking..." : "Port Scan"}
        </button>
      </Form>
      {error && <p className="text-danger">{error}</p>}
      {results.length > 0 && (
        <table className="subdomain-table">
          <thead>
            <tr>
              <th>
                {" "}
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search IPs"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
              </th>
              <th>IP</th>
              <th>Hostnames</th>
              <th>Ports</th>
            </tr>
          </thead>
          <tbody>
            {currentResults.length > 0 ? (
              currentResults.map((result, index) => (
                <tr key={index}>
                  <td>{result.domain}</td>
                  <td>{result.ip}</td>
                  {/* <td>{result.ip}</td> */}
                  {/* loop through results.hostnames and display*/}
                  <td>
                    {result.hostnames && result.hostnames.length > 0
                      ? result.hostnames.map((hostname, index) => (
                          <div key={index}>{hostname}</div>
                        ))
                      : "No records found"}
                  </td>
                  <td>
                    {result.ports && result.ports.length > 0
                      ? result.ports.map((port, index) => (
                          <div key={index}>{port}</div>
                        ))
                      : "No records found"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>
                  <center>No results found</center>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      {results.length > 0 && renderPaginationButtons()}
      <Modal
        style={{
          content: {
            width: "500px",
            height: "400px",
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
          },
        }}
        isOpen={isColumnSelectionModalOpen}
        onRequestClose={closeColumnSelectionModal}
        contentLabel="Column Selection"
      >
        <h2>Select Columns</h2>
        <label>
          <input
            type="checkbox"
            checked={selectedColumns.domain}
            onChange={() => handleColumnChange("domain")}
          />
          Domain
        </label>
        <label>
          <input
            type="checkbox"
            checked={selectedColumns.ip}
            onChange={() => handleColumnChange("ip")}
          />
          IP
        </label>
        <label>
          <input
            type="checkbox"
            checked={selectedColumns.hostnames}
            onChange={() => handleColumnChange("hostnames")}
          />
          Hostnames
        </label>
        <label>
          <input
            type="checkbox"
            checked={selectedColumns.ports}
            onChange={() => handleColumnChange("ports")}
          />
          Ports
        </label>
        <div>
          <>
            <button onClick={downloadResults}>Download</button>
            <button onClick={closeColumnSelectionModal}>Cancel</button>
          </>
        </div>
      </Modal>
    </div>
  );
};

export default PortScanner;
