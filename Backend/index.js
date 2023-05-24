const express = require("express");
const mongodb = require("mongodb");
var bcrypt = require("bcryptjs");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("mongo-sanitize");
const helmet = require("helmet");
// import axios
const axios = require("axios");
const fs = require("fs");
const path = require("path");
// exec
const { child_process, exec, spawn } = require("child_process");
const dns = require("dns");
const AWS = require("aws-sdk");
const { v5: uuidv5 } = require("uuid");
const { createProxyMiddleware } = require('http-proxy-middleware');

// Using a namespace for the UUID
const BUGYET_NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341";
require("dotenv").config();

// Set the AWS credentials using the environment variables.
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Set your region for AWS.SES.
AWS.config.update({ region: "us-west-1" });

// Create a new SES object.
let ses = new AWS.SES({ apiVersion: "2010-12-01" });

app.use(cors());
app.use(helmet());
app.use(express.json());

const port = process.env.PORT || 4000;

// Connect to the MongoDB database using the URI stored in an environment variable
const uri = process.env.MONGODB_URI;
// Connect to the database and create a connection pool
// Connect to the database and create a connection pool
async function connectToDatabase() {
  const client = await mongodb.MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 100, // Set the size of the connection pool
  });
  return client;
}
// Generate a JWT for the user
const generateToken = (user) => {
  // Set the JWT expiration time to 7 days
  const expiresIn = 60 * 60 * 24 * 7;
  // Set the JWT payload to include the user's ID and email
  const payload = {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
  };
  // Sign the JWT with your secret key stored in an environment variable
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  return token;
};

// Create a rate limiter for the /login endpoint
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 5 requests per windowMs
  message: "Too many login attempts, please try again later",
});

// Create a rate limiter for the /reg endpoint
const regLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 2, // limit each IP to 2 requests per windowMs
  message: "Too many registration attempts, please try again later",
});

const sendVerificationEmail = async (email) => {
  // Connect to the MongoDB database
  console.log(email);
  const client = await mongodb.MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = client.db("test");
  const usersCollection = db.collection("users");

  // Find the user in the database
  const user = await usersCollection.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  // // Generate a new JWT token for the user
  // const authToken = generateToken(user);

  // Set the expiration time to 12 hours in the future.
  const expiresIn = 12 * 60 * 60;

  // Create the payload for the JWT token.
  const payload = {
    email: user.email,
  };

  // Get the secret key from the environment variable.
  const secretKey = process.env.JWT_SECRET_PRIVATE_KEY;

  // Sign the JWT token with the secret key.
  const authToken = jwt.sign(payload, secretKey, { expiresIn: expiresIn });

  // Define the email options.
  let params = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `Hello <b>${user.firstname}</b>,<p>Welcome to the <b>BugYet</b> community!</p><p>Verify using this link: https://bugyet.repl.co/verify-email/${authToken}</p>`,
        },
        Text: {
          Charset: "UTF-8",
          Data: `Hello ${user.firsname},\nWelcome to the BugYet community!\nHere is your JWT token: ${authToken}`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Welcome to the BugYet community!",
      },
    },
    Source: "BugYet <no-reply@studyhelp.io>",
  };

  // Send the email.
  ses.sendEmail(params, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      throw new Error("Error sending email");
    } else {
      console.log(data);
    }
  });
};

async function fetchUserDetails(email) {
  const client = await connectToDatabase();
  const db = client.db("test");
  const usersCollection = db.collection("users");
  return usersCollection.findOne({ email });
}

async function verifyToken(req, res, next) {
  // Get the JWT from the request header
  const token = req.headers.authorization;
  console.log(token);
  if (!token) {
    return res.status(401).send({ error: "No token provided" });
  }

  // Verify the JWT with your secret key
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    // Check if the user's email is verified in the JWT
    if (!decoded.emailVerified) {
      console.log("verifytoken");
      console.log(decoded.emailVerified);
      return res
        .status(401)
        .send({
          success: false,
          email: decoded.email,
          message: "Please verify your email before logging in.",
        });
    }
    req.decoded = decoded;
    // Fetch the user's details from the database
    const user = await fetchUserDetails(decoded.email);
    if (!user) {
      return res.status(401).send({ success: false, error: "User not found" });
    }
    // Check if the user's email is verified in the database
    if (!user.emailVerified) {
      return res
        .status(401)
        .send({
          success: false,
          message: "Please verify your email before logging in.",
        });
    }
    // If the JWT and email verification checks pass, call the next middleware function
    next();
  } catch (error) {
    console.error(error);
    // If the JWT is invalid, return an error
    return res.status(401).send({ error: "Invalid token" });
  }
}

