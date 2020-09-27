const User = require("./User");
const { red, yellow } = require("./constants");
class GamePlay {
  constructor(firstUserId, secondUserId, matrix = null) {
    const n = 6;
    const m = 7;
    this.rowNumber = 0;
    this.winner = undefined;
    this.valid = false;
    this.firstUserId = firstUserId;
    this.secondUserId = secondUserId;
    this.matrix =
      JSON.parse(matrix) ||
      Array.from(Array(n)).map((x, i) => Array.from(Array(m)));
  }

  isValidMove(columnNumber) {
    if (columnNumber - 1 >= this.matrix[0].length) return false;

    const column = this.matrix[this.matrix.length - 1];
    if (column[columnNumber - 1]) return false;

    return true;
  }

  checkRow(coinType) {
    let count = 0;
    const row = this.matrix[this.rowNumber];
    for (let i = 0; i < row.length; i++) {
      if (row[i] === coinType) {
        count++;
        if (count === 4) break;
      } else {
        count = 0;
      }
    }

    return count === 4 ? true : false;
  }

  checkColumn(coinType, columnNumber) {
    let count = 0;
    for (let i = 0; i < this.matrix.length; i++) {
      if (this.matrix[i][columnNumber - 1] === coinType) {
        count++;
        if (count === 4) break;
      } else {
        count = 0;
      }
    }
    return count === 4 ? true : false;
  }

  checkleftDiagonal(coinType, columnNumber) {
    let count = 0;
    let leftMostX = 0;
    let leftMostY = columnNumber - 1 - this.rowNumber;
    while (
      leftMostX < this.matrix[0].length &&
      leftMostY < this.matrix.length &&
      leftMostY >= 0
    ) {
      if (this.matrix[leftMostX][leftMostY] === coinType) {
        count++;
        if (count === 4) break;
      } else count = 0;
      leftMostX++;
      leftMostY++;
    }
    return count === 4 ? true : false;
  }

  checkRightDiagonal(coinType, columnNumber) {
    let count = 0;
    let leftMostX = 0;
    let leftMostY = columnNumber - 1 + this.rowNumber;
    while (leftMostX < this.matrix[0].length && leftMostY >= 0) {
      if (this.matrix[leftMostX][leftMostY] === coinType) {
        count++;
        if (count === 4) break;
      } else count = 0;
      leftMostX++;
      leftMostY--;
    }
    return count === 4 ? true : false;
  }

  hasWon(coinType, columnNumber) {
    if (
      this.checkRow(coinType) ||
      this.checkColumn(coinType, columnNumber) ||
      this.checkleftDiagonal(coinType, columnNumber) ||
      this.checkRightDiagonal(coinType, columnNumber)
    ) {
      return true;
    }
    return false;
  }

  async upsertData(userId, move) {
    const user = await User.findOne({ userId: userId });
    if (!user) {
      await User.create({
        userId: userId,
        gameMatrix: this.matrix,
        move: move,
      });
    } else {
      user.gameMatrix = this.matrix;
      user.move = move;
      user.save();
    }
  }

  async play(columnNumber, move) {
    if (this.isValidMove(columnNumber)) {
      this.valid = true;
      for (let i = 0; i < this.matrix.length; i++) {
        let column = this.matrix[i];
        if (!column[columnNumber - 1]) {
          this.rowNumber = i;
          if (move % 2 === 0) {
            column[columnNumber - 1] = red;
            await this.upsertData(this.firstUserId,move);
            if (this.hasWon(red, columnNumber)) {
              this.winner = `${red} wins`;
            }
          } else {
            column[columnNumber - 1] = yellow;
            await this.upsertData(this.secondUserId,move);
            if (this.hasWon(yellow, columnNumber)) {
              this.winner = `${yellow} wins`;
            }
          }
          break;
        }
      }
    } else {
      this.valid = false;
    }

    return {
      isValid: this.valid,
      winner: this.winner,
      matrix: this.matrix,
      move: move + 1,
      user1: this.firstUserId,
      user2: this.secondUserId,
    };
  }
}

module.exports = GamePlay;
