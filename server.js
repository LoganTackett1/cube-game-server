const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,       
   optionSuccessStatus:200,
}

var app = express();

const port = process.env.PORT || 3030;

app.use(cors(corsOptions));
app.use(bodyParser.json());

function gameInit() {
    const gameState = {};
    const players = [];
  
    function idGen () {
      let result = "";
      for (let i = 0; i < 10; i+=1) {
        result += Math.floor(Math.random()*10);
      }
      return result;
    }
  
    function newPlayer() {
      const id = idGen();
      players.push(`player${id}`);
      gameState[`player${id}`] = {
        events: [],
        physics: {
          x: 400,
          y: 100,
          a_Vertical: 0,
          v_Vertical: 0,
          v_Horizontal: 0,
        },
        id,
        color: `rgb(${Math.floor(255*Math.random())},${Math.floor(255*Math.random())},${Math.floor(255*Math.random())})`,
      };
      return id;
    }
  
    function newEvent(player, e) {
      gameState[player].events.push(e);
    }
  
    function processEvent(player) {
      const event = player.events[player.events.length - 1];
  
      if (event === "jump") {
        if (player.physics.y <= 100) {
          player.physics.a_Vertical = -1440;
          player.physics.v_Vertical = 360;
        }
      }
      if (event.charAt(0) === "k") {
        if (event.charAt(1) === "u") {
          player.physics.v_Horizontal = 0;
        } else if (event.charAt(1) === "d") {
          if (event.charAt(2) === "a") {
            player.physics.v_Horizontal = -120;
          } else if (event.charAt(2) === "d") {
            player.physics.v_Horizontal = 120;
          }
        }
      }
    }
  
    return {
      gameState,
      newPlayer,
      players,
      newEvent,
    };
  }

  function mergeData(playerData) {
    server.gameState[`player${playerData.id}`].physics = {...playerData.physics}
  }

  const server = gameInit();


async function pushEvents(id,events) {
    server.gameState[`player${id}`].events = events;
}

  app.post("/", (req,res) => {
    if (req.body.type === "sync") {
        mergeData(req.body.playerData)
        const result = server.gameState
        res.json(result);
    } else if (req.body.type === "events") {
        pushEvents(req.body.id,req.body.events);
        res.json({});
    } else if (req.body.type === "first") {
        const id = server.newPlayer();
        const state = server.gameState;
        res.json({"id":id,"state":state})
    }
  });

  app.listen(port, () => {
    console.log('server has started on port: ' + port);
  });