async function fetchUser(req, res, next) {
  console.log("called once");
  // Fetch the user's details from the database
  const user = await fetchUserDetails(req.decoded.email);

  if (!user) {
    return res.status(401).send({ success: false, error: "User not found" });
  }
  // If the user is found, store their details in the response object
  res.locals.user = {
    success: true,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname, // [0].toUpperCase(),
    emailVerified: user.emailVerified,
    uuid: user.uuid,
    webhook: user.webhookUrl,
    // etc.
  };
  // Call the next middleware function
  next();
}

function scanPorts(req, res, next) {
  const { domain } = req.body;
  console.log("scanning:" + domain);
  res.locals.domain = domain;
  dns.lookup(domain, async (err, address) => {
    if (err) {
      console.error(err);
      res.locals.ip = "";
    } else {
      res.locals.ip = address;
    }
    // Make an HTTP GET request to the Shodan API
    if (res.locals.ip && res.locals.ip != "") {
      try {
        const response = await axios.get(
          `https://internetdb.shodan.io/${res.locals.ip}`
        );

        // Extract the open ports from the response data
        if (response.status == 200) {
          res.locals.hostnames = response.data["hostnames"];
          res.locals.ip = response.data["ip"];
          res.locals.ports = response.data["ports"];
        } else {
          res.locals.hostnames = ["No Hostnames"];
          res.locals.ip = "No IP";
          res.locals.ports = ["No Ports"];
        }
      } catch (error) {
        console.error(error);
        res.locals.hostnames = ["No Hostnames"];
        res.locals.ip = "No IP";
        res.locals.ports = ["No Ports"];
      }
    } else {
      res.locals.hostnames = ["No Hostnames"];
      res.locals.ip = "No IP";
      res.locals.ports = ["No Ports"];
    }
    // Call the next middleware function
    next();
  });
}

function fetchDnsInfo(req, res, next) {
  const domain = req.body.domain;
  if (!domain) {
    return res
      .status(400)
      .send({ success: false, error: "No domain provided" });
  }
  const dnsInfo = {};
  dnsInfo.domain = domain;
  dns.lookup(domain, (err, address) => {
    if (err) {
      console.error(err);
    } else {
      dnsInfo.ip = address;
    }
    dns.resolveCname(domain, (err, cnames) => {
      if (err) {
        console.error(err);
      } else {
        dnsInfo.cname = cnames;
      }
      dns.resolveMx(domain, (err, mxRecords) => {
        if (err) {
          console.error(err);
        } else {
          dnsInfo.mxRecords = mxRecords;
        }
        dns.resolveTxt(domain, (err, txtRecords) => {
          if (err) {
            console.error(err);
          } else {
            dnsInfo.txtRecords = txtRecords;
          }
          dns.resolveSrv(domain, (err, srvRecords) => {
            if (err) {
              console.error(err);
            } else {
              dnsInfo.srvRecords = srvRecords;
            }
            dns.resolveNs(domain, (err, nsRecords) => {
              if (err) {
                console.error(err);
              } else {
                dnsInfo.nsRecords = nsRecords;
              }
              // Store the DNS info in the res.locals object
              res.locals.dnsInfo = dnsInfo;
              // Call the next middleware function
              next();
            });
          });
        });
      });
    });
  });
}

