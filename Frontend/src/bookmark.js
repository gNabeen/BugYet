import React, { useState } from "react";
import {
    Box,
    Button,
    FormControlLabel,
    Radio,
    RadioGroup,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Paper,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import { Link } from "react-router-dom";

const Bookmark = () => {
    const [fileContent, setFileContent] = useState("");
    const [manualInput, setManualInput] = useState("");
    const [inputMethod, setInputMethod] = useState("manual");
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    const [editingIndex, setEditingIndex] = useState(-1);
    const [editedValue, setEditedValue] = useState("");

    const [bookmarks, setBookmarks] = useState(() => {
        const savedBookmarks = localStorage.getItem("bookmarks");
        return savedBookmarks ? JSON.parse(savedBookmarks) : [];
    });

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            setFileContent(content);
        };
        reader.readAsText(file);
    };

    const saveBookmarks = () => {
        const domainsFromFile = fileContent.trim().split("\n");
        const manualDomains = manualInput.trim().split("\n");
        const allDomains = [...domainsFromFile, ...manualDomains].filter(
            (domain) => domain.trim() !== ""
        );
        setBookmarks((prevBookmarks) => {
            const newBookmarks = [...allDomains, ...prevBookmarks];
            localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
            return newBookmarks;
        });
        setFileContent("");
        setManualInput("");
    };

    const deleteBookmark = (index) => {
        setBookmarks((prevBookmarks) => {
            const newBookmarks = prevBookmarks.filter((_, idx) => idx !== index);
            localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
            return newBookmarks;
        });
    };

    const clearAllBookmarks = () => {
        setBookmarks([]);
        localStorage.removeItem("bookmarks");
    };
    
    const handleClearAllBookmarks = () => {
        setOpenConfirmDialog(true);
    };

    const startEdit = (index, domain) => {
        setEditingIndex(index);
        setEditedValue(domain);
    };

    const saveEdit = (index) => {
        setBookmarks((prevBookmarks) => {
            const newBookmarks = prevBookmarks.map((bookmark, idx) =>
                idx === index ? editedValue : bookmark
            );
            localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
            return newBookmarks;
        });
        setEditingIndex(-1);
        setEditedValue("");
    };

    return (
        <Box>
            <h1>Bookmark Page</h1>
            <RadioGroup
                row
                value={inputMethod}
                onChange={(e) => setInputMethod(e.target.value)}
            >
                <FormControlLabel
                    value="manual"
                    control={<Radio />}
                    label="Manual Input"
                />
                <FormControlLabel
                    value="file"
                    control={<Radio />}
                    label="File Upload"
                />
            </RadioGroup>
            {inputMethod === "manual" ? (
                <TextField
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    label="Enter domain names (one per line)"
                    multiline
                    fullWidth
                />
            ) : (
                <Box>
                    <label>Upload a text file with domain names (one per line):</label>
                    <input
                        type="file"
                        accept=".txt"
                        onChange={handleFileUpload}
                        style={{ marginLeft: "10px" }}
                    />
                </Box>
            )}

            {/* save button on the right */}
            <Box my={2} display="flex" justifyContent="flex-end">
                <Button onClick={saveBookmarks} variant="contained">
                    Save
                </Button>
            </Box>

            {/* <Box my={2}>
                <Button onClick={handleClearAllBookmarks} variant="contained">
                    Clear All
                </Button>
            </Box> */}

            {/* show clear all button only when bookmarks count is no zero */}
            {bookmarks.length > 0 && (
                <Box my={2}>
                    <Button onClick={handleClearAllBookmarks} variant="contained">
                        Clear All
                    </Button>
                </Box>
            )}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Domain Name</TableCell>
                            <TableCell>Edit</TableCell>
                            <TableCell>Delete</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bookmarks.map((domain, index) => (
                            <TableRow key={index}>
                                {editingIndex === index ? (
                                    <TableCell>
                                        <TextField
                                            value={editedValue}
                                            onChange={(e) => setEditedValue(e.target.value)}
                                        />
                                    </TableCell>
                                ) : (
                                    <TableCell>{domain}</TableCell>
                                )}
                                <TableCell>
                                    {editingIndex === index ? (
                                        <Button onClick={() => saveEdit(index)}>Save</Button>
                                    ) : (
                                        <Button onClick={() => startEdit(index, domain)}>Edit</Button>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Button onClick={() => deleteBookmark(index)}>X</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog
                open={openConfirmDialog}
                onClose={() => setOpenConfirmDialog(false)}
            >
                <DialogTitle>Confirm Clearing All Bookmarks</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to clear all bookmarks? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirmDialog(false)}>Cancel</Button>
                    <Button
                        onClick={() => {
                            clearAllBookmarks();
                            setOpenConfirmDialog(false);
                        }}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            {/* center the return to dashboard */}
            <Box display="flex" justifyContent="center">
                <Link to="/dashboard" style={{ textDecoration: "none" }}>
                    {" "}
                    Return to dashboard{" "}
                </Link>
                </Box>

        </Box>
        
    );
};

export default Bookmark;