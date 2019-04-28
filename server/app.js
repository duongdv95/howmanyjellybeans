const express          = require("express");
const https            = require("https");
const http             = require("http")
const app              = express();
const bodyParser       = require("body-parser");
const pgFunctions      = require("./pgFunctions");
const session          = require("express-session");
const uuid             = require("uuid/v4");
const KnexSessionStore = require("connect-session-knex")(session);
const knexfile         = require("./knexfile.js");
const knex             = require("knex")(knexfile);
const path             = require("path");
const socket           = require("socket.io");
const fs               = require("fs")
const cors             = require("cors")
const env              = process.env.NODE_ENV || "development"
const port             = process.env.PORT || 5000;
const proxy            = require("http-proxy-middleware")
var hscert, hschain, hskey, io, server

if(env === "development") {
    module.exports = function(app) {
        app.use(proxy('/api', { target: 'http://localhost:5000/' }));
      };
    app.use(express.static(path.join(__dirname, 'public')));
    server = require("http").createServer(app);
    server.listen(port, function() {
        console.log(`Server listening at port ${port}`)
    })
    io = socket.listen(server)
} 
if(env === "production") {
    app.use(cors())
    app.use(express.static(__dirname + '/../build/static', { dotfiles: 'allow' }))
    app.use(express.static(path.join(__dirname, '/../build')));
    app.set("trust proxy", 1)


    hskey     = fs.readFileSync('/etc/letsencrypt/live/howmanyjellybeans.com-0002/privkey.pem')
    hscert    = fs.readFileSync('/etc/letsencrypt/live/howmanyjellybeans.com-0002/cert.pem')
    hschain   = fs.readFileSync('/etc/letsencrypt/live/howmanyjellybeans.com-0002/chain.pem')
    var serverOptions = {
        key: hskey,
        cert: hscert,
        ca: hschain
    }
    // app.listen(80, () => {
    //     console.log("connected on 80..")
    // })
    app.listen(80, () => {
        console.log('Listening on 80...')
      })
    server = https.createServer(serverOptions, app).listen(443, () => {
        console.log('SSL Listening...')
    })
    io = socket.listen(server)
}

io.on('connection', function (socket) {
    // console.log(`Socket ${socket.id} connected.`)
    socket.on('disconnect', () => {
        // console.log(`Socket ${socket.id} disconnected.`);
      });

    socket.on("subscribeToDatabase", (accessCode) => {
        socket.join(accessCode)
    })
 });

app.use(bodyParser.json());
app.use(session({
    genid: (req) => {
        return uuid()
    },
    store: new KnexSessionStore({
        knex: knex,
        tablename: "sessions"
    }),
    secret: "merp",
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: null, secure: true}
}));

