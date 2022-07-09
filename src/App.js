import React, { Component } from "react";
import "./styles.css";
import { ethers } from "ethers";
import abi from "./ABI";

const HEIGHT = 10;
const WIDTH = 10;
// mapping keycode  for changing direction
const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const DOWN = 40;
const STOP = 32; /* [space] used for pause */

const getRandom = () => {
  return {
    x: Math.floor(Math.random() * WIDTH),
    y: Math.floor(Math.random() * HEIGHT)
  };
};

const emptyRows = () =>
  [...Array(WIDTH)].map((_) => [...Array(HEIGHT)].map((_) => "grid-item"));

const increaseSpeed = (speed) => speed - 10 * (speed > 10);

const initialState = {
  rows: emptyRows(),
  snake: [getRandom()],
  food: getRandom(),
  direction: STOP,
  speed: 100
};

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  componentDidMount() {
    setInterval(this.moveSnake, this.state.speed);
    document.onkeydown = this.changeDirection;
  }

  componentDidUpdate() {
    this.isCollapsed();
    this.isEaten();
  }

  moveSnake = () => {
    let snakeCopy = [...this.state.snake];
    let head = { ...snakeCopy[snakeCopy.length - 1] };
    switch (this.state.direction) {
      case LEFT:
        head.y += -1;
        break;
      case UP:
        head.x += -1;
        break;
      case RIGHT:
        head.y += 1;
        break;
      case DOWN:
        head.x += 1;
        break;
      default:
        return;
    }
    /* keep the value within range of 0 to HEIGHT */
    head.x += HEIGHT * ((head.x < 0) - (head.x >= HEIGHT));
    head.y += WIDTH * ((head.y < 0) - (head.y >= WIDTH));

    snakeCopy.push(head);
    snakeCopy.shift();
    this.setState({
      snake: snakeCopy,
      head: head
    });
    this.update();
  };

  isEaten = async () => {
    let snakeCopy = [...this.state.snake];
    let head = { ...snakeCopy[snakeCopy.length - 1] };
    let food = this.state.food;
    if (head.x === food.x && head.y === food.y) {
      snakeCopy.push(head);
      this.setState({
        snake: snakeCopy,
        food: getRandom(),
        speed: increaseSpeed(this.state.speed)
      });
      let snake = this.state.snake;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
    }
  };

  update() {
    let newRows = emptyRows();
    this.state.snake.forEach(
      (element) => (newRows[element.x][element.y] = "snake")
    );
    newRows[this.state.food.x][this.state.food.y] = "food";
    this.setState({ rows: newRows });
  }

  isCollapsed = async () => {
    const playerAddress = document.getElementById("playeraddress").value;
    console.log(playerAddress);
    const address = "0xD3E0d100F35f7CDF369002f6b0858431A4891704";
    let snake = this.state.snake;
    let head = { ...snake[snake.length - 1] };
    for (let i = 0; i < snake.length - 3; i++) {
      if (head.x === snake[i + 1].x && head.y === snake[i + 1].y) {
        this.setState(initialState);
        var SCORE = `${snake.length * 10}`;
        console.log(SCORE);
        alert("game over:", SCORE);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const contract = await new ethers.Contract(address, abi, signer);
        if (SCORE >= 200 && SCORE <= 299) {
          const tx = await contract.t10(SCORE);

          const txi = await signer.sendTransaction({
            from: "0x290Bc099906e174100389118B6d0522fF2B92D95",
            to: playerAddress,
            value: ethers.utils.parseEther("0.1")
          });
        }
        if (SCORE >= 300 && SCORE <= 399) {
          const tx = await contract.t20(SCORE);

          const txi = await signer.sendTransaction({
            from: "0x290Bc099906e174100389118B6d0522fF2B92D95",
            to: playerAddress,
            value: ethers.utils.parseEther("0.2")
          });
        }
        if (SCORE >= 400 && SCORE <= 499) {
          const tx = await contract.t50(SCORE);

          const txi = await signer.sendTransaction({
            from: "0x290Bc099906e174100389118B6d0522fF2B92D95",
            to: playerAddress,
            value: ethers.utils.parseEther("0.5")
          });
        }
        if (SCORE >= 500) {
          const tx = await contract.t100(SCORE);

          const txi = await signer.sendTransaction({
            from: "0x290Bc099906e174100389118B6d0522fF2B92D95",
            to: playerAddress,
            value: ethers.utils.parseEther("1.0")
          });
        }
      }
    }
  };

  changeDirection = ({ keyCode }) => {
    let direction = this.state.direction;
    switch (keyCode) {
      case LEFT:
        direction = direction === RIGHT ? RIGHT : LEFT;
        break;
      case RIGHT:
        direction = direction === LEFT ? LEFT : RIGHT;
        break;
      case UP:
        direction = direction === DOWN ? DOWN : UP;
        break;
      case DOWN:
        direction = direction === UP ? UP : DOWN;
        break;
      case STOP:
        direction = STOP;
        break;
      default:
        break;
    }
    this.setState({
      direction: direction
    });
  };

  render() {
    const displayRows = this.state.rows.map((row, i) =>
      row.map((value, j) => <div name={`${i}=${j}`} className={value} />)
    );
    return (
      <div className="a">
        <h1> Snake v0.1.1</h1>
        <ul>
          <li>press "space" to pause the game.</li>
          <li>press "arrow keys" to change direction/ unpause.</li>
        </ul>{" "}
        <img
          src="https://searchengineland.com/wp-content/seloads/2017/03/GoogleAd_1920.jpg"
          class="img-fluid"
          alt="Responsive image"
          style={{ height: "200px", width: "600px" }}
        />
        <input
          className="form-control"
          type="text"
          placeholder="Enter your address"
          id="playeraddress"
        />
        <div className="snake-container">
          <div className="grid">{displayRows}</div>
        </div>
        <img
          src="https://c8.alamy.com/comp/2H8422M/ad-letter-linked-logo-for-business-and-company-identity-initial-letter-ad-logo-vector-template-2H8422M.jpg"
          class="img-fluid"
          alt="Responsive image"
          style={{ height: "200px", width: "600px" }}
        />
      </div>
    );
  }
}

export default App;
