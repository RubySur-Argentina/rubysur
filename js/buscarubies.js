const SURROUNDING_POSITIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

const colors = {
  1: "green",
  2: "red",
  3: "blue",
  4: "brown",
  5: "black",
  6: "teal",
  7: "yellow",
  8: "pink",
};

let rightButtonDown = false;

document.addEventListener("mousedown", function (ev) {
  if (ev.button === 2) {
    rightButtonDown = true;
  }
});

document.addEventListener("mouseup", function (ev) {
  if (ev.button === 2) {
    rightButtonDown = false;
  }
});

class BuscaRubies {
  constructor(width, height, rubies) {
    this.dialog = document.querySelector("dialog.buscarubies");
    this.timerView = this.dialog.querySelector(".timer");
    this.rubiesCounter = this.dialog.querySelector(".counter");
    this.totalRubies = rubies;
    this.state = "playing";
    this.board = new Board(width, height, rubies, this);

    this.bindCloseButton();
    this.bindResetButton();
    this.resetCounter();
    this.startTimer();
  }

  startTimer() {
    this.startedAt = new Date();
    this.timerReference = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now - this.startedAt) / 1000);
      this.timerView.innerHTML = `Timer: ${diff}`;
    }, 200);
  }

  stopTimer() {
    clearTimeout(this.timerReference);
  }

  bindCloseButton() {
    const closeButton = this.dialog.querySelector(".close");
    closeButton.addEventListener("click", () => {
      this.dialog.close();
      this.board.removeEventListeners();
      this.stopTimer();
    });
  }

  bindResetButton() {
    const resetButton = this.dialog.querySelector(".result .reset");
    resetButton.addEventListener("click", () => this.reset());
  }

  showModal() {
    this.dialog.showModal();
  }

  won() {
    this.stopTimer();
    this.state = "won";
  }

  lost() {
    this.stopTimer();
    this.state = "lost";
  }

  reset() {
    this.stopTimer();
    this.startTimer();
    this.board.reset();
    this.resetCounter();
    this.state = "playing";
  }

  resetCounter() {
    this.counter = this.totalRubies;
    this.rubiesCounter.innerHTML = `Rubies: ${this.counter}`;
  }

  decreaseCounter() {
    this.counter--;
    this.rubiesCounter.innerHTML = `Rubies: ${this.counter}`;
  }

  increaseCounter() {
    this.counter++;
    this.rubiesCounter.innerHTML = `Rubies: ${this.counter}`;
  }
}

class Board {
  constructor(width, height, rubies, game) {
    this.game = game;
    this.width = width;
    this.height = height;
    this.rubies = rubies;
    this.initialized = false;
    this.initElement();
  }

  initElement() {
    this.cells = {};
    this.listenersAbortController = new AbortController();
    const el = document.querySelector(".buscarubies .board");
    el.style = `grid-template-rows: repeat(${this.height}, 1fr); grid-template-columns: repeat(${this.width}, 1fr);`;

    el.addEventListener(
      "click",
      (ev) => {
        if (ev.target.classList.contains("cell")) {
          let dualClick = false;
          // se hizo click izquierdo mientras se apretaba el botón derecho
          if (rightButtonDown) {
            if (this.initialized) dualClick = true;
            rightButtonDown = false;
          }
          if (!this.initialized) this.initializeRubies(ev.target.cell);
          if (this.game.state !== "playing") return;

          if (ev.target.cell.isClickable()) {
            ev.target.cell.onClick();
            this.processClicked(ev.target.cell);
          } else if (dualClick && ev.target.cell.isNumber()) {
            this.clickSurrounding(ev.target.cell);
          }
        }
      },
      { signal: this.listenersAbortController.signal },
    );

    el.addEventListener(
      "auxclick",
      (ev) => {
        ev.preventDefault();
        if (!this.initialized) return;
        if (this.game.state !== "playing") return;

        if (ev.target.classList.contains("cell")) {
          ev.target.cell.onRightClick();
        }
      },
      { signal: this.listenersAbortController.signal },
    );

    el.addEventListener(
      "contextmenu",
      (ev) => {
        ev.preventDefault();
      },
      { signal: this.listenersAbortController.signal },
    );

    this.element = el;
    this.createCells();
  }

  removeEventListeners() {
    this.listenersAbortController.abort();
  }

  createCells() {
    for (let row = 1; row <= this.width; row++) {
      this.cells[row] = {};
      for (let col = 1; col <= this.height; col++) {
        const cell = new Cell(this, row, col);
        this.cells[row][col] = cell;
        cell.element.addEventListener("contextmenu", (ev) =>
          ev.preventDefault(),
        );
        this.element.insertAdjacentElement("beforeend", cell.element);
      }
    }
  }

  initializeRubies(cellToSkip) {
    const setRubyOnEmptyCell = () => {
      let set = false;
      while (!set) {
        const randomCol = Math.ceil(Math.random() * this.width);
        const randomRow = Math.ceil(Math.random() * this.height);
        const cell = this.cells[randomRow][randomCol];
        if (cell !== cellToSkip && cell.isEmpty()) {
          cell.setContent("r");
          set = true;
        }
      }
    };

    for (let ruby = 0; ruby < this.rubies; ruby++) {
      setRubyOnEmptyCell();
    }

    const setNumbers = () => {
      for (let row = 1; row <= this.width; row++) {
        for (let col = 1; col <= this.height; col++) {
          const cell = this.cells[row][col];
          if (cell.isEmpty()) {
            const surroundingCells = this.getSurroundingCells(cell);
            const number = surroundingCells.filter((cell) =>
              cell.isRuby(),
            ).length;
            if (number !== 0) cell.setContent(number);
          }
        }
      }
    };

    setNumbers();

    this.initialized = true;
  }