async function checkDomainReachability(req, res, next) {
  const { domain } = req.body;
  const protocols = ["http", "https"];
  let reachable = false;
  let statusCode = "null";
  let statusCodeMeaning = "Bad request";
  let returnDomain = domain;
  for (const protocol of protocols) {
    try {
      returnDomain = protocol + "://" + domain;
      const response = await axios.get(`${protocol}://${domain}`, {
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          // referred to as 'Referer' in the request from google search
          Referer: "https://www.google.com/",
        },
        timeout: 5000, // 5 seconds timeout
      });
      reachable = true;
      statusCode = response.status;
      statusCodeMeaning = response.statusText;
      break;
    } catch (error) {
      // If the request fails, the domain is not reachable with the current protocol
      if (error.code === "ECONNABORTED") {
        console.error(
          `Request to ${returnDomain} took too long and timed out after 5 seconds`
        );
        reachable = false;
        statusCode = "No response";
        statusCodeMeaning = "Request took too long and timed out";
      } else {
        console.error("response did not timeout");
      }
    } finally {
      // Close any resources that were opened in the try block
      console.error("this is good");
    }
  }
  // Save the reachability information in the response locals object
  res.locals.reachability = {
    returnDomain,
    reachable,
    statusCode,
    statusCodeMeaning,
  };
  // Call the next middleware function
  next();
}

function fetchSubdomains(req, res, next) {
  const domain = req.body.domain;
  let subdomains = [];
  let finished = false;
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().slice(0, 10);

  const currentFilename = `subdomains-archive/${domain}-${formattedDate}.txt`;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayFilename = `subdomains-archive/${domain}-${yesterday
    .toISOString()
    .slice(0, 10)}.txt`;

  if (fs.existsSync(currentFilename)) {
    console.log(`Reading from file: ${currentFilename}`);
    fs.readFile(currentFilename, "utf8", (error, data) => {
      if (error) {
        console.error(`Error reading file: ${error}`);
        return res.status(500).send("Internal Server Error");
      }
      subdomains = data.split("\n").filter((s) => s);
      // Store the subdomains in the res.locals object
      res.locals.subdomains = { total: subdomains.length, subdomains };
      // Call the next middleware function
      next();
    });
  } else if (fs.existsSync(yesterdayFilename)) {
    console.log(`Reading from file: ${yesterdayFilename}`);
    fs.readFile(yesterdayFilename, "utf8", (error, data) => {
      if (error) {
        console.error(`Error reading file: ${error}`);
        return res.status(500).send("Internal Server Error");
      }

      subdomains = data.split("\n").filter((s) => s);
      // Store the subdomains in the res.locals object
      res.locals.subdomains = { total: subdomains.length, subdomains };
      // Call the next middleware function
      next();
    });
  } else {
    // If no recent file is found, run a shell script to find the subdomains and save them in a new file in the "subdomains-archive" directory
    console.log("Scanning for subdomains...");
    try {
      const findSubdomains = spawn("bash/find-subdomains.sh", [
        domain,
        currentFilename,
      ]);
      findSubdomains.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
      });

      findSubdomains.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
      });

      findSubdomains.on("close", (code) => {
        if (code !== 0) {
          console.error(`find-subdomains.sh exited with code ${code}`);
          return res.status(500).send("Internal Server Error");
        }

        fs.readFile(currentFilename, "utf8", (error, data) => {
          if (error) {
            console.error(`Error reading file: ${error}`);
            return res.status(500).send("Internal Server Error");
          }

          subdomains = data.split("\n").filter((s) => s);
          // Store the subdomains in the res.locals object
          res.locals.subdomains = { total: subdomains.length, subdomains };
          // Call the next middleware function
          next();
        });
      });
    } catch (error) {
      console.error(`Subdomain scanning failed: ${error}`);
      return res.status(500).send("Internal Server Error");
    }
  }
}

function fetchTechnology(req, res, next) {
  const domain = req.body.domain;
  // https://tech.bugyet.repl.co/scan?url=
  const url = `https://tech.bugyet.repl.co/scan?url=${domain}`;
  // use axios to fetch the technology data from the API
  axios.get(url).then((response) => {
    // Store the technology data in the res.locals object
    res.locals.technology = response.data;
    // Call the next middleware function
    next();
  });
}

