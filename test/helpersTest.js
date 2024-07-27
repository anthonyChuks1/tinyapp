const { assert} = require('chai');
const { getUserByEmail, urlsForUser} = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.deepEqual(testUsers[expectedUserID], user);
  }),

  it('non-exinstent email should return undefined.', () =>{
    const user = getUserByEmail("notindatabase@notindatabase.com", testUsers);
    const expectedUserID = undefined;

    assert.deepEqual(expectedUserID, user);

  });
});


describe('urlsForUser', () => {
  const urlDatabase = {
    b2xVn2: { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
    '9sm5xK': { longURL: 'http://www.google.com', userID: 'user2RandomID' }
  };

  it('should return urls that belong to the specified user', () => {
    const userId = 'userRandomID';
    const expectedOutput = {
      b2xVn2: { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' }
    };
    const result = urlsForUser(userId, urlDatabase);
    assert.deepEqual(result, expectedOutput);
  });

  it('should return an empty object if the urlDatabase does not contain any urls that belong to the specified user', () => {
    const userId = 'nonExistentUser';
    const result = urlsForUser(userId, urlDatabase);
    assert.isObject(result);
    assert.isEmpty(result);
  });

  it('should return an empty object if the urlDatabase is empty', () => {
    const userId = 'userRandomID';
    const emptyUrlDatabase = {};
    const result = urlsForUser(userId, emptyUrlDatabase);
    assert.isObject(result);
    assert.isEmpty(result);
  });

  it('should not return any urls that do not belong to the specified user', () => {
    const userId = 'user2RandomID';
    const expectedOutput = {
      '9sm5xK': { longURL: 'http://www.google.com', userID: 'user2RandomID' }
    };
    const result = urlsForUser(userId, urlDatabase);
    assert.deepEqual(result, expectedOutput);
    assert.notProperty(result, 'b2xVn2');
  });
});