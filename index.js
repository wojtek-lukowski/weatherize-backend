// import { express } from 'express';
// import { http } from 'http';
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const uuid = require('uuid');

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
app.get('/users', (req, res )=> {
  res.json(users);
});

//get user by username
app.get('/users/:username', (req, res )=> {
  res.json(users.find((user) => {
    return user.username === req.params.username
  }));
});

//add new user
app.post('/users', (req, res ) => {

let newUser = req.body;

console.log('new user: ', newUser);

if (!newUser.username) {
  const message = 'Missing username';
  res.status(400).send(message);
} else {
  newUser.id = uuid.v4();
  users.push(newUser);
  res.status(201).send(newUser);
}
});

//add to favs
app.post('/users/:username/:location', (req,res) => {
  let newLocation = req.params.location;
  // newLocation = encodeURIComponent(newLocation)
  let user = users.find(user => { return user.username === req.params.username })
  user.favorites.push(decodeURIComponent(newLocation));
  // res.status(201).send(newLocation, 'added to favs');
  console.log(newLocation, 'added to favs')
  res.status(201).send(req.body)
})

// remove from favs
app.delete('/users/:username/:location', (req,res) => {
  let locationToRemove = req.params.location;
  let user = users.find(user => { return user.username === req.params.username })
  user.favorites = user.favorites.filter(location => { return location !== locationToRemove })
  // res.status(201).send(locationToRemove, 'removed')
  console.log(locationToRemove, 'removed from favs')
  res.status(201).send(req.body)
})

//delete user
app.delete('/users/:username', (req, res) => {
  let user = users.find(user => { return user.username === req.params.username})
console.log('params username: ', req.params.username);
console.log('user to delete: ', user);
  if (user) {
    users = users.filter((user) => { return user.username !== req.params.id });
    res.status(201).send('User ', user.username, ' was deleted.');
  }
});

//error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke');
});

app.listen(8080, () => {
  console.log('Weatherize backend listening on port 8080');
});

