
/**
 * 
 * This file contains all helper functions for the tinyapp web application
 */

/*------------------HELPERS\\--------------------------------------------------------------------------------------------*/




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
const getUserByEmail = function (email, database) {
  for (let u in database) {
    if (email === database[u].email) {
      return (database[u]);
    }
  }
  return null;
};


/**
 * Takes in a cookie object and compares it to the users database to see if the password and email are the same.
 * @param {Object} cookie 
 * @returns {Boolean}
 */
const checkLogin = function (cookie, users) {
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
const checkForUrlId = function (urlId, urlDatabase) {
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
const urlsForUser = function (id, urlDatabase) {
  const getURLs = {};
  for (let urlId in urlDatabase) {
    let { userID } = urlDatabase[urlId];
    if (userID === id) {
      getURLs[urlId] = urlDatabase[urlId];
    }
  }
  return getURLs;
}


/**Exports here  */
module.exports = {
  generateRandomString,
  generateRandomID,
  getUserByEmail,
  checkLogin,
  checkForUrlId,
  urlsForUser,
}