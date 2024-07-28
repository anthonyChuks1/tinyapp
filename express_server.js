/**
 * @file Express server for TinyApp
 * @description This file contains the implementation of an Express server for TinyApp, a URL shortening service.
 */

const bcrypt = require("bcryptjs");
const express = require("express");
const {
  generateRandomString,
  generateRandomID,
  getUserByEmail,
  checkLogin,
  checkForUrlId,
  urlsForUser,
  loginRoute,
} = require("./helpers");
const cookieSession = require("cookie-session");
const methodOverride = require("method-override");
const { urlDatabase, users } = require("./helper-variables");

const app = express();
const PORT = 8081; //default port 8080

app.set("view engine", "ejs"); //set ejs as view engine.
app.use(express.urlencoded({ extended: true })); //converts the request body from a buffer
//                     into string we can read and add it to the req(request) object under key body.
app.use(methodOverride("_method"));
app.use(
  cookieSession({
    name: "session",
    keys: ["Key1", "Key2", "Key3"],
  })
);

app.use(express.urlencoded({ extended: true })); //converts the request body from a buffer
//                     into string we can read and add it to the req(request) object under key body. very important

/**
 * GET /
 * Redirects to login page when user opens the server ip on the browser
 */
app.get("/", (req, res) => {
  return res.redirect(`/login`);
});

/**
 * GET /urls
 * Route for displaying all URLs in the database.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get("/urls", (req, res) => {
  const cookie = req.session.user_id;
  if (!checkLogin(cookie, users)) {
    return res.status(403)
      .send(`<h3> Cannot access this page without logging in.</h3>
      <br> <a href = ${loginRoute(PORT, "/login")}> Login <a>`);
  }
  const urls = urlsForUser(cookie.id, urlDatabase);
  const templateVars = { urls, user: req.session.user_id };
  res.render("urls_index", templateVars);
});

/**
 * GET /urls/new
 * Route for displaying the form to create a new URL.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get("/urls/new", (req, res) => {
  //const cookie = templateVars.user;
  const userCookie = req.session.user_id;
  if (!checkLogin(userCookie, users)) {
    return res.redirect(`/login`);
  }
  const templateVars = { urls: urlDatabase, user: req.session.user_id };
  return res.render("urls_new", templateVars);
});

/**
 * POST /urls
 * Route for creating a new URL.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.put("/urls", (req, res) => {
  const userCookie = req.session.user_id;
  if (!checkLogin(userCookie, users)) {
    //Check tht the user is logged in
    return res.status(403)
      .send(`<h3> Cannot access this route without login. \n Login before accessing this route</h3>
      <br> <a href = ${loginRoute(PORT, "/login")}> Login <a>`);
  }
  const { longURL } = req.body; //it will put new data in the body
  const shortURL = generateRandomString();
  const userID = userCookie.id;
  urlDatabase[shortURL] = { longURL, userID }; //Add them to the data base
  return res.redirect(`/urls/${shortURL}`); //Lets make sure that it actually worked hmm?
});

/**
 * POST /urls/:id/delete
 * Route for deleting a URL.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.delete("/urls/:id/delete", (req, res) => {
  //post for delete attatch it to a delete button form
  let found = false;
  const { id } = req.params;
  const userCookie = req.session.user_id;
  if (!checkLogin(userCookie, users)) {
    //Check tht the user is logged in
    return res.status(403)
      .send(`<h3> Cannot access this route without login. Login before accessing this route</h3>
      <br> <a href = ${loginRoute(PORT, "/login")}> Login <a>`);
  }

  const userUrls = urlsForUser(userCookie.id, urlDatabase); //put the result into userUrls

  if (userUrls[id]) {
    found = true;
  }

  if (!found) {
    return res.send(`<h3>There are no url with this id for this user</h3> 
      <br> <a href = ${loginRoute(PORT, "/urls")}> Urls Page <a>`);
  }

  const urlShort = req.params.id;
  delete urlDatabase[urlShort];
  res.redirect("/urls"); //redirect to homepage
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
  let foundUser = null;
  for (let user in users) {
    //loop through database to find the email
    if (
      email === users[user].email &&
      bcrypt.compareSync(password, users[user].password)
    ) {
      //did you find the email
      foundUser = users[user];
    }
  }
  if (!foundUser) {
    res.status(403).send(`<h1>Login Failed - Wrong Login information</h1>
      <br> <a href = ${loginRoute(PORT, "/login")}> Login <a>
      <br> <a href = ${loginRoute(PORT, "/register")}> Register <a>`);
  }

  if (foundUser) {
    //set coockie
    //res.cookie('user_id', foundUser)//cookie parser [x]
    req.session.user_id = foundUser;
    return res.redirect("/urls");
  }
});

/**
 *  a GET endpoint for /login page
 * @param {object} req
 * @param {object} res
 */
