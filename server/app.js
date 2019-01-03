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
    const winningNumber = req.body.winningNumber
    // const playerData = {
    //     username,
    //     guess: null,
    //     host: true,
    //     sessionID: null,
    // }
    const playerData = generatePlayerObj({username, guess: null, host: true, sessionID: null})
    console.log(playerData)
    await pgFunctions.createGame({playerData, winningNumber})
    res.status(200).send()
    //create game on PG database
    //add host to players array
})

app.post("/joinGame", async (req, res) => {
    const username = req.body.username
    const guess = req.body.guess
    const accessCode = req.body.accessCode
    const playerData = generatePlayerObj({username, guess, host: false, sessionID: null})
    await pgFunctions.addPlayer({playerData, accessCode})
    res.status(200).send()
})

var generatePlayerObj = function playerData({username, guess, host, sessionID}) {
    return {
        username,
        guess,
        host,
        sessionID,
    }
}

const port = 5000;
app.listen(port, function() {
  console.log("Express server started.")
})