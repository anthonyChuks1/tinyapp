/**
 * @file Express server for TinyApp
 * @description This file contains the implementation of an Express server for TinyApp, a URL shortening service.
 */

const express = require('express');
const cookieParser = require('cookie-parser')

const app = express();
const PORT = 8081; //default port 8080

app.set("view engine", "ejs"); //set ejs as view engine.
app.use(express.urlencoded({ extended: true }));//converts the request body from a buffer
//                     into string we can read and add it to the req(request) object under key body.
app.use(cookieParser());

/**
 * @typedef {Object} UrlDatabase
 * @property {string} b2xVn2 - The short URL key.
 * @property {string} 9sm5xK - The short URL key.
 */

/** @type {UrlDatabase} */
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


/**
 * GET /urls
 * Route for displaying all URLs in the database.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

/**
 * GET /urls/new
 * Route for displaying the form to create a new URL.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
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
   * Retrieves the username from the request body
   * and saves it in a cookie.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response objeect.
   * @returns {string} The username extracted from the request body.
   */
  app.post("/login", (req,res) => {
  const {username} = req.body;
  //console.log(username);
  res.cookie('username', username);  
  res.redirect(`/urls`)
})

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
  res.redirect("/urls");
});

/**
 * GET /urls/:id
 * Route for displaying a specific URL.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
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
const generateRandomString = function () {
  return Math.random().toString(36).substring(4, 10);//return random number between 0 - 1 and convert from decimal to base 36 then get value
  //                                                    from index 4 to 10
};
