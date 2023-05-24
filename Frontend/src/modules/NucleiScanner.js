import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    TextField,
    Typography,
    InputAdornment,
    IconButton,
    CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const NucleiScanner = () => {
    const [domain, setDomain] = useState('');
    const [scanResults, setScanResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const sourceRef = useRef(null);

    const handleDomainChange = (event) => {
        setDomain(event.target.value);
    };

    const handleScan = () => {
        if (!domain) {
            return;
        }

        if (sourceRef.current) {
            sourceRef.current.close();
        }

        setLoading(true);
        setScanResults([]);
        const apiUrl = `https://bugyet.repl.co/nuclei?domain=${domain}`;

        sourceRef.current = new EventSource(apiUrl);
        sourceRef.current.addEventListener('message', (event) => {
            setScanResults((prevResults) => [...prevResults, event.data]);
        });

        sourceRef.current.addEventListener('error', () => {
            sourceRef.current.close();
        });

        sourceRef.current.addEventListener('end', () => {
            // setLoading(false);
            sourceRef.current.close();
        });
    };

    const handleDomainKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleScan();
        }
    };

    useEffect(() => {
        return () => {
            if (sourceRef.current) {
                sourceRef.current.close();
            }
        };
    }, []);

    const renderScanResults = () => {
        return scanResults.map((result, index) => (
            <Typography key={index}>{result}</Typography>
        ));
    };

    return (
        <div>
            <h2>Nuclei Scanner</h2>
            <Box sx={{ marginBottom: 2 }}>
                <TextField
                    variant="outlined"
                    size="small"
                    type="search"
                    value={domain}
                    onChange={handleDomainChange}
                    onKeyDown={handleDomainKeyPress}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    placeholder="Enter domain (e.g., example.com)"
                />
            </Box>
            <Box>
                <IconButton onClick={handleScan}>
                    <SearchIcon />
                </IconButton>
            </Box>
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                    <CircularProgress />
                </Box>
            )}
            <Box sx={{ marginTop: loading ? 0 : 2 }}>{renderScanResults()}</Box>
        </div>
    );
};

export default NucleiScanner;