app.post("/login", loginLimiter, async (req, res) => {
  try {
    // Sanitize the user input to prevent injection attacks
    const email = mongoSanitize(req.body.email);
    const password = mongoSanitize(req.body.password);

    if (!email || !password) {
      return res
        .status(400)
        .send({ success: false, error: "Missing required fields" });
    }

    // Connect to the MongoDB database
    const user = await fetchUserDetails(email);
    if (!user) {
      return res
        .status(400)
        .send({ success: false, error: "Incorrect email or password" });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(400)
        .send({ success: false, error: "Incorrect email or password" });
    }
    console.log(user.email);
    console.log(user.emailVerified);

    // Generate a JWT for the user
    const token = generateToken(user);
    // Check if the user's email is verified.
    if (!user.emailVerified) {
      console.log("unverified");
      return res
        .status(401)
        .send({
          success: false,
          message: "Please verify your email before logging in.",
          token: token,
        });
    }

    // Send the JWT in the response
    res.send({ success: true, data: { token } });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, error: "Error logging in" });
  }
});

app.post("/request-verification-email", async (req, res) => {
  try {
    // Sanitize the user input to prevent injection attacks
    const email = mongoSanitize(req.body.email);

    if (!email) {
      return res
        .status(400)
        .send({ success: false, message: "Missing required fields" });
    }

    // Send the verification email
    await sendVerificationEmail(email);

    res.send({ success: true, message: "Verification email sent" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ success: false, error: "Error sending verification email" });
  }
});

app.post("/reg", regLimiter, async (req, res) => {
  try {
    // Sanitize the user input to prevent injection attacks
    const firstname = mongoSanitize(req.body.firstname);
    const lastname = mongoSanitize(req.body.lastname);
    const email = mongoSanitize(req.body.email);
    const password = mongoSanitize(req.body.password);

    if (!firstname || !lastname || !email || !password) {
      return res
        .status(400)
        .send({ success: false, message: "Missing required fields" });
    }

    // Connect to the MongoDB database
    const client = await connectToDatabase();
    const db = client.db("test");
    const usersCollection = db.collection("users");

    // Check if the email is already in use
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .send({ success: false, message: "Email already in use" });
    }

    // Generate a UUID for the new user using UUID version 5
    const name = `${email} ${firstname} ${lastname}`;
    const uuid = uuidv5(name, BUGYET_NAMESPACE);

    // Hash the password using bcrypt and a salt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user object
    const newUser = {
      firstname,
      lastname,
      email,
      password: hashedPassword,
      emailVerified: false,
      uuid,
    };

    // Insert the new user into the database
    await usersCollection.insertOne(newUser);

    // Generate a JWT for the user
    const token = generateToken(newUser);

    // Send verification email
    sendVerificationEmail(newUser.email);

    // Send the JWT in the response
    res.send({ success: true, data: { token } });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, error: "Error registering user" });
  }
});

app.get("/verify-email/:token", (req, res) => {
  // res.send("Verified")
  // Get the JWT token from the request parameters.
  const token = req.params.token;

  // Verify the JWT token with the secret key.
  const secretKey = process.env.JWT_SECRET_PRIVATE_KEY;
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.log(err);
      res.status(400).send({ message: "Invalid token" });
    } else {
      // If the token is valid, get the email from the decoded payload.
      const email = decoded.email;

      // Connect to the MongoDB database.
      mongodb.MongoClient.connect(
        uri,
        { useNewUrlParser: true, useUnifiedTopology: true },
        (error, client) => {
          if (error) {
            console.error(error);
            res.status(500).send({ message: "Error connecting to database" });
            return;
          }

          const db = client.db("test");
          const usersCollection = db.collection("users");

          // Find the user with the matching email.
          usersCollection.findOne({ email }, (error, user) => {
            if (error) {
              console.error(error);
              res.status(500).send({ message: "Error finding user" });
              return;
            }

            // If the user was found, update their email verification status.
            if (user) {
              usersCollection.updateOne(
                { email },
                { $set: { emailVerified: true } },
                (error) => {
                  if (error) {
                    console.error(error);
                    res.status(500).send({ message: "Error updating user" });
                    return;
                  }

                  // If the update was successful, send a success message.
                  res.send({ message: "Email verified successfully" });
                }
              );
            } else {
              // If the user was not found, send an error message.
              res.status(404).send({ message: "User not found" });
            }
          });
        }
      );
    }
  });
});

