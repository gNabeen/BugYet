import React, { useState } from 'react';
// import './keyscanner.css';
import { FaUpload, FaFolderOpen } from 'react-icons/fa';
// import fs from 'fs';
// import path from 'path';

const FilterSource = () => {
    const [keys, setKeys] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scanFileForKeys = (file, keys) => {
        setIsLoading(true);
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
            const fileContent = event.target.result;
            // Search the file content for AWS keys
            const awsKeyRegex = /(?:AWS|aws|Aws)[\s-]*?([A-Z0-9]{20})/g;
            let match;
            while ((match = awsKeyRegex.exec(fileContent))) {
                keys.push({ key: match[1], type: 'AWS' });
            }
            // Search the file content for Google keys
            const googleKeyRegex = /(?:GOOGLE|google|Google)[\s-]*?([A-Za-z0-9_]{32})/g;
            while ((match = googleKeyRegex.exec(fileContent))) {
                keys.push({ key: match[1], type: 'Google' });
            }
            setKeys(keys);
            setIsLoading(false);
        };
        fileReader.readAsText(file);
    };


    const scanDirectoryForKeys = async (reader) => {
        const keys = [];
        for await (const entry of reader) {
            if (entry.isFile) {
                // Check the file extension
                const fileName = entry.name;
                const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
                if (['js', 'py', 'rb', 'php', 'java'].includes(fileExtension)) {
                    // Scan the file for keys
                    scanFileForKeys(entry.file(), keys);
                }
            } else if (entry.isDirectory) {
                // Scan the directory for keys
                const directoryReader = entry.createReader();
                keys.push(...await scanDirectoryForKeys(directoryReader));
            }
        }
        return keys;
    };






    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        setError('');
        setKeys([]);
        try {
            scanFileForKeys(file);
        } catch (error) {
            console.error(error);
            setError('There was an error scanning the file for keys.');
            setIsLoading(false);
        }
    };

    const handleDirectorySelect = async (event) => {
        const entry = event.target.webkitGetAsEntry();
        setIsLoading(true);
        setError('');
        setKeys([]);
        try {
            const reader = entry.createReader();
            const directoryKeys = await scanDirectoryForKeys(reader);
            setKeys(directoryKeys);
        } catch (error) {
            console.error(error);
            setError('There was an error scanning the directory for keys.');
        } finally {
            setIsLoading(false);
        }
    };




    return (
        <div className="keyscanner">
            <h1>Key Scanner</h1>
            <div className="select-container">
                <label htmlFor="file-input" className="btn btn-primary btn-file">
                    <FaUpload /> Select File
                    <input
                        type="file"
                        id="file-input"
                        accept=".txt,.doc,.docx,.pdf"
                        onChange={handleFileSelect}
                    />
                </label>
                <label htmlFor="directory-input" className="btn btn-primary btn-file">
                    <FaFolderOpen /> Select Directory
                    <input
                        type="file"
                        id="directory-input"
                        webkitdirectory=""
                        onChange={handleDirectorySelect}
                    />
                </label>
            </div>
            {isLoading ? (
                <div className="loading">Loading...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : keys.length > 0 ? (
                <ul className="keys-list">
                    {keys.map((key) => (
                        <li key={key}>{key}</li>
                    ))}
                </ul>
            ) : (
                <div className="no-keys">No keys found</div>
            )}
        </div>
    );
};

export default FilterSource;