app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.session.user_id };
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
  //res.clearCookie("user_id");//clear the cookies when logged out
  req.session = null;
  res.redirect(`/login`);
});

/**
 * GET /u/:id
 * Route for redirecting to the long URL when the short URL is passed in.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get("/u/:id", (req, res) => {
  //redirect to the website when the id is passed in (anyone can visit this short url)
  const { id } = req.params;
  if (!checkForUrlId(id, urlDatabase)) {
    //check for the id in the database
    return res.send(`<h3>The id does not exist in the database</h3>
      <br> $<a href = ${loginRoute(PORT, "/urls")}> URL Page <a>`);
  }

  const longURL = urlDatabase[id].longURL;
  return res.redirect(`${longURL}`);
});

/**
 * POST /urls/:id
 * Route for editing a URL.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.put("/urls/:id", (req, res) => {
  //handles Edit of the long url
  const { id } = req.params; //the url id request
  const userCookie = req.session.user_id;
  let found = false;

  if (!checkLogin(userCookie, users)) {
    //Check that the user is logged in
    return res.status(403)
      .send(`<h3> Cannot access this route without login.<br> 
      Login  with <a href = ${loginRoute(PORT, "/login")}> Login <a> before accessing this page.</h3>`);
  }

  if (!checkForUrlId(id, urlDatabase)) {
    //check for the id in the database
    return res.status(403).send(`<h3>The id does not exist in the database <br>
      Go back to main page <a href = ${loginRoute(PORT, "/urls")}> URLs Page<a> </h3>`);
  }

  const userUrls = urlsForUser(userCookie.id, urlDatabase); //put the result into userUrls

  if (userUrls[id]) {
    found = true;
  }

  if (!found) {
    return res.send(`<h3>There are no url with this id for this user <br>
      Main page <a href = ${loginRoute(PORT, "/urls")}> URLs page <a> </h3>`);
  }

  const { longURL } = req.body; //to get the data from the form it will put the data in the body

  if (longURL !== "http://") {
    urlDatabase[id].longURL = longURL; //change the long url here
  }
  return res.redirect(`/urls`);
});

/**
 * GET /urls/:id
 * Route for displaying a specific URL.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get(`/urls/:id`, (req, res) => {
  const cookie = req.session.user_id;
  let found = false;

  if (!checkLogin(cookie, users)) {
    return res.status(403).send(`<h3>Login to access this url <br> 
      Click <a href = ${loginRoute(PORT, "/login")}> Login <a>  to go to loginpage .</h3>`);
  }

  const urlList = urlsForUser(cookie.id, urlDatabase);
  const id = req.params.id;

  if (urlList[id]) {
    found = true;
  }

  if (!found) {
    return res.status(403).send(`The URL does not exist for the user. <br> 
      <a href = ${loginRoute(PORT, "/urls")}> URLs page <a>`);
  }

  const longURL = urlDatabase[id].longURL || " ";
  const templateVars = { id, longURL, user: req.session["user_id"] };

  return res.render(`urls_show`, templateVars);
});

/**
 * POST /register
 * Route for handling the registration endpoint.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.put("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send(`<h3>Email or Password cannot be empty</h3>
      <br> <a href = ${loginRoute(PORT, "/register")}> Register <a>`); //Respond with status 400 if the email and password is empty
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send(`<h3>Email is already in use.</h3>
       <br> <a href = ${loginRoute(PORT, "/register")}> Register with new email <a>`); //respond with status 400 if email is already used
  }
  const hashedPassword = bcrypt.hashSync(password, 10); //hash the password
  const user = {
    id: generateRandomID(),
    email,
    password: hashedPassword,
  };

  users[user.id] = user;
  req.session.user_id = user;
  return res.redirect("/urls");
});

/**
 * GET /register
 * Route for the registration page.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get("/register", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: req.session["user_id"],
  };

  return res.render("register.ejs", templateVars);
});
/**---------------SERVER\\------------------------------------------------------------------------------------ */
/**
 * Start the server.
 * @param {number} PORT - The port number to listen on.
 */
app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});
