const express = require("express");
const app = express();
const GamePlay = require("./game-play");
const { v4: uuidv4 } = require("uuid");
const keys = require("./config/keys");
const mongoose = require("mongoose");
const User = require('./User');

const PORT = process.env.PORT || 9000;

app.use(express.json());

app.post("/startgame", async (req, res, next) => {
  let {
    startgame,
    columnNumber,
    nextMove,
    gameMatrix,
    user1Id,
    user2Id,
  } = req.body;
  let startGame;
  if (startgame === "START") {
    const firstUserId = uuidv4();
    const secondUserId = uuidv4();
    startGame = new GamePlay(firstUserId, secondUserId);
    return res.status(200).json({ firstUserId, secondUserId, msg: "READY" });
  } else {
    nextMove = nextMove || 0;
    startGame = new GamePlay(user1Id, user2Id, JSON.stringify(gameMatrix));
    const { isValid, winner, matrix, move, user1, user2 } = await startGame.play(
      columnNumber,
      nextMove
    );

    return res.status(200).json({
      isValid,
      winner,
      matrix,
      move,
      user1,
      user2,
    });
  }
});

app.get("/getGameDataByUserId/:userId", async (req, res) => {
  const { userId } = req.params;
  const userData = await User.findOne({userId:userId});
  return res.status(200).json(userData);
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
  mongoose
    .connect(keys.ConnectionURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("mongodb connected");
    })
    .catch((err) => {
      console.log("error connecting mongodb");
    });
});