  getSurroundingCells(cell) {
    const row = cell.row;
    const col = cell.col;
    const surroundingCells = [];

    for (let position of SURROUNDING_POSITIONS) {
      const deltaRow = position[0];
      const deltaCol = position[1];

      const colToCheck = col + deltaCol;
      const rowToCheck = row + deltaRow;
      if (colToCheck < 1 || rowToCheck < 1) {
        // left or top edges
      } else if (colToCheck > this.width || rowToCheck > this.height) {
        // right or bottom edges
      } else {
        surroundingCells.push(this.cells[rowToCheck][colToCheck]);
      }
    }
    return surroundingCells;
  }

  processClicked(clickedCell) {
    if (clickedCell.isRuby()) {
      this.game.lost();
      this.element.classList.add("lost");
    } else {
      if (clickedCell.isEmpty()) {
        this.expandClicked(clickedCell, []);
      }
      this.checkWinState();
    }
  }

  expandClicked(clickedCell, alreadyChecked) {
    alreadyChecked.push(clickedCell);
    const surroundingCells = this.getSurroundingCells(clickedCell);
    surroundingCells.forEach((cell) => {
      if (alreadyChecked.includes(cell)) return;

      alreadyChecked.push(cell);

      if (!cell.isRuby()) {
        cell.setState("revealed");
        if (cell.isEmpty()) this.expandClicked(cell, alreadyChecked);
      }
    });
  }

  clickSurrounding(clickedCell) {
    const surroundingCells = this.getSurroundingCells(clickedCell);
    surroundingCells.forEach((cell) => {
      if (!cell.isClickable()) return;
      cell.onClick();
      if (cell.isRuby()) {
        this.game.lost();
        this.element.classList.add("lost");
      } else if (cell.isEmpty()) this.expandClicked(cell, []);
    });
    this.checkWinState();
  }

  checkWinState() {
    let onlyHiddenRubies = true;

    loop1: for (let row = 1; row <= this.width; row++) {
      for (let col = 1; col <= this.height; col++) {
        const cell = this.cells[row][col];
        if (!cell.isRuby() && !cell.isRevealed()) {
          onlyHiddenRubies = false;
          break loop1;
        }
      }
    }

    if (onlyHiddenRubies) {
      this.game.won();
      this.element.classList.add("won");
    }
  }

  reset() {
    this.removeEventListeners();
    this.element.innerHTML = "";
    this.element.classList.remove("won");
    this.element.classList.remove("lost");
    this.initialized = false;

    setTimeout(() => {
      this.initElement();
    }, 10);
  }
}

class Cell {
  constructor(board, row, col) {
    this.board = board;
    this.row = row;
    this.col = col;
    this.state = "hidden"; // hidden, revealed, marked, flagged
    this.content = " "; // empty, ruby, number
    this.visibleContent = " ";
    this.initElement();
  }

  initElement() {
    this.element = document.createElement("button");
    this.element.classList.add("cell");
    this.element.dataset.col = this.col;
    this.element.dataset.row = this.row;
    this.element.dataset.state = this.state;
    this.element.style = `grid-column: ${this.col}; grid-row: ${this.row};`;
    this.element.innerHTML = this.visibleContent;
    this.element.cell = this;
  }

  setContent(newContent) {
    this.content = newContent;
  }

  setVisibleContent(newVisibleContent) {
    this.visibleContent = newVisibleContent;
    this.element.innerHTML = newVisibleContent;
    if (this.isNumber() && this.visibleContent === this.content) {
      this.element.style = `grid-column: ${this.col}; grid-row: ${this.row}; color: ${colors[this.content]}; font-size: 1.2rem;`;
    }
  }

  setState(newState) {
    this.state = newState;
    this.element.dataset.state = this.state;
    switch (this.state) {
      case "flagged":
        this.setVisibleContent("❗");
        break;
      case "marked":
        this.setVisibleContent("❓");
        break;
      case "revealed":
        if (this.isRuby()) this.element.classList.add("ruby");
        else if (this.isEmpty()) this.element.classList.add("empty");
        else this.setVisibleContent(this.content);
        break;
      case "hidden":
        this.setVisibleContent(" ");
        break;
    }
  }

  onRightClick() {
    switch (this.state) {
      case "hidden":
        this.board.game.decreaseCounter();
        this.setState("flagged");
        break;
      case "revealed":
        break;
      case "marked":
        this.setState("hidden");
        break;
      case "flagged":
        this.board.game.increaseCounter();
        this.setState("marked");
        break;
    }
  }

  onClick() {
    if (this.state === "hidden") {
      this.setState("revealed");
    }
  }

  isRuby() {
    return this.content === "r";
  }
  isEmpty() {
    return this.content === " ";
  }
  isNumber() {
    return !this.isRuby() && !this.isEmpty();
  }

  isClickable() {
    return this.state === "hidden";
  }
  isRevealed() {
    return this.state === "revealed";
  }
}

let buscaRubies = null;
const initBuscaRubies = () => {
  if (!buscaRubies) {
    buscaRubies = new BuscaRubies(20, 20, 50);
  } else {
    buscaRubies.reset();
  }
  buscaRubies.showModal();
};

const buscarubies = () => {
  document
    .querySelector(".copyright .buscarubies")
    .addEventListener("click", () => initBuscaRubies());
};
