const express = require('express');
const bodyParser = require('body-parser');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

let currentToken = 0;

function getToken() {
  currentToken++;
  return `${currentToken}`;
}

db.defaults({ users: [] })
  .write()

const app = express();

app.use(bodyParser.json());

app.post('/api/user', (req, res) => {
  const body = req.body;

  if (!body.username || !body.password) {
    res.status(400).json({ message: 'missing username and password' });
  } else if (db.get('users').find({ username: body.username }).value()) {
    res.status(400).json({ message: 'user already exists' });
  } else {
    db.get('users')
      .push({
        username: body.username,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
        description: body.description,
        savings: 10000,
      })
      .write();

    res.json({ message: 'complete' });
  }
})

app.post('/api/login/', (req, res) => {
  const details = req.body;

  const result = db.get('users')
    .find({ username: details.username })
    .value()

  if (result && result.password === details.password) {
    const token = getToken();

    db.get('users')
      .find({ username: details.username })
      .set('token', token)
      .write()

    res.json({
      token,
    });
  } else {
    res.status(401).json({ message: "You are not authorised" });
  }
})

app.get('/api/users', (req, res) => {
  const data = db.get('users')
    .value()
    .map((item) => ({
      username: item.username,
      firstName: item.firstName,
      lastName: item.lastName,
      savings: item.savings,
    }));

  res.json(data);
})

app.get('/api/user', (req, res) => {
  const { user } = req.query;

  const item = db.get('users')
    .find({ username: user })
    .value()

  res.json({
    username: item.username,
    firstName: item.firstName,
    lastName: item.lastName,
    savings: item.savings,
    description: item.description,
  });
})

app.post('/api/transfer', (req, res) => {
  const { user } = req.query;

  const { token, amount } = req.body;

  if (token && !Number.isNaN(amount) && amount > 0) {
    const transferToUser = db.get('users')
      .find({ username: user })
      .value()

    const transferFromUser = db.get('users')
      .find({ token })
      .value()

    if (transferFromUser.savings < amount) {
      res.status(400).json({ message: 'you do not have enough credit' });
    } else {
      db.get('users')
        .find({ username: user })
        .set('savings', transferToUser.savings + amount)
        .write()

      db.get('users')
        .find({ token })
        .set('savings', transferFromUser.savings - amount)
        .write();

      res.json({ message: `${amount} transfered!` })
    }
  } else {
    res.status(400).json({ message: 'amount is not number' });
  }
})

app.use(express.static('public'));

app.listen(8888, () => {
  console.log('server started at port: 8888');
});
