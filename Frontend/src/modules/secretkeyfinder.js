import React, { useState } from "react";
import styled from "@emotion/styled";
import {
    CircularProgress, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper,
    Tooltip, IconButton, Button
} from "@mui/material";
import PublishIcon from "@mui/icons-material/Publish";
import { spacing } from "@mui/system";
import FileCopyIcon from "@mui/icons-material/FileCopy";

const Dropzone = styled('div')({
    alignItems: "center",
    border: "2px dashed #6c757d",
    borderRadius: "5px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minHeight: "200px",
    padding: "20px",
    textAlign: "center",
    '&:hover': {
        cursor: "pointer",
    },
});

const FileList = styled('ul')({
    listStyle: "none",  // Remove the list-style to get rid of empty spaces before each item
    paddingLeft: 0,     // Remove left padding
    margin: 0,          // Remove margins
});

const ButtonContainer = styled('div')({
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '20px', // Optional: add margin at the bottom for spacing
});

const ResultTable = styled(TableContainer)(({ theme }) => ({
    marginTop: spacing(2),
}));

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
};

function SecretKeyFinder() {
    const regexPatterns = {
        Email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
        GitHubToken: /ghp_[A-Za-z0-9_]{36}/,
        OpenAIKey: /sk-[a-zA-Z0-9]{32}/,
        AWSAccessKeyId: /(?:\b|[^a-zA-Z0-9])(AKIA[0-9A-Za-z]{16})(?:\b|[^a-zA-Z0-9])/,
        AWSSecretKey: /(?:\b|[^a-zA-Z0-9])([0-9a-zA-Z/+]{40})(?:\b|[^a-zA-Z0-9])/,
        GoogleAPIKey: /(?:\b|[^a-zA-Z0-9])(AIza[0-9A-Za-z-_]{35})(?:\b|[^a-zA-Z0-9])/,
        AdafruitIOKey: /(?:\b|[^a-zA-Z0-9])(aio_[a-zA-Z0-9]{14})(?:\b|[^a-zA-Z0-9])/,
        StripeAPIKey: /(?:\b|[^a-zA-Z0-9])((?:sk|pk)_[a-zA-Z0-9]{24})(?:\b|[^a-zA-Z0-9])/,
        AdobeClientID: /(?:\b|[^a-zA-Z0-9])([0-9A-Za-z]{24})(?:\b|[^a-zA-Z0-9])/,
        AdobeClientSecret: /(?:\b|[^a-zA-Z0-9])([0-9a-zA-Z]{32})(?:\b|[^a-zA-Z0-9])/,
        AirtableAPIKey: /key[a-zA-Z0-9]{14}/,
        AlgoliaAPIKey: /(?:\b|[^a-zA-Z0-9])([0-9a-zA-Z]{20})(?:\b|[^a-zA-Z0-9])/,
        AlibabaAccessKeyID: /(?:\b|[^a-zA-Z0-9])(LTAI[0-9A-Za-z]{16})(?:\b|[^a-zA-Z0-9])/,
        AlibabaSecretKey: /(?:\b|[^a-zA-Z0-9])([0-9a-zA-Z/+]{40})(?:\b|[^a-zA-Z0-9])/,
        AsanaClientID: /(?:\b|[^a-zA-Z0-9])([0-9]{12})(?:\b|[^a-zA-Z0-9])/,
        AsanaClientSecret: /(?:\b|[^a-zA-Z0-9])([0-9a-zA-Z]{32})(?:\b|[^a-zA-Z0-9])/,
        BitbucketClientID: /(?:\b|[^a-zA-Z0-9])([0-9A-Za-z]{15})(?:\b|[^a-zA-Z0-9])/,
        BitbucketClientSecret: /(?:\b|[^a-zA-Z0-9])([0-9a-zA-Z]{35})(?:\b|[^a-zA-Z0-9])/,
        DropboxAPISecret: /(?:\b|[^a-zA-Z0-9])([0-9a-z]{15})(?:\b|[^a-zA-Z0-9])/,

    };

    const [uploadedFiles, setUploadedFiles] = useState(null);
    const [keysFound, setKeysFound] = useState([]);

    const handleFileUpload = (event) => {
        setUploadedFiles(event.target.files);
    };

    const processFiles = async () => {
        let foundKeys = [];

        for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            const text = await file.text();

            for (const [keyType, regex] of Object.entries(regexPatterns)) {
                const matches = text.match(regex);

                if (matches) {
                    foundKeys.push({
                        keyType,
                        keyValue: matches[0],
                        fileName: file.name, // Add the file name to the data structure
                    });
                }
            }
        }

        setKeysFound(foundKeys);
    };

    const [isLoading, setIsLoading] = useState(false);

    const inputFileRef = React.createRef();

    const handleDrop = (event) => {
        event.preventDefault();
        setUploadedFiles(event.dataTransfer.files);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const triggerFilePicker = () => {
        inputFileRef.current.click();
    };

    const downloadTableAsText = () => {
        const rows = keysFound.map((key) => `${key.keyType}: ${key.keyValue}`);
        const content = rows.join("\n");
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "keys_found.txt";
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <Dropzone
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <input
                    ref={inputFileRef}
                    type="file"
                    onChange={handleFileUpload}
                    multiple
                    hidden
                />
                <PublishIcon fontSize="large" />
                {uploadedFiles && uploadedFiles.length > 0 ? (
                    <div>
                        <p>Selected Files ({uploadedFiles.length}):</p>
                        <FileList>
                            {Array.from(uploadedFiles).map((file, index) => (
                                <li key={index}>{file.name}</li>
                            ))}
                        </FileList>
                    </div>
                ) : (
                    <p>
                        Drag & Drop your files or{" "}
                        <span
                            style={{ textDecoration: "underline", cursor: "pointer" }}
                            onClick={triggerFilePicker}
                        >
                            browse
                        </span>
                    </p>
                )}
            </Dropzone>
            <ButtonContainer>
                <Button onClick={processFiles} variant="contained" color="primary">
                    Scan Files
                </Button>
            </ButtonContainer>
            {/* Show CircularProgressIndicator from Material-UI while isLoading */}
            {isLoading && <CircularProgress />}
            {/* Display found keys in a Table */}

            {keysFound.length > 0 && (
                <Button variant="contained" color="primary" onClick={downloadTableAsText}>
                    Download
                </Button>
            )}

            <ResultTable component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Key Type</TableCell>
                            <TableCell>Key Value</TableCell>
                            <TableCell>File Name</TableCell> {/* Add a new header cell for file name */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {keysFound.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    No match found
                                </TableCell>
                            </TableRow>
                        )}
                        {keysFound.map((key, index) => (
                            <TableRow key={index}>
                                <TableCell>{key.keyType}</TableCell>
                                <TableCell>
                                    {key.keyValue}{" "}
                                    <Tooltip title="Copy to clipboard" arrow>
                                        <IconButton
                                            size="small"
                                            onClick={() => copyToClipboard(key.keyValue)}
                                        >
                                            <FileCopyIcon fontSize="inherit" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>{key.fileName}</TableCell> {/* Add a new cell for file name */}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ResultTable>

        </div>
    );
}

export default SecretKeyFinder;