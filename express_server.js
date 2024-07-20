const express = require('express');
const app = express();
const PORT = 8080; //default port 8080

app.set("view engine", "ejs"); //set ejs as view engine.

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.use(express.urlencoded({ extended: true }));//converts the request body from a buffer
//                     into string we can read and add it to the req(request) object under key body.



app.get("/urls", (req, res) => {//route for /urls
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  //console.log(req.body);//Log the POST request body to the console
  const urlLong = req.body.longURL;
  const urlShort = generateRandomString();
  urlDatabase[urlShort] = urlLong; //Add them to the data base 
  //console.log(urlDatabase);
  
  
  //res.send("Ok"); //Respond with 'Ok' 
  res.redirect(`/urls/${urlShort}`);//Lets make sure that it actually worked hmm?
})

app.get("/u/:id", (req, res) => {//redirect to the website when the id is passed in
  const {id} = req.params;
  const longURL = urlDatabase[id];
  res.redirect(`${longURL}`);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = function () {
  return Math.random().toString(36).substring(4, 10);//return random number between 0 - 1 and convert from decimal to base 36 then get value
  //                                                    from index 4 to 10
}
//console.log(generateRandomString());