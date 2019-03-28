const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

//@router GET api/users/test
//@desc Just to check the users route
//@access PUBLIC
router.get("/test", (req, res) => {
  res.json({
    msg: "users works"
  });
});

//@router POST api/users/register
//@desc To get the users registered
//@access PUBLIC
router.post("/register", (req, res) => {

  const {errors,  isValid} = validateRegisterInput(req.body);

  //Check validation
  if(!isValid){
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ msg: "user already exists" });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200",
        r: "pg",
        d: "mm"
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          //   if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

//@router POST api/users/login
//@desc User login route | Returning JWT token
//@access PUBLIC
router.post("/login", (req, res) => {

  const {errors,  isValid} = validateLoginInput(req.body);

  if(!isValid){
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;
  
  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = "Email not found"
      return res.status(404).json(errors);
    } else {
      //Check passowrd
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          //Create the jwt payload
          const payload = { id: user.id, name: user.name, avatar: user.avatar };
          //Sign the TOKEN
          jwt.sign(
            payload,
            keys.secretOrKey,
            { expiresIn: 3600 },
            (err, token) => {
              res.json({
                success: true,
                token: "Bearer " + token
              });
            }
          );

          // res.json({ msg: "Success" });
        } else {
          errors.password = "Password incorrect";
          res.status(400).json(errors);
        }
      });
    }
  });
});

//@router GET api/users/current
//@desc return the current user
//@access PRIVATE
router.get(
  "/current",
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      id:req.user.id,
      name:req.user.name,
      email:req.user.email
    });
  }
);

module.exports = router;
