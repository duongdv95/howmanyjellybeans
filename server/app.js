const express = require("express");
const app     = express();
const session = require("express-session");

app.get("/users", (req, res) => {
    const obj = [{firstname: "daniel", lastname: "duong"}, {firstname: "bob", lastname: "jones"}, {firstname: "smith", lastname: "jeet"}]
    console.log("yeet");
    res.json(obj)
})

app.post("/createGame", (req, res) => {
    //create game on PG database
    //add host to players array
})

const port = 5000;
app.listen(port, function() {
  console.log("Express server started.")
})