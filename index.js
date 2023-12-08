const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

// middleware
app.use(
  cors({
    origin: [],
    credentials: true,
  })
);
app.use(express());
app.use(cookieParser());

// middlewares + verifyToken
const logger = (req, res, next) => {
  console.log("logger", req.host, req.originalUrl);
  next();
};

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "token not found" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRECT, (err, decoded) => {
    if (err) {
      res.status(401).send({ message: "unauthrized user" });
    }
    req.user = decoded;
    next();
    console.log("decoded", decoded);
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@bistro-boss-restaurant.t8ysptg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const dbConnect = async () => {
  try {
    client.connect();
    console.log("DB Connected Successfully✅");
  } catch (error) {
    console.log(error.name, error.message);
  }
};
dbConnect();

// jwt auth apis routes
app.post("/jwt", (req, res) => {
  const user = req.body;
  console.log("user of token email", user);

  // create token
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRECT, {
    expiresIn: "24h",
  });

  // store token
  res
    .cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .send({ success: true });
});

// clean cookie when user logout
app.post("logout", (req, res) => {
  const user = req.body;
  res.clearCookie("token", { maxAge: 0 }).send({ success: true });
});

// home apis routes
app.get("/", (req, res) => {
  res.send("server is running...");
});
\
// listen server
app.listen(port, () => {
  console.log(`server is running successfully at http://${port}`);
});
