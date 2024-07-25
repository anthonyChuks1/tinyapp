/**
 * @file Express server for TinyApp
 * @description This file contains the implementation of an Express server for TinyApp, a URL shortening service.
 */

const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8081; //default port 8080

app.set("view engine", "ejs"); //set ejs as view engine.
app.use(express.urlencoded({ extended: true }));//converts the request body from a buffer
//                     into string we can read and add it to the req(request) object under key body.
app.use(cookieParser());


/**Global variables */
//urlDatabase database
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
//users database
const users = {
  b2: {
    id: "b2",
    email: "b@b.com",
    password: "bbbbbbb",
  },
  a1: {
    id: "a1",
    email: "a@a.com",
    password: "aaaaaaa",
  },
};
/**End of global variables */
app.use(express.urlencoded({ extended: true }));//converts the request body from a buffer
//                     into string we can read and add it to the req(request) object under key body. very important



/**
 * GET /urls
 * Route for displaying all URLs in the database.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.cookies["user_id"] };
  res.render("urls_index", templateVars);
});

/**
 * GET /urls/new
 * Route for displaying the form to create a new URL.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.cookies["user_id"] };
  res.render("urls_new", templateVars);

});

/**
 * POST /urls
 * Route for creating a new URL.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.post("/urls", (req, res) => {
  const urlLong = req.body.longURL;//it will put new data in the body
  const urlShort = generateRandomString();
  urlDatabase[urlShort] = urlLong; //Add them to the data base
  res.redirect(`/urls/${urlShort}`);//Lets make sure that it actually worked hmm?
});

/**
 * POST /urls/:id/delete
 * Route for deleting a URL.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.post("/urls/:id/delete", (req, res) => {//post for delete attatch it to a delete button form
  const urlShort = req.params.id;
  delete urlDatabase[urlShort];
  res.redirect("/urls");//redirect to homepage
});



/**
 * POST /login
 * Retrieves the login information from the request body
 * and saves it in a cookie.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response objeect.
 */
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  for (let u in users) {//loop through database to find the email
    if (email === users[u].email && password === users[u].password) {//did you find the email
      res.cookie('user_id', users[u]);//then add it to the cookie as user_id
      res.redirect(`/urls`);
    }
  }
  if (!req.cookies['user_id']) {
    res.status(403).send("<h1>Login Failed - Wrong Login information</h1>");
  }
  //res.redirect(`/login`);//if the name was not found then just redirect to the home page.
});

/**
 *  a GET endpoint for /login page
 * @param {object} req
 * @param {object} res
 */
app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.cookies["user_id"] };
  res.render("login", templateVars);
});


/**
   * POST /logout
   * Deletes the user information from the cookie cache
   * @param {Object} req - The request object.
   * @param {Object} res - The response objeect.
   *
   */
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");//clear the cookies when logged out
  res.redirect(`/login`);
});
/**
 * GET /u/:id
 * Route for redirecting to the long URL when the short URL is passed in.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get("/u/:id", (req, res) => {//redirect to the website when the id is passed in
  const { id } = req.params;
  const longURL = urlDatabase[id];
  res.redirect(`${longURL}`);
});

/**
 * POST /urls/:id
 * Route for editing a URL.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.post("/urls/:id", (req, res) => {//handles Edit of the long url
  const { id } = req.params;

  const { longURL } = req.body;//to get the data from the form it will put the data in the body
  if (longURL !== 'http://') {
    urlDatabase[id] = longURL;
  }
  res.redirect(`/urls`);
});

/**
 * GET /urls/:id
 * Route for displaying a specific URL.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get(`/urls/:id`, (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: req.cookies["user_id"] };
  res.render(`urls_show`, templateVars);
});

/**
 * POST /register
 * Route for handling the registration data.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.post("/register", (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {

    res.status(400).send('<p>Email or Password cannot be empty</p>');//Respond with status 400 if the email and password is empty
    return;
  }
  if (getUserByEmail(email)) {
    res.status(400).send('<p>Email is already in use.</p>');//respond with status 400 if email is already used
    return;
  }

  const user = {
    id: generateRandomID(),
    email,
    password,
  };
  users[user.id] = user;
  console.log(users);
  res.cookie("user_id", users[user.id]);
  res.redirect("/urls");
});


/**
 * GET /register
 * Route for the registration page.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get("/register", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: req.cookies["user_id"] };
  res.render("register.ejs", templateVars);
});


//---------------------------------------
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b><body></html>\n");
});
//------------------------------------------------

/**
 * Start the server.
 * @param {number} PORT - The port number to listen on.
 */
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

/**
 * Generate a random string.
 * @returns {string} - The generated random string.
 */
const generateRandomString = function() {
  return Math.random().toString(36).substring(4, 10);//return random number between 0 - 1 and convert from decimal to base 36 then get value
  //                                                    from index 4 to 10
};
/**
 * Generate a random string.
 * @returns {string} - The generated random string.
 */
const generateRandomID = function() {
  return Math.random().toString(36).substring(3, 7);//return random number between 0 - 1 and convert from decimal to base 36 then get value
  //                                                    from index 3 to 7
};

/**
 * Returns an object that has the email
 * @param {string} email -  a string with the email format
 * @returns {object} - the user object
 */
const getUserByEmail = function(email) {
  for (let u in users) {
    if (email === users[u].email) {
      return (users[u]);
    }
  }
  return null;
};