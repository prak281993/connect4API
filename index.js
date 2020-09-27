const express = require("express");
const app = express();
const GamePlay = require("./game-play");
const { v4: uuidv4 } = require("uuid");
const keys = require("./config/keys");
const mongoose = require("mongoose");
const User = require("./User");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

const PORT = process.env.PORT || 9000;

app.use(express.json());

const swaggerOptions = swaggerJsDoc({
  swaggerDefinition: {
    servers: [`http://localhost:${PORT}`],
  },
  apis: ["index.js"],
});

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerOptions));

// Routes
/**
 * @swagger
 *
 * /startgame:
 *   post:
 *     summary: Connect 4 API
 *     description: When game is started for the first time send 'START' in startgame which will return unique usernames for first and second user, the gameMatrix field will be null for 1st move but from 2nd move onwards the matrix recieved in response should be sent in gameMatrix field
 *     parameters:
 *       - in: body
 *         name: Connect4
 *         schema:
 *           type: object
 *           properties:
 *             startgame:
 *               type: string
 *             columnNumber:
 *               type: integer
 *             nextMove:
 *               type: integer
 *             gameMatrix:
 *               type: array
 *               items:
 *                 type: array
 *                 items: string
 *               description: This will be empty for first move but from 2nd move onwards the matrix recieved from response should be sent here
 *             user1Id:
 *               type: string
 *             user2Id:
 *               type: string
 *     responses:
 *       '200':
 *         description: OK
 */
app.use("/startgame", async (req, res, next) => {
  let {
    startgame,
    columnNumber,
    nextMove,
    gameMatrix,
    user1Id,
    user2Id,
  } = req.body;
  let startGame;
  try {
    if (startgame === "START") {
      const firstUserId = uuidv4();
      const secondUserId = uuidv4();
      startGame = new GamePlay(firstUserId, secondUserId);
      return res.status(200).json({ firstUserId, secondUserId, msg: "READY" });
    } else {
      nextMove = nextMove || 0;
      startGame = new GamePlay(user1Id, user2Id, JSON.stringify(gameMatrix));
      const {
        isValid,
        winner,
        matrix,
        move,
        user1,
        user2,
      } = await startGame.play(columnNumber, nextMove);

      return res.status(200).json({
        isValid,
        winner,
        matrix,
        move,
        user1,
        user2,
      });
    }
  } catch (err) {
    return res.status(500).json("Internal server error");
  }
});

/**
 * @swagger
 *
 * /getGameDataByUserId/{userId}:
 *   get:
 *     summary: Get game data by user id
 *     description: Get the latest game state by unique username
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 */

app.get("/getGameDataByUserId/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = await User.findOne({ userId: userId });
    return res.status(200).json(userData);
  } catch (err) {
    return res.status(500).json("Internal server error");
  }
});

process.on("uncaughtException", (req, res) => {
  return res.status(500).json({ msg: "Internal server error" });
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
