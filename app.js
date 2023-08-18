//require dependencies
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

//instantiate express
const app = express();

//listen to a port
app.listen(5000);
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//instantiate connection object
const connection = mysql.createConnection({
  host: "",
  user: "",
  password: "",
  database: "",
});

connection.connect((err) => {
  if (err) {
    console.log("connection failed");
  } else {
    console.log("connected");
  }
});

const sessionID = 1; //NOT USED IN THIS APPLICATION, JUST FOR DATABASE FILLING
app.post("/sign-up", (req, res) => {
  //destructured request body
  const { name, email, password, confirmPassword } = req.body;
  console.log(req.body);
  //   check if two passwords match
  if (password !== confirmPassword) {
    res.status(500).json({ message: "Password doesnt match" });
    return;
  }

  // if passwords match, hash the passowrd
  const saltRounds = 10;
  bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) {
      console.log("Error generating salt: ", err);
      return;
    }

    bcrypt.hash(password, salt, (err, hashedPassword) => {
      if (err) {
        console.err("Error hashing password", err.message);
        return;
      }

      const sql = `
            INSERT INTO user
            (user_id, user_name, user_gmail, user_password, session_id)
            VALUES( DEFAULT, ?, ?, ?, ?)
        `;
      connection.query(
        sql,
        [name, email, hashedPassword, sessionID],
        (err, results) => {
          if (err) {
            console.log(err);
            return;
          }
        }
      );
    });
  });
});

//create login router
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  //sql query statement for selecting user with the provided email
  const sql = `
        SELECT * 
        FROM user
        WHERE user_gmail = ?
    `;

  //select the user
  connection.query(sql, [email], (err, results) => {
    //if error occured log the error, and respond with appropriate status
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "internal server error" });
    }

    //check if email match
    if (results.length === 0) {
      console.log(`invalid email: ${email}`);
      return res.status(500).json({ message: `invalid email` });
    }
    //get hashed password and compare to the passowrd used
    const hashedPassword = results[0].user_password;
    //compare passwords
    bcrypt.compare(password, hashedPassword, (err, isMatching) => {
      if (err) {
        console.log("error checking password :", err);
        return res
          .status(500)
          .json({ message: `Internal server error: ${err}` });
      }

      //check if compared passwords match
      if (!isMatching) {
        console.log("password doesnt match");
        return res.status(500).json({ message: "Invalid password" });
      }

      //if all tests have passed: create jsonWebtoken with the results from the database
      const user = results[0];
      jwt.sign({ user }, "secret_key_here", (err, token) => {
        res.json({ token }); //send the token to the browser
      });
    });
  });
});

//protected router
app.get("/", verifyToken, (req, res) => {
  res.json({ message: "my message" + req.user_id });
});

//middlewares
function verifyToken(req, res, next) {
  //get authentication header value
  const bearerHeader = req.headers["authorization"];
  // check if bearer is undefined
  if (typeof bearerHeader !== "undefined") {
    //split at the space
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    jwt.verify(bearerToken, "secret_key_here", (err, decoded) => {
      if (err) {
        return res.sendStatus(401); // Unauthorized
      }

      // Extract user_id from the decoded payload
      const userId = decoded.user.user_id;

      // Attach the user_id to the request object
      req.user_id = userId;

      next();
    });
  } else {
    //forbidden
    res.sendStatus(403);
  }
}
