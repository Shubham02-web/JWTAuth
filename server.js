const express = require("express");
const user = require("./model.js");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
app.use(cookieParser());
app.use(express.json());
mongoose.connect(process.env.mongouri);
const PORT = process.env.PORT || 5500;
const SecretKEY = process.env.SecretKEY;
//  http://localhost:5500/register
app.post("/register", async function (req, res, next) {
  try {
    const { name, password, city, mobile } = req.body;
    if (!name || !password || !city || !mobile)
      return res
        .status(400)
        .send("please enter all {name, password, city, mobile} required field");

    const hashedPass = await bcrypt.hash(password, 8);
    const CreateUser = await user.create({
      name,
      password: hashedPass,
      city,
      mobile,
    });

    const token = JWT.sign({ _id: CreateUser._id, password }, SecretKEY, {
      expiresIn: "2h",
    });
    CreateUser.password = undefined;
    res
      .cookie("token", token, {
        httpOnly: true,
      })
      .status(200)
      .send({
        success: true,
        message: "User created succesfully",
        CreateUser,
        token,
      });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error in Sign Up API");
  }
});
app.post("/login", async function (req, res, next) {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password)
      return res.status(400).send("please provide mobile or password");
    const userData = await user.findOne({ mobile });
    if (!userData) return res.send("user not found on these mobile Number");

    const comparePass = await bcrypt.compare(password, userData.password);
    if (!comparePass)
      return res.status(404).send("You Enterd an wrong Password");

    const token = JWT.sign({ _id: userData._id, password }, SecretKEY, {
      expiresIn: "2h",
    });
    userData.password = undefined;
    res
      .cookie("token", token, {
        httpOnly: true,
      })
      .status(200)
      .send({
        succcess: true,
        message: "User login succesfully",
        userData,
        token,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "error in login API",
    });
  }
});
app.get("/getUser", async function (req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(404).send("Token not found");
    const usertoken = await JWT.verify(token, SecretKEY);
    const id = usertoken._id;
    const userData = await user.findOne({ _id: id });
    if (!userData) return res.status(404).send("User Data not found ");
    userData.password = undefined;
    res.status(200).send({
      success: true,
      message: "user",
      userData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      succcess: false,
      message: "Error in Get User Profile API",
    });
  }
});
app.listen(PORT, function () {
  console.log(`port listen on port no ${PORT}`);
});
