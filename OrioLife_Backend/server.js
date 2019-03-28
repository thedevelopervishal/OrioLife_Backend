const express = require("express");
const mongoose = require("mongoose");
const app = express();
const db = require("./config/keys").mongoURI;
const bodyParser = require('body-parser');
const passport = require('passport');

const users = require('./routes/api/users');
const profiles = require('./routes/api/profiles');
const posts = require('./routes/api/posts');
const port = process.env.port || 5000;

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("Connected successfully baby"))
  .catch(err => console.log(err));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(passport.initialize());
require('./config/passport')(passport);
app.listen(port, () => console.log(`Server is listening on your port ${port}`));

app.get("/", (req, res) => {
  res.send("Hello Musk_Jr, You have to complete the app ASAP");
});

app.use('/api/users', users);
app.use('/api/posts',posts);
app.use('/api/profiles',profiles);


/////////////////
//Some interesting Js libs
//Hower.js
//SweetAlert2.js
//Cleave.js
//HTML2CANAVAS.js
//Popmotion.js
//Typed.js
//Scrollmagic.js
