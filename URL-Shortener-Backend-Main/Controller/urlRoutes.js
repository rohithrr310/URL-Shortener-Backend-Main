const urlRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const { SECRET, BEURL } = require("../utlis/config");
const User = require("../Model/usersModel");
const Url = require("../Model/urlModel");

//getting token function
const getTokenFrom = (req) => {
  const authorization = req.get("authorization");

  if (authorization && authorization.startsWith("bearer ")) {
    return authorization.replace("bearer ", "");
  }
};

//getting full data
urlRouter.get("/user/url", async (req, res) => {
  try {
    //getting token of authorised user
    const token = getTokenFrom(req);
    if (!token) {
      return res
        .status(401)
        .json({ error: "session timeout please login again" });
    }
    //verify the token
    const decodedToken = jwt.verify(token, SECRET);
    // if token is not valid, return error
    if (!decodedToken.id) {
      return res.status(401).json({ error: "token invalid" });
    }

    const urls = await User.findById(decodedToken.id).populate("url");
    res.status(200).json(urls.url);
  } catch (error) {
    return res
      .status(400)
      .json({ Err: "Error on fetching data please login again to fetch" });
  }
});

//posting new URL data

urlRouter.post("/user/url", async (req, res) => {
  try {
    //getting body content
    const body = req.body;

    //getting token
    const token = getTokenFrom(req);

    //verify the token
    const decodedToken = jwt.verify(token, SECRET);

    // if token is not valid, return error
    if (!decodedToken.id) {
      return res.status(401).json({ error: "token invalid" });
    }

    //get logged in user to store URL
    const user = await User.findById(decodedToken.id);

    //prepare URL to push in user collection

    let letters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
    let random = "";
    for (i = 0; i < 4; i++) {
      random += letters[Math.floor(Math.random() * letters.length)];
    }
    const shorturl = `${BEURL}/st/` + random;

    const url = new Url({
      longurl: body.longurl,
      shorturl: shorturl,
      random: random,
      user: user._id,
    });

    //save the url to url collection

    const savedUrl = await url.save();

    // push the id of saved url to user collection

    user.url = user.url.concat(savedUrl._id);

    await user.save();

    res.status(200).json(savedUrl);
    //
  } catch (error) {
    return res
      .status(400)
      .json({ Err: "Error on updating please try again later" });
  }
});

module.exports = urlRouter;
