import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { useMediaQuery, useTheme, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
// styled and paper import
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";

import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const initialData = {
  labels: [
    "Subdomain",
    "Reachability",
    "DNS",
    "Port",
    "Technology",
    "Secret Key"
  ],
  datasets: [
    {
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: ["red", "green", "blue", "orange", "purple", "yellow"],
    },
  ],
};

const initialData_totalTasks = {
  labels: ["Total tasks added", "Completed tasks"],
  datasets: [
    {
      data: [0, 0],
      backgroundColor: ["orange", "green"],
    },
  ],
};

function Summary() {
  const [data, setData] = useState(initialData);
  const [totalTasks, setTotalTasks] = useState(initialData_totalTasks);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery('(max-width: 1000px)');

  useEffect(() => {
    const subdomainFinderTaskCount = parseInt(localStorage.getItem("subdomainFinderTaskCount")) || 0;
    const domainReachabilityTaskCount = parseInt(localStorage.getItem("domainReachabilityTaskCount")) || 0;
    const dnsScannerTaskCount = parseInt(localStorage.getItem("dnsScannerTaskCount")) || 0;
    const portScannerTaskCount = parseInt(localStorage.getItem("portScannerTaskCount")) || 0;
    const TechnologyTaskCount = parseInt(localStorage.getItem("TechnologyTaskCount")) || 0;
    const secretKeyTaskCount = parseInt(localStorage.getItem("SecretKeyTask")) || 0;


    setData({
      labels: [
        "Subdomain",
        "Reachability",
        "DNS",
        "Port",
        "Technology",
        "Secret Key"
      ],
      datasets: [
        {
          data: [
            subdomainFinderTaskCount,
            domainReachabilityTaskCount,
            dnsScannerTaskCount,
            portScannerTaskCount,
            TechnologyTaskCount,
            secretKeyTaskCount
          ],
          backgroundColor: ["red", "green", "blue", "orange", "purple", "yellow"],
        },
      ],
    });
  }, []);

  useEffect(() => {
    const totalTasks = JSON.parse(localStorage.getItem("totalTasks")) || [];
    const totalTasksCount = totalTasks.length;
    const doneTasksCount = totalTasks.filter((task) => task.done).length;

    setTotalTasks({
      labels: ["Total tasks added", "Completed tasks"],
      datasets: [
        {
          data: [totalTasksCount, doneTasksCount],
          backgroundColor: ["orange", "green"],
        },
      ],
    });
  }, []);

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    color: theme.palette.text.secondary,
    margin: theme.spacing(1),
    boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.2)",
    border: "1px solid #e0e0e0",
    overflowX: "scroll",
    overflowY: "scroll",
    display: "flex",
    // maxBlockSize: "500px",
  }));

  const options = {
    plugins: {
      datalabels: {
        display: (context) => context.dataset.data[context.dataIndex] !== 0,
        color: "#fff",
        font: {
          size: 16,
        },
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          if (total === 0) {
            return '0%';
          }

          const percentage = (value * 100) / total;
          return percentage.toFixed(1) + '%';
        },
      },
      legend: {
        display: true,
        position: "right",
        fullWidth: false,
        align: "end",
        labels: {
          boxWidth: 10,
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    },
    elements: {
      arc: {
        borderWidth: 0,
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  const TaskSummary = () => {
    const taskTypes = data.labels.map((label, index) => ({
      name: label,
      count: data.datasets[0].data[index],
    }));

    return (
      <>
        {taskTypes.map((task, index) => (
          <Typography key={index} variant="body1">
            {task.name}: {task.count}
          </Typography>
        ))}
      </>

    );
  };
  const AgendaSummary = () => {
    const totalTasksAdded = totalTasks.datasets[0].data[0];
    const completedTasks = totalTasks.datasets[0].data[1];

    return (
      <>
        <Typography variant="body1">
          Total tasks added: {totalTasksAdded}
        </Typography>
        <Typography variant="body1">
          Completed tasks: {completedTasks}
        </Typography>
      </>
    );
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Box
            component="div"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <Typography
              component="h3"
              variant="h5"
              sx={{
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.1rem",
                borderBottom: "2px solid",
                borderColor: theme.palette.primary.main,
                marginBottom: "0.5rem",
              }}
            >
              Task Summary
            </Typography>
          </Box>
          <div
            style={{
              maxHeight: isSmallScreen ? "auto" : "450px",
              height: isSmallScreen ? "auto" : "450px",
            }}
          >
            <Card>
              <CardContent>
                <div
                  style={{
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#1A2027" : "#fff",
                    maxWidth: "500px",
                    maxHeight: isSmallScreen ? "auto" : "450px",
                    width: "100%",
                    height: isSmallScreen ? "auto" : "450px",
                    margin: "0 auto",
                  }}
                >
                  {isSmallScreen ? <TaskSummary /> : <Pie data={data} options={options} />}
                </div>
              </CardContent>
            </Card>
          </div>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box
            component="div"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <Typography
              component="h3"
              variant="h5"
              sx={{
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.1rem",
                borderBottom: "2px solid",
                borderColor: theme.palette.primary.main,
                marginBottom: "0.5rem",
              }}
            >
              Agenda Summary
            </Typography>
          </Box>
          <div
            style={{
              maxHeight: isSmallScreen ? "auto" : "450px",
              height: isSmallScreen ? "auto" : "450px",
            }}
          >
            <Card>
              <CardContent>
                <div
                  style={{
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#1A2027" : "#fff",
                    maxWidth: "500px",
                    maxHeight: isSmallScreen ? "auto" : "450px",
                    width: "100%",
                    height: isSmallScreen ? "auto" : "450px",
                    margin: "0 auto",
                  }}
                >
                  {isSmallScreen ? <AgendaSummary /> : <Pie data={totalTasks} options={options} />}
                </div>
              </CardContent>
            </Card>
          </div>
        </Grid>
      </Grid>
    </>
  );
}

export default Summary;