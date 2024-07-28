const bcrypt = require("bcryptjs");

//urlDatabase database
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "a1",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "bbbbb",
  },
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
//users database
const users = {
  b2: {
    id: "b2",
    email: "b@b.com",
    password: bcrypt.hashSync("bbb", 10),
  },
  a1: {
    id: "a1",
    email: "a@a.com",
    password: bcrypt.hashSync("aaa", 10),
  },
};

module.exports = {
  urlDatabase,
  users,
};