app.get("/api/:id/status", async (req, res) => {
    const accessCode = req.params.id
    const response = await pgFunctions.gameStatus({accessCode});
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

app.get("/api/:id/players", isHost, async (req, res) => {
    const accessCode = req.params.id
    const sessionID = req.session.id
    const response = await pgFunctions.getPlayers({accessCode, sessionID});
    if(!req.isHost) {
        response.winningNumber = null
    }
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

// Restricted to host
app.get("/api/:id/sortplayers", isAllowed({role: "host"}), async (req, res) => {
    const accessCode = req.params.id
    const response = await pgFunctions.getSortedPlayersRank({accessCode});
    response ? res.status(200).json(response) : res.status(400).json(response.message)
})

app.post("/api/createGame", async (req, res) => {
    const username = req.body.username
    const winningNumber = req.body.winningNumber
    const playerData = generatePlayerObj({username, guess: null, host: true, sessionID: req.sessionID})
    const response = await pgFunctions.createGame({playerData, winningNumber})
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

app.post("/api/addPlayer", checkDuplicateUsers, gameNotOver, async (req, res) => {
    const username = req.body.username
    const guess = req.body.guess
    const accessCode = req.body.accessCode
    const playerData = generatePlayerObj({username, guess, host: false, sessionID: req.sessionID})
    const response = await pgFunctions.addPlayer({playerData, accessCode})
    if(response.status) {
        res.status(200).json(response)
        await pgFunctions.sortPlayerRank({accessCode})
        io.to(accessCode).emit("databaseUpdated", true)
    } else {
        res.status(400).json(response)
    }
})

// Restricted to host
app.delete("/api/:id/deleteGame", isAllowed({role: "host"}), async (req, res) => {
    const accessCode = req.params.id;
    const response = await pgFunctions.deleteGame({accessCode});
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

app.put("/api/:id/endGame", isAllowed({role: "host"}), async (req, res) => {
    const accessCode = req.params.id;
    const response = await pgFunctions.endGame({accessCode});
    if(response.status) {
        res.status(200).json(response)
        // setTimeout(() => {
        //     io.to(accessCode).emit("databaseUpdated", true)
        // }, 1000)
        io.to(accessCode).emit("databaseUpdated", true)
    } else {
        res.status(400).json(response)
    }
})

// Restricted to host
app.put("/api/deletePlayer", isAllowed({role: "host"}), gameNotOver, async (req, res) => {
    const sessionID = req.session.id
    const playerID = req.body.playerID
    const accessCode = req.body.accessCode
    const response = await pgFunctions.deletePlayer({sessionID, playerID, accessCode})
    if(response.status) {
        res.status(200).json(response)
        io.to(accessCode).emit("databaseUpdated", true)
    } else {
        res.status(400).json(response)
    }
})

app.put("/api/approvePlayer", isAllowed({role: "host"}), gameNotOver, async (req, res) => {
    const accessCode = req.body.accessCode
    const playerID = req.body.playerID
    const playerApproved = req.body.approved
    const response = await pgFunctions.approvePlayer({accessCode, playerID, playerApproved})
    if(response.status) {
        res.status(200).json(response)
        io.to(accessCode).emit("databaseUpdated", true)
    } else {
        res.status(400).json(response)
    }
})

app.put("/api/leaveGame", isAllowed({role: "player"}), gameNotOver, async (req, res) => {
    const sessionID = req.session.id
    const accessCode = req.body.accessCode
    const response = await pgFunctions.deletePlayer({sessionID, accessCode})
    if(response) {
        req.session.destroy(function(){
          });
    }
    if(response.status) {
        res.status(200).json(response)
        io.to(accessCode).emit("databaseUpdated", true)
    } else {
        res.status(400).json(response)
    }
})

//Unused endpoint
app.put("/api/updatePlayer", isAllowed({role: "host"}), gameNotOver, async (req, res) => {
    const playerID = req.body.playerID
    const accessCode = req.body.accessCode
    const guess = req.body.guess
    const host = req.body.host
    const response = await pgFunctions.updatePlayer({playerID, accessCode, guess, host})
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

if(env === "production") {
    // function requireHTTPS(req, res, next) {
    //     if (!req.secure) {
    //         return res.redirect('https://' + req.hostname + req.url);
    //     }
    //     next();
    // }
    // app.use(requireHTTPS);
    app.get("*", (req, res) => {
        if (!req.secure) {
            res.redirect('https://' + req.hostname + req.url);
        }
        res.sendFile(path.join(__dirname + "/../build/index.html"));
    })
}

var generatePlayerObj = function playerData({username, guess, host, sessionID}) {
    return {
        username,
        guess: guess + "",
        host,
        sessionID,
    }
}

async function deleteGames() {
    const response = await pgFunctions.getGames()
    if(response.status) {
        const gamesArray = response.message
        for(let i = 0; i < gamesArray.length; i++) {
            var date = new Date(gamesArray[i].created_at)
            var currentDate = new Date()
            currentDate.setMilliseconds(0)
            var timeElapsed = (currentDate - date)/1000
            //24*60*60, 24 hours converted to seconds
            var accessCode = gamesArray[i].access_code
            if (timeElapsed > 24*60*60) {
                //delete all games every 24 hour 
                var responses = await pgFunctions.deleteGame({accessCode})
            }
        }
    }
}

setInterval(deleteGames, 1*60*60*1000) //check DB every hour for any games to delete

function isAllowed(args) {
    const role = args.role //"host" or "player"
    const isHost = (role === "host") ? true : false
    return async function (req, res, next) {
        const sessionID = req.session.id
        const accessCode = req.params.id || req.body.accessCode
        const response = await pgFunctions.getPlayers({accessCode, revealSessionID: true})
        if(response.gameEnded === true) {
            return next()
        }
        const playersArray = response.message
        const condition = function(i) {
            return (isHost) ? (playersArray[i].sessionID == sessionID && playersArray[i].host == true) : (playersArray[i].sessionID == sessionID)
        }
        for(let i = 0; i < playersArray.length; i++) {
            if(condition(i)) {
                return next()
            }
        }
        res.status(400).json({status: false, message: "Unauthorized"})
    }
}

async function isHost(req, res, next) {
    const sessionID = req.session.id
    const accessCode = req.params.id || req.body.accessCode
    const response = await pgFunctions.getPlayers({accessCode, revealSessionID: true})
    req.isHost = false;
    if(response.gameEnded === true) {
        return next()
    }
    const playersArray = response.message
    for(let i = 0; i < playersArray.length; i++) {
        if((playersArray[i].sessionID === sessionID && playersArray[i].host === true)) {
            req.isHost = true;
        }
    }
    return next()
}

async function gameNotOver(req, res, next) {
    const accessCode = req.params.id || req.body.accessCode
    const response = await pgFunctions.gameStatus({accessCode});
    if(response.message === false) {
        return next()
    }
    res.status(400).json({status: false, message: "Game does not exist"})
}

async function checkDuplicateUsers(req, res, next) {
    const accessCode = req.params.id || req.body.accessCode
    const sessionID = req.session.id
    const response = await pgFunctions.getPlayers({accessCode, revealSessionID: true})
    if(!response.status) {
        return next();
    }
    const playersArray = response.message
    let duplicateFound = false;
    playersArray.forEach((element) => {
        if(element.sessionID === sessionID) {
            duplicateFound = true;
            return res.status(400).json({status: false, message: "User already in game"})
        }
    })
    if(!duplicateFound) {
        return next();
    }
}

// 3000 for heroku deployment, and 5000 for dev environment



// http.createServer(app).listen(port, () => {
//     console.log('Listening...')
//   })

//Add ,"proxy": "http://localhost:5000" to package.json during dev environment