const express     = require("express");
const app         = express();
const bodyParser  = require("body-parser");
const pgFunctions = require("./pgFunctions");
const session     = require("express-session");

app.use(bodyParser.json());
app.use(session({
    secret: "merp",
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: null}
}));

app.get("/users", (req, res) => {
    const obj = [{firstname: "daniel", lastname: "duong"}, {firstname: "bob", lastname: "jones"}, {firstname: "smith", lastname: "jeet"}]
    console.log("yeet");
    res.json(obj)
})

app.post("/createGame", async (req, res) => {
    const username = req.body.username
    const playerData = {
        username,
        guess: null,
        host: true,
        sessionID: null,
    }
    console.log(playerData)
    await pgFunctions.createGame({playerData})
    res.status(200).send()
    //create game on PG database
    //add host to players array
})

const port = 5000;
app.listen(port, function() {
  console.log("Express server started.")
})