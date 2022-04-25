// import { express } from 'express';
// import { http } from 'http';
const express = require('express');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const mongoose = require('mongoose');
const Models = require('./models.js');
const res = require('express/lib/response');
const Users = Models.User;
const { check, validationResult } = require('express-validator');

// mongoose.connect('mongodb://localhost:27017/weatherize', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(bodyParser.json());

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

let allowedOrigins = ['http://localhost:8080', 'http://localhost:3000', 'https://wojtek-lukowski.github.io']
allowedOrigins = ['*']
app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1) {
      let message = 'The CORS policy for this application does not allow access from origin', origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

app.get('/', (req, res )=> {
  res.send('Weatherize backend index.js');
});

app.get('/test', (req, res )=> {
  res.sendFile('public/index.html', { root: __dirname });
});

//get all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res )=> {
  Users.find().then(users => res.json(users));
});

//get user by username
app.get('/users/:username', 
passport.authenticate('jwt', { session: false }), 
(req, res) => {
  Users.findOne({ username: req.params.username })
  .then(user => {
    res.json(user);
    // res.status(201).send(user)
  })
  .catch(error => {
    console.log(error);
    // res.status(500).send(error);
  })
})

//add new user
app.post('/users',
[
  check('username', 'Username is required').isLength({min: 5}),
  check('username', 'Username can contain only latters and numbers').isAlphanumeric(),
  check('password', 'Password is required').not().isEmpty(),
  check('email', 'Check email format').isEmail()
],
(req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }
  let hashedPassword = Users.hashPassword(req.body.password);
  Users.findOne({ username: req.body.username })
  .then(user => {
    if (user) {
      return res.status(400).send(req.body.username + 'already exists');
    } else {
      Users.create({
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email
      })
      .then(user => { res.status(201).json(user), console.log(user, 'has been added') })
      .catch(error => {
        console.log(error);
        res.status(500).send(error);
      })
    }
  })
})

//add to favs
app.post('/users/:username/:location', passport.authenticate('jwt', { session: false }), (req,res) => {
  Users.findOneAndUpdate({ username: req.params.username },
    { $addToSet: { favorites: req.params.location }
  },
  { new: true },
  (error, updatedUser) => {
    if (error) {
      console.log(error);
      res.status(500).send(error);
    } else {
      res.json(updatedUser);
    }
  })
})

// remove from favs
app.delete('/users/:username/:location', passport.authenticate('jwt', { session: false }), (req,res) => {
  Users.findOneAndUpdate({ username: req.params.username },
    { $pull: { favorites: req.params.location } },
  { new: true },
  (error, updatedUser) => {
    if (error) {
      console.log(error);
      res.status(500).send(error);
    } else {
      res.json(updatedUser);
    }
  })
})

//delete user
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ username: req.params.username })
  .then(user => {
    if (!user) {
      res.status(400).send('not found');
    } else {
      res.status(200).send('has been deleted');
    }
  })
  .catch(error => {
    console.log(error);
    res.status(500).send(error);
  })
})

//error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke');
});

// app.listen(8080, () => {
//   console.log('Weatherize backend listening on port 8080');
// });

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
  console.log('Weatherize backend listening on port', port);
});

