const usersRouter = require("express").Router();
const User = require("../Model/usersModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { EMAIL_ADDRESS, EMAIL_PASSWORD, FEURL } = require("../utlis/config");

// getting all users
// usersRouter.get("/user", async (req, res) => {
//   let users = await User.find({}, {}).populate({ path: "url" });
//   res.status(200).json(users);
// });

// sign up new user
usersRouter.post("/user/signup", async (req, res) => {
  //preparing object to store in collection
  try {
    const { username, email, password } = new User(req.body);
    if (!username || !email || !password) {
      res.status(400).json({ Err: "all fields are mandotary" });
      return;
    }
    const matchedUser = await User.findOne({ email });
    if (matchedUser) {
      res.status(400).json({ Err: "user already exists" });
      return;
    }

    // generating random string

    const randomString =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const link = `${FEURL}/user/confirm/${randomString}`;

    // hashed password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      resetToken: randomString,
    });

    //sending email for resetting

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_ADDRESS,
        pass: EMAIL_PASSWORD,
      },
    });

    const sendMail = async () => {
      const info = await transporter.sendMail({
        from: `"Udhayasooriyan" <${EMAIL_ADDRESS}>`,
        to: user.email,
        subject: "Confirm account",
        text: link,
      });
    };

    sendMail();

    if (user) {
      res.status(201).json({ message: `${user.username} Data saved` });
    } else {
      res.status(404).json({ Err: "user data already exist" });
    }
  } catch (error) {
    return res.status(400).json({ Err: "Error on sign up please try again" });
  }
});

// Creating link for sedding authorise link to email

usersRouter.patch("/user/confirm/:id", async (req, res) => {
  try {
    const resetToken = req.params.id;
    const matchedUser = await User.findOne({ resetToken });
    if (matchedUser === null || matchedUser.resetToken === "") {
      return res
        .status(400)
        .json({ Err: "user not exists or reset link expired" });
    }
    matchedUser.verified = true;
    await User.findByIdAndUpdate(matchedUser.id, matchedUser);
    res.status(201).json({
      message: `${matchedUser.username} account verfied has beed changed sucessfully kindly visit login page`,
    });
  } catch (error) {
    return res.status(400).json({ Err: "user not exists or link expired" });
  }
});

// Creating link for reseting password

usersRouter.put("/user/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ Err: "please enter valid email" });
      return;
    }
    const matchedUser = await User.findOne({ email });
    if (!matchedUser) {
      res.status(400).json({ Err: "user not found exists" });
      return;
    }

    const randomString =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const link = `${FEURL}/user/reset/${randomString}`;

    matchedUser.resetToken = randomString;
    await User.findByIdAndUpdate(matchedUser.id, matchedUser);

    //sending email for resetting

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_ADDRESS,
        pass: EMAIL_PASSWORD,
      },
    });

    const sendMail = async () => {
      const info = await transporter.sendMail({
        from: `"Udhayasooriyan" <${EMAIL_ADDRESS}>`,
        to: matchedUser.email,
        subject: "Reset Password",
        text: link,
      });
    };

    sendMail()
      .then(() => {
        return res
          .status(201)
          .json({ message: `Mail has been send to ${matchedUser.email}` });
      })
      .catch((err) => res.status(500).json(err));
  } catch (error) {
    return res.status(500).json(error);
  }
});

// Reseting password

usersRouter.patch("/user/reset/:id", async (req, res) => {
  try {
    const resetToken = req.params.id;
    const { password } = req.body;
    const matchedUser = await User.findOne({ resetToken });
    if (matchedUser === null || matchedUser.resetToken === "") {
      return res
        .status(400)
        .json({ Err: "user not exists or reset link expired" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    matchedUser.password = hashedPassword;
    matchedUser.resetToken = "";

    await User.findByIdAndUpdate(matchedUser.id, matchedUser);
    res.status(201).json({
      message: `${matchedUser.username} password has beed changed sucessfully`,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ Err: "user not exists or reset link expired" });
  }
});

module.exports = usersRouter;
