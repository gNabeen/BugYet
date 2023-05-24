import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { saveAs } from "file-saver";
import {
  FaDownload,
  FaFileAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { sendNotification } from "../notification";

import {
  Button,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Skeleton
} from "@mui/material";

// import bookmarks from "../bookmark";

const SubdomainFinder = () => {
  /* Declaring the state variables. */
  const [domain, setDomain] = useState("");
  const [subdomains, setSubdomains] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [tempPage, setTempPage] = useState("");
  const [pages, setPages] = useState([]);
  const inputRef = useRef(null);

  const [openBookmarksDialog, setOpenBookmarksDialog] = useState(false);
  

  const [bookmarks, setBookmarks] = useState(
    JSON.parse(localStorage.getItem("bookmarks")) || []
  );

  // Add useCallback to handleDomainClick
  const handleDomainClick = useCallback(
    (domain) => {
      setDomain(domain);
      setOpenBookmarksDialog(false);
    },
    [setDomain, setOpenBookmarksDialog]
  );

  const [searchTerm, setSearchTerm] = useState(
    /* Setting the initial state of the filteredSubdomains
    variable to an empty array. */
    ""
  );
  const [filteredSubdomains, setFilteredSubdomains] = useState([]);

  /* This is a React hook that is used to perform side effects. In this case, it is used to set the
Authorization header of the axios instance to the JWT token stored in the cookies. */
  useEffect(() => {
    const jwt = Cookies.get("jwt");
    if (jwt) {
      axios.defaults.headers.common.Authorization = `${jwt}`;
    }
  }, []);

  // Save the number of times the task has been run
  function saveTaskCount(count) {
    localStorage.setItem("subdomainFinderTaskCount", parseInt(count));
  }

  // Retrieve the number of times the task has been run
  function getTaskCount() {
    return parseInt(localStorage.getItem("subdomainFinderTaskCount") || 0);
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
   * It runs the task, sets the error to an empty string, sets the loading state to true, sets the
   * subdomains to an empty array, sets the pages to an empty array, gets the JWT from the cookies,
   * checks if the JWT exists, if it doesn't, it sets the error to 'You are not logged in.' and sets the
   * loading state to false, if it does, it makes a POST request to the API endpoint, sets the subdomains
   * to the response data, and sets the loading state to false. If there's an error, it logs the error,
   * sets the error to 'There was an error fetching the subdomains. Please try again later.', and sets
   * the loading state to false
   * @param event - The event that triggered the function.
   * @returns The subdomains are being returned.
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    // Run the task
    runTask();
    setError("");
    setIsLoading(true);
    setSubdomains([]);
    setPages([]);
    /* Getting the JWT token from the cookies. */
    const jwt = Cookies.get("jwt");
    if (!jwt) {
      setError("You are not logged in.");
      setIsLoading(false);
      return;
    }
    axios
      .post("https://bugyet.repl.co/subdomainfinder", { domain })
      .then((response) => {
        const subdomains = response.data.subdomains;
        setSubdomains(subdomains);
        setIsLoading(false);
        let token = Cookies.get("jwt");
        try {
          const notificationData = {
            title: "New Scan",
            message: "Subdomain Scan Completed",
            feature: "subdomainScanner"
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
          "There was an error fetching the subdomains. Please try again later."
        );
        setIsLoading(false);
      });
  };

  const handleLabelClick = () => {
    inputRef.current.focus();
  };

  /**
   * It takes the array of subdomains and joins them together with a newline character, then creates a
   * new Blob object with the subdomain string and the type of text/plain, and then saves the file as
   * subdomains.txt
   */
  const downloadSubdomains = () => {
    const subdomainString = subdomains.join("\n");
    const file = new Blob([subdomainString], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(file, "subdomains.txt");
  };
  /**
   * It creates a new Blob object, which is a file-like object of immutable, raw data, and opens it in a
   * new tab
   */
  const previewSubdomains = () => {
    const subdomainString = subdomains.join("\n");
    const file = new Blob([subdomainString], {
      type: "text/plain;charset=utf-8",
    });
    window.open(URL.createObjectURL(file), "_blank");
  };

  /**
   * UseCleanup is a React hook that takes a callback function and returns a cleanup function that will
   * be called when the component unmounts.
   * @param callback - A function that will be called when the component is unmounted.
   */
  const useCleanup = (callback) => {
    useEffect(() => {
      return () => {
        callback();
      };
    }, []);
  };

  /* A React hook that takes a callback function and returns a cleanup function that will
be called when the component unmounts. */
  useCleanup(() => {
    setSubdomains([]);
    setError("");
    setPages([]);
  });

  /* Calculating the number of pages that will be needed to display all the subdomains. */
  const pageSize = 20;
  const pageCount = Math.ceil(subdomains.length / pageSize);

  /**
   * It sets the tempPage state to the value of the input field.
   * @param event - The event object that is passed to the event handler.
   */
  const handleCurrentPageInputChange = (event) => {
    setTempPage(event.target.value);
  };

  /**
   * If the user presses the Enter key, then check if the page number is valid, and if it is, then set
   * the page to that number
   * @param event - The event object that was triggered by the user.
   */
  const handleCurrentPageInputKeyPress = (event) => {
    if (event.key === "Enter") {
      const pageNumber = parseInt(tempPage);
      if (pageNumber > 0 && pageNumber <= pageCount) {
        setPage(pageNumber);
      } else {
        // Display an error message or do nothing
      }
    }
  };

  /**
   * We're using the `useEffect` hook to set the `tempPage` state variable to the `page` state variable
   */
  useEffect(() => {
    setTempPage(page);
  }, [page]);

  /**
   * If the page is greater than 1, then set the page to the previous page
   */
  const handlePreviousPageClick = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  /**
   * If the current page is less than the total number of pages, then increment the current page by 1
   */
  const handleNextPageClick = () => {
    if (page < pageCount) {
      setPage(page + 1);
    }
  };

  /* Filtering the subdomains based on the search term. */
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSubdomains(subdomains);
    } else {
      setFilteredSubdomains(
        subdomains.filter((subdomain) => subdomain.includes(searchTerm))
      );
    }
  }, [searchTerm, subdomains]);

  return (
    <div className="subdomain-finder">
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          id="domain"
          value={domain}
          onChange={(event) => setDomain(event.target.value)}
        />
        <button type="submit" disabled={isLoading}>
          Find Subdomains
        </button>
      </form>

      {/* Add the Bookmarks button */}
      <Button
        onClick={() => setOpenBookmarksDialog(true)}
        variant="contained"
        style={{ marginTop: "10px" }}
      >
        Show Bookmarks
      </Button>
      
      {error && <p className="error">{error}</p>}
      {!isLoading && subdomains.length > 0 && (
        <div className="subdomains">
          <table className="subdomain-table">
            <thead>
              <tr>
                <th>
                  <div className="search-bar">
                    <input
                      type="text"
                      placeholder="Search subdomains"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSubdomains.length > 0 ? (
                filteredSubdomains
                  .slice(pageSize * (page - 1), pageSize * page)
                  .map((subdomain, index) => (
                    <tr key={index}>
                      <td>{subdomain}</td>
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

          <div className="pagination">
            <div className="pagination-left">
              <FaDownload onClick={downloadSubdomains} />
              <FaFileAlt onClick={previewSubdomains} />
            </div>
            <div className="pagination-center">
              <FaChevronLeft onClick={() => handlePreviousPageClick()} />
              <div className="pagination-middle">
                <input
                  type="text"
                  value={tempPage}
                  onChange={handleCurrentPageInputChange}
                  onKeyPress={handleCurrentPageInputKeyPress}
                />
                <span> / </span>
                <input type="text" value={pageCount} disabled />
              </div>
              <FaChevronRight onClick={() => handleNextPageClick()} />
              <div className="pagination-right">
                {subdomains.length} results
              </div>
            </div>
          </div>
        </div>
      )}
      {isLoading && (
        <table className="subdomain-table skeleton-table">
          <tbody>
            {[...Array(pageSize+1)].map((_, index) => (
              <tr key={index}>
                <td>
                  <Skeleton variant="text" width="100%" height={25} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {/* Add the bookmarks dialog */}
      <Dialog
        open={openBookmarksDialog}
        onClose={() => setOpenBookmarksDialog(false)}
      >
        <DialogTitle>Saved Domains</DialogTitle>
        <List>
          {bookmarks.map((domain, index) => (
            <ListItem button key={index} onClick={() => handleDomainClick(domain)}>
              <ListItemText>{domain}</ListItemText>
            </ListItem>
          ))}
        </List>
      </Dialog>
    </div>
  );
};

/* Exporting the SubdomainFinder component so that it can be imported in other files. */
export default SubdomainFinder;
