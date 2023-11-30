require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { log, error } = require("./utlis/logger");
const { URL } = require("./utlis/config");
const usersRouter = require("./Controller/usersRoutes");
const urlRouter = require("./Controller/urlRoutes");
const loginRouter = require("./Controller/loginRoutes");
const redirectRouter = require("./Controller/redirectRoutes");

app.use(express.json());
app.use(cors());

mongoose.set("strictQuery", false);

mongoose
  .connect(URL)
  .then(() => {
    log("connected to mongoDB");
  })
  .catch((err) => {
    error(err);
  });

app.get("/", (req, res) => {
  res.send("<h1>Welcome to URL Shortener</h1>");
});

app.use(usersRouter);
app.use(urlRouter);
app.use(loginRouter);
app.use(redirectRouter);

module.exports = app;