app.post("/update-profile", verifyToken, async (req, res) => {
  try {
    // Extract profile details from request body
    const { firstname, lastname, email, webhookUrl } = req.body;
    // Connect to the MongoDB database
    const client = await connectToDatabase();
    const db = client.db("test");
    const usersCollection = db.collection("users");

    // Find the user in the database and update their profile details
    const updatedUser = await usersCollection.findOneAndUpdate(
      { email },
      { $set: { firstname, lastname, webhookUrl } },
      { returnOriginal: false, upsert: true }
    );

    if (!updatedUser.value) {
      // If the user was not found in the database, return a 404 error
      return res.status(404).send("User not found");
    }

    // Send a success response
    res.status(200).send("Profile details updated successfully");
  } catch (err) {
    // Log the error and send an error response
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

app.get("/user", verifyToken, fetchUser, (req, res) => {
  // Send the results as a response to the client
  console.log("user called");
  res.status(200).send(res.locals.user);
});

app.post("/notification", verifyToken, fetchUser, async (req, res) => {
  const message = req.body;
  console.log("message", message);
  // Fetch user details from the database
  const user = await fetchUserDetails(req.decoded.email);
  console.log("user", user);

  if (!user) {
    return res.status(401).send({ success: false, error: "User not found" });
  }

  // Send POST request to the webhook URL
  try {
    const response = await axios.post(user.webhookUrl, { message });
    console.log(response.data); // log response data for testing
    res.send({ success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ success: false, error: "Failed to send notification" });
  }
});

app.post("/subdomainfinder", verifyToken, fetchSubdomains, (req, res) => {
  // Send the results as a response to the client
  res.send(res.locals.subdomains);
});

app.post(
  "/domainreachability",
  verifyToken,
  checkDomainReachability,
  (req, res) => {
    // Send the reachability information as a response to the client
    res.send(res.locals.reachability);
  }
);

app.post("/dnsinfo", verifyToken, fetchDnsInfo, (req, res) => {
  // Return the DNS information
  res.json(res.locals.dnsInfo);
});

app.post("/portscanner", verifyToken, scanPorts, (req, res) => {
  // Send the results as a response to the client
  res.send({
    domain: res.locals.domain,
    hostnames: res.locals.hostnames,
    ip: res.locals.ip,
    ports: res.locals.ports,
  });
});

app.post("/technology", verifyToken, fetchTechnology, (req, res) => {
  // Send the results as a response to the client
  res.send(res.locals.technology);
});

app.get("/vulnerabilities", (req, res) => {
  const filePath = path.join(__dirname, "known_exploited_vulnerabilities.json");
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      res.status(500).send("Internal server error");
    } else {
      res.send(JSON.parse(data));
    }
  });
});


app.get("/wayback", (req, res) => {
  let domain = req.query.domain;
  const filePath = path.join(__dirname, "cdx.json");
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      res.status(500).send("Internal server error");
    } else {
      // replace the domain placeholder with the actual domain
      data = data.replace(/csulb.edu/g, domain);
      res.send(JSON.parse(data));
    }
  });
});

// yet to be implemented
app.get('/nuclei', async (req, res) => {
  const domain = req.query.domain;

  if (!domain) {
    return res.status(400).send('Error: Domain parameter is required.\n');
  }

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.flushHeaders();

  const data = [
    'result1',
    'result2',
    'result3',
    'result4',
        ];
    
  const updatedData = data.map(line => {
    return line.replace(/csulb\.edu/g, domain);
  });

  updatedData.forEach((line, index) => {
    setTimeout(() => {
      res.write(`data: ${line}\n\n`);
      if (index === data.length - 1) {
        res.write('event: end\n');
        res.write('data: Scan complete.\n\n');
        res.end();
      }
    }, index * 3000);
  });
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
