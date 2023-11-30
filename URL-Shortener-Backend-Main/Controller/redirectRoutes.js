const redirectRouter = require("express").Router();
// const jwt = require("jsonwebtoken");
// const { SECRET } = require("../utlis/config");
// const User = require("../Model/usersModel");
const Url = require("../Model/urlModel");

//getting full data
redirectRouter.get("/st/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const urlData = await Url.findOne({ random: id });
    res.redirect(urlData.longurl);
  } catch (error) {
    console.error(error);
  }
});

module.exports = redirectRouter;
