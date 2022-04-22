// import { express } from 'express';
// import { http } from 'http';
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const mongoose = require('mongoose');
const Models = require('./models.js');
const res = require('express/lib/response');
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/weatherize', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(bodyParser.json());

let users = [
  {
    id: 1,
  username: 'wojtek',
  password: 'wojtek',
  email: 'wojtek@gmail.com',
  favorites: ['Warszawa', 'Tokyo', 'Singapore']
},
{
  id: 2,
  username: 'test',
  password: 'test',
  email: 'test@gmail.com',
  favorites: ['Oslo', 'Reykjavik', 'Sydney']
}
]

console.log('Weatherize backend running on port 8080');

app.get('/', (req, res )=> {
  res.send('Weatherize backend index.js');
});

app.get('/test', (req, res )=> {
  res.sendFile('public/index.html', { root: __dirname });
});

//get all users

// app.get('/users', (req, res )=> {
//   res.json(users);
// });

app.get('/users', (req, res )=> {
  Users.find().then(users => res.json(users));
});

//get user by username
app.get('/users/:username', (req, res) => {
  Users.findOne({ username: req.body.username })
  .then(user => {
    res.json(user);
    res.status(201).send(user)
  })
.catch(error => {
  console.log(error);
  res.status(500).send(error);
})
})


//add new user
app.post('/users', (req, res) => {
  Users.findOne({ username: req.body.username })
  .then(user => {
    if (user) {
      return res.status(400).send(req.body.username + 'already exists');
    } else {
      Users.create({
        username: req.body.username,
        password: req.body.password,
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
app.post('/users/:username/:location', (req,res) => {
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
app.delete('/users/:username/:location', (req,res) => {
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
app.delete('/users/:username', (req, res) => {
  Users.findOneAndRemove({ username: req.params.username })
  .then(user => {
    if (!user) {
      res.status(400).send(req.params.username, 'not found');
    } else {
      res.status(200).send(req.params.username, 'has been deleted');
    }
  })
  .catch(error => {
    console.log(error);
    res.status(500).send(error);
  })
})



// app.delete('/users/:username', (req, res) => {
//   let user = users.find(user => { return user.username === req.params.username})
// console.log('params username: ', req.params.username);
// console.log('user to delete: ', user);
//   if (user) {
//     users = users.filter((user) => { return user.username !== req.params.id });
//     res.status(201).send('User ', user.username, ' was deleted.');
//   }
// });

//error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke');
});

app.listen(8080, () => {
  console.log('Weatherize backend listening on port 8080');
});

