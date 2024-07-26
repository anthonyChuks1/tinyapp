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
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "a1"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "bbbbb"
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
    password: "bbb",
  },
  a1: {
    id: "a1",
    email: "a@a.com",
    password: "aaa",
  },
};
/**End of global variables */
app.use(express.urlencoded({ extended: true }));//converts the request body from a buffer
//                     into string we can read and add it to the req(request) object under key body. very important



/**
 * GET /
 * Redirects to login page when user opens the server ip on the browser
 */
app.get("/", (req, res) => {
  return res.redirect(`/login`);
})


/**
 * GET /urls
 * Route for displaying all URLs in the database.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get("/urls", (req, res) => {

  const cookie = req.cookies['user_id'];
  if (!checkLogin(cookie)) {
    res.status(403).send(`<h3> Cannot access this page without logging in.</h3>`)
    return res.redirect(`/login`);
  }
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

  //const cookie = templateVars.user;
  const userCookie = req.cookies['user_id']
  if (!checkLogin(userCookie)) {
    return res.redirect(`/login`);
  }
  const templateVars = { urls: urlDatabase, user: req.cookies["user_id"] };
  return res.render("urls_new", templateVars);

});






/**
 * POST /urls
 * Route for creating a new URL.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.post("/urls", (req, res) => {
  const userCookie = req.cookies['user_id']
  if (!checkLogin(userCookie)) {//Check tht the user is logged in
    return res.status(403).send('<h3> Cannot access this route without login. \n Login before accessing this route</h3>');
  }
  const { longURL } = req.body;//it will put new data in the body
  const shortURL = generateRandomString();
  const userID = userCookie.id;
  urlDatabase[shortURL] = { longURL, userID }; //Add them to the data base
  return res.redirect(`/urls/${shortURL}`);//Lets make sure that it actually worked hmm?
});






/**
 * POST /urls/:id/delete
 * Route for deleting a URL.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.post("/urls/:id/delete", (req, res) => {//post for delete attatch it to a delete button form
  let found = false;
  const {id}= req.params;
  const userCookie = req.cookies['user_id']
  if (!checkLogin(userCookie)) {//Check tht the user is logged in
    return res.status(403).send('<h3> Cannot access this route without login. \n Login before accessing this route</h3>');
  }

  const userUrls = urlsForUser(userCookie.id);//put the result into userUrls

  for (let url in userUrls) {
    if (url === id) {
      found = true;
      break;
    }
  }

  if (!found) {
    return res.send(`<h3>There are no url with this id for this user</h3>`)
  }

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
  let foundUser = null;
  for (let user in users) {//loop through database to find the email
    if (email === users[user].email && password === users[user].password) {//did you find the email
      foundUser = users[user];
    }
  }
  if (!foundUser) {
    res.status(403).send("<h1>Login Failed - Wrong Login information</h1>");
  }

  if (foundUser) {
    //set cpoockie
    res.cookie('user_id', foundUser)
    return res.redirect('/urls')
  }

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
app.get("/u/:id", (req, res) => {//redirect to the website when the id is passed in (anyone can visit this short url)
  const { id } = req.params;
  if (!checkForUrlId(id)) {//check for the id in the database
    return res.send(`<h3>The id does not exist in the database</h3>`)
  }

  const longURL = urlDatabase[id];
  return res.redirect(`${longURL}`);
});







/**
 * POST /urls/:id
 * Route for editing a URL.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.post("/urls/:id", (req, res) => {//handles Edit of the long url
  const { id } = req.params;//the url id request
  const userCookie = req.cookies['user_id']
  let found = false;

  if (!checkLogin(userCookie)) {//Check that the user is logged in
    return res.status(403).send('<h3> Cannot access this route without login. \n Login before accessing this route</h3>');
  }

  if (!checkForUrlId(id)) {//check for the id in the database
    return res.status(403).send(`<h3>The id does not exist in the database</h3>`)
  }

  const userUrls = urlsForUser(userCookie.id);//put the result into userUrls

  for (let url in userUrls) {
    if (url === id) {
      found = true;
      break;
    }
  }

  if (!found) {
    return res.send(`<h3>There are no url with this id for this user</h3>`)
  }

  const { longURL } = req.body;//to get the data from the form it will put the data in the body

  if (longURL !== 'http://') {
    urlDatabase[id].longURL = longURL;//change the long url here
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
  const cookie = req.cookies['user_id'];
  let found = false;

  if (!checkLogin(cookie)) {
    res.status(403).send(`<h3>Login to access this route.</h3>`)
    return res.redirect(`/login`);
  }

  const urlList = urlsForUser(cookie.id);
  const id = req.params.id;

  for (let url in urlList) {
    if (url === id) {
      found = true;
      break;
    }
  }
  if(!found){
    return res.status(403).send("The URL does nt exist for the user.");
  }

  const longURL = urlDatabase[id].longURL || ' ';
  const templateVars = { id, longURL, user: req.cookies["user_id"] };


  return res.render(`urls_show`, templateVars);
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
  //console.log(users);
  res.redirect("/");
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
/**--------------------------------------------------------------------------------------------------- */
/**
 * Start the server.
 * @param {number} PORT - The port number to listen on.
 */
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
/*---------------------------------------------------------------------------------------------------------------*/



/**
 * Generate a random string.
 * @returns {string} - The generated random string.
 */
const generateRandomString = function () {
  return Math.random().toString(36).substring(4, 10);//return random number between 0 - 1 and convert from decimal to base 36 then get value
  //                                                    from index 4 to 10
};
/**
 * Generate a random string.
 * @returns {string} - The generated random string.
 */
const generateRandomID = function () {
  return Math.random().toString(36).substring(3, 7);//return random number between 0 - 1 and convert from decimal to base 36 then get value
  //                                                    from index 3 to 7
};

/**
 * Returns an object that has the email
 * @param {string} email -  a string with the email format
 * @returns {object} - the user object
 */
const getUserByEmail = function (email) {
  for (let u in users) {
    if (email === users[u].email) {
      return (users[u]);
    }
  }
  return null;
};


/**
 * Takes in a cookie object and compares it to the users database to see if the password and email are the same.
 * @param {Object} cookie 
 * @returns {Boolean}
 */
const checkLogin = function (cookie) {
  if (!cookie) {
    return false;
  }
  const cookieEmail = cookie.email;
  const cookiePass = cookie.password;

  for (let user in users) {
    let { email, password } = users[user];
    if (email === cookieEmail && password === cookiePass) {
      return true;
    }
  }
  return false;
}



/**
 * Return a boolean depending on whether the id of a url exists in the database
 * @param {string} urlId - a url id to search for
 * @returns {boolean}
 */
const checkForUrlId = function (urlId) {
  for (let url in urlDatabase) {
    if (url === urlId) {
      return true;
    }
  }
  return false;
}

/**
 * Returns the URLs of the current user the id is the id of the current user.
 * @param {string} id - the user id connected to the url.
 * @returns {object} object of urls
 */
const urlsForUser = function (id) {
  const getURLs = {};
  for (let urlId in urlDatabase) {
    let { userID } = urlDatabase[urlId];
    if (userID === id) {
      getURLs[urlId] = urlDatabase[urlId];
    }
  }
  return getURLs;
}