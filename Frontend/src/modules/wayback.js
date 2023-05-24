import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    List,
    ListItem,
    InputAdornment,
    Typography,
    CircularProgress,
    IconButton,
    Pagination,
    Divider,
    Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import DownloadIcon from '@mui/icons-material/Download';

const WaybackArchive = () => {
    const [search, setSearch] = useState('');
    const [itemSearch, setItemSearch] = useState('');
    const [links, setLinks] = useState([]);
    const [filteredLinks, setFilteredLinks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const fetchArchiveLinks = async (domain) => {
        if (!domain) {
            setLinks([]);
            return;
        }

        setLoading(true);

        try {
            const apiUrl = `https://bugyet.repl.co/wayback?domain=${domain}`;
            const response = await axios.get(apiUrl, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = response.data;
            data.shift();

            const uniqueLinks = Array.from(new Set(data.map(JSON.stringify))).map(JSON.parse);

            const filteredLinks = uniqueLinks.filter((link) => {
                const url = new URL(link[0]);
                return url.searchParams.toString().length > 0;
            });

            setLinks(filteredLinks);
        } catch (error) {
            console.error('Error fetching archive links:', error);
            setLinks([]);
        } finally {
            setLoading(false);
            setCurrentPage(1);
        }
    };

    const downloadUrlList = () => {
        if (links.length === 0) {
            return;
        }

        const content = links.map(([url]) => url).join('\n');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const href = URL.createObjectURL(blob);
        let link = document.createElement('a');
        link.href = href;
        link.download = 'wayback-archive-links.txt';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const applySearchFilter = () => {
        if (!itemSearch) {
            setFilteredLinks(links);
            return;
        }
        const filtered = links.filter(([url]) => url.toLowerCase().includes(itemSearch.toLowerCase()));
        setFilteredLinks(filtered);
    };

    useEffect(() => {
        applySearchFilter();
    }, [links, itemSearch]);

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    };

    const handleItemSearchChange = (event) => {
        setItemSearch(event.target.value);
    };

    const handleSearchKeyPress = (event) => {
        if (event.key === 'Enter') {
            fetchArchiveLinks(search);
        }
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const sliceStart = (currentPage - 1) * itemsPerPage;
    const sliceEnd = currentPage * itemsPerPage;
    const paginatedLinks = filteredLinks.slice(sliceStart, sliceEnd);

    return (
        <div>
            <h2>Wayback Archive Links with Parameters</h2>
            <Box sx={{ marginBottom: 2 }}>
                <TextField
                    variant="outlined"
                    size="small"
                    type="search"
                    value={search}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyPress}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    placeholder="Search by domain (e.g., csulb.edu)"
                />
            </Box>
            {links.length > 0 && (
                <Grid container alignItems="center" sx={{ marginBottom: 2 }}>
                    <Grid item xs={11.5}>
                        <TextField
                            variant="outlined"
                            size="small"
                            type="search"
                            value={itemSearch}
                            onChange={handleItemSearchChange}
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            placeholder="Search items in the list"
                        />
                    </Grid>
                    <Grid item xs={0.5} display="flex" justifyContent="flex-end">
                        <IconButton onClick={downloadUrlList}>
                            <DownloadIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            )}
            {loading ? (
                <Box display="flex" justifyContent="center" py={2}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <List>
                        {paginatedLinks.map(([url], index) => (
                            <React.Fragment key={index}>
                                <ListItem>
                                    <Box>
                                        <Typography
                                            component="a"
                                            variant="body1"
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {url}
                                        </Typography>
                                    </Box>
                                </ListItem>
                                {index < paginatedLinks.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                    {links.length > itemsPerPage && (
                        <Box display="flex" justifyContent="center" py={2}>
                            <Pagination
                                count={Math.ceil(links.length / itemsPerPage)}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                            />
                        </Box>
                    )}
                </>
            )}
        </div>
    );
};

export default WaybackArchive;