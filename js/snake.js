const randomPosition = (size) => {
  return [Math.floor(Math.random() * size), Math.floor(Math.random() * size)];
};

const snake = () => {
  const gameContainer = document.querySelector(".snakeBoard");
  const board = gameContainer.querySelector(".board");
  const scoreContainer = gameContainer.querySelector(".score");
  const closeGame = gameContainer.querySelector(".close");

  const letterKeyCodes = ["KeyR", "KeyU", "KeyB", "KeyY"];
  let typingBuffer = [];
  const arrowKeyCodes = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  // tamaño del mapa
  const boardSize = 15;
  // guardo la cabeza como array para evitar calcular el array en cada loop
  let currentHead = null;
  // las posiciones del cuerpo de la serpiente, primero es cabeza, el resto son el cuerpo, en orden
  // tiene strings tipo "0,1" en lugar de arrays para que sea más fácil el lookup
  let snakeBody = [];
  // reference to span elements to draw the snake
  let snakeBodySpans = [];
  // dirección en la que se va a mover la cabeza en cada loop
  let direction = null;
  let newDirection = null;
  // estado actual del juego
  let gameState = "idle"; // "idle" | "playing" | "lost" | "won"
  let score = 0;

  // posición del Ruby, imagen y manejo en grid
  let rubyPosition = null;
  const rubyImg = document.createElement("IMG");
  rubyImg.src = "/images/icons/ruby.png";

  const newRubyPosition = () => {
    let newPosition = rubyPosition || randomPosition(boardSize).join();
    while (snakeBody.includes(newPosition)) {
      newPosition = randomPosition(boardSize).join();
    }
    rubyPosition = newPosition;

    rubyImg.style.gridColumn = parseInt(rubyPosition.split(",")[0]) + 1;
    rubyImg.style.gridRow = parseInt(rubyPosition.split(",")[1]) + 1;
  };

  // para debuggear imprimiendo en consola
  const getStringBoard = () => {
    const rowStrings = ["-".repeat(boardSize + 2)];
    for (let row = 0; row < boardSize; row++) {
      const rowStates = ["|"];
      for (let col = 0; col < boardSize; col++) {
        const st = `${col},${row}`;
        if (snakeBody.includes(st)) {
          rowStates.push("■");
        } else if (rubyPosition === st) {
          rowStates.push("□");
        } else {
          rowStates.push(" ");
        }
      }
      rowStates.push("|");
      rowStrings.push(rowStates.join(""));
    }
    rowStrings.push("-".repeat(boardSize + 2));

    return rowStrings.join("\n");
  };

  let scroll = 0;
  // abro modal del juego y evito scroll en el fondo
  const openGameModal = () => {
    drawBoard(getStringBoard());
    scroll = window.scrollY;
    document.body.style.top = `-${scroll}px`;
    document.body.style.position = "fixed";

    gameContainer.showModal();
  };

  // cierro modal
  closeGame.addEventListener("click", () => {
    gameContainer.close();
    document.body.style.position = "static";
    window.scrollTo(0, scroll);
    gameState = "idle";
  });

  // actualizo grid visible para el usuario
  const drawBoard = () => {
    // mensaje si ganó
    if (gameState === "won") {
      board.innerHTML = "";
      board.insertAdjacentElement("beforeend", wonMessage);
      return;
    }

    // mensaje si perdió
    if (gameState === "lost") {
      board.innerHTML = "";
      board.insertAdjacentElement("beforeend", lostMessage);
      return;
    }

    // actualizo todos los spans en la grilla
    for (let idx = 0; idx < snakeBody.length; idx++) {
      const pos = snakeBody[idx].split(",");
      const span = snakeBodySpans[idx];
      span.style.gridColumn = parseInt(pos[0]) + 1;
      span.style.gridRow = parseInt(pos[1]) + 1;
    }

    // actualizo el puntaje
    scoreContainer.innerText = `Puntaje: ${score}`;
  };

  // imprimo en consola y visible
  const printBoard = () => {
    // console.log(`${getStringBoard()}\nPuntaje: ${score}`);
    drawBoard();
  };

  // Agrego span de serpiente en el board
  const addSnakeSpan = (position) => {
    const span = document.createElement("SPAN");
    span.style.gridColumn = position[0];
    span.style.gridRow = position[1];
    snakeBodySpans.push(span);
    board.insertAdjacentElement("beforeend", span);
  };

  // reseteo todo para volver a empezar
  const reset = () => {
    board.innerHTML = "";
    score = 0;
    gameState = "idle";
    currentHead = randomPosition(boardSize);
    snakeBody = [currentHead.join()];
    snakeBodySpans = [];
    addSnakeSpan(currentHead);
    newRubyPosition();
    board.insertAdjacentElement("beforeend", rubyImg);
    printBoard();
  };

  // reseto todo al abrir el sitio para el estado inicial
  reset();

  // cosas estáticas
  const restartButton = document.createElement("BUTTON");
  restartButton.classList.add("button");
  restartButton.classList.add("alt");
  restartButton.addEventListener("click", reset);
  restartButton.innerText = "Reiniciar";

  const wonMessage = document.createElement("P");
  wonMessage.innerText = "Ganaste! 🎉";
  wonMessage.insertAdjacentElement("beforeend", restartButton);

  const lostMessage = document.createElement("P");
  lostMessage.innerText = "Perdiste! 💩";
  lostMessage.insertAdjacentElement("beforeend", restartButton);

  // event listener de las flechas del teclado
  document.addEventListener("keyup", (e) => {
    if (!gameContainer.open) return;

    if (arrowKeyCodes.includes(e.code)) {
      if (gameState !== "playing") gameState = "playing";
      newDirection = e.code.replace("Arrow", "");
    }

    // muestro el juego si el usuario tipea `ruby`
    if (e.code.startsWith("Key")) {
      if (letterKeyCodes.includes(e.code)) {
        typingBuffer.push(e.key);
        if (typingBuffer.length > 4) typingBuffer.shift();

        if (typingBuffer.join("") === "ruby") {
          openGameModal();
        }
      } else {
        typingBuffer = [];
      }
    }
  });

  document
    .querySelector(".copyright .snake")
    .addEventListener("click", () => openGameModal());

  // event listener de los botones de flechas para usar en mobile
  gameContainer.querySelector(".controls").addEventListener("click", (e) => {
    if (e.target.dataset.newDirection) {
      if (gameState !== "playing") gameState = "playing";
      newDirection = e.target.dataset.newDirection;
    }
  });

  // game loop
  setInterval(() => {
    // todavía no empezó
    if (gameState !== "playing") return;

    // evito mover en sentido opuesto al actual
    if (
      (direction === "Left" && newDirection !== "Right") ||
      (direction === "Right" && newDirection !== "Left") ||
      (direction === "Up" && newDirection !== "Down") ||
      (direction === "Down" && newDirection !== "Up")
    )
      direction = newDirection;

    if (!direction) direction = newDirection;

    // calculo posición de nueva cabeza
    let nextHead = null;

    switch (direction) {
      case "Up":
        nextHead = [currentHead[0], currentHead[1] - 1];
        break;
      case "Down":
        nextHead = [currentHead[0], currentHead[1] + 1];
        break;
      case "Left":
        nextHead = [currentHead[0] - 1, currentHead[1]];
        break;
      case "Right":
        nextHead = [currentHead[0] + 1, currentHead[1]];
        break;
    }

    const nextHeadStr = nextHead.join(",");

    // checkeo si perdió
    // checkeo boundaries y si la nueva cabeza está incluida en el cuerpo
    if (
      nextHead[0] < 0 ||
      nextHead[0] >= boardSize ||
      nextHead[1] < 0 ||
      nextHead[1] >= boardSize ||
      snakeBody.includes(nextHeadStr)
    ) {
      console.log("loser!");
      direction = null;
      gameState = "lost";
    }

    // agrego la nueva posición de la cabeza
    snakeBody.unshift(nextHeadStr);
    currentHead = nextHead;

    // veo si se comió el ruby en esta iteración
    const ateRuby = rubyPosition === nextHeadStr;

    if (ateRuby) {
      // si se comió un ruby, agrego un span nuevo
      addSnakeSpan(nextHeadStr);
    } else {
      // si no se comió un ruby, elimino el final, así se "mueve"
      snakeBody.pop();
    }

    // checkeo si ganó
    // si el largo de la serpiente es el total del board, ganó!
    if (snakeBody.length === boardSize * boardSize) {
      console.log("ganaste! sos lo más");
      direction = null;
      gameState = "won";
    } else {
      // si se comió el ruby y queda lugar, calculo nueva posición
      if (ateRuby) {
        score += 1;
        newRubyPosition();
      }
    }

    printBoard();
  }, 500);

  // animación de la serpiente que pasa por la página de vez en cuando
  const snakeGif = document.querySelector(".snakeGif");
  snakeGif.addEventListener("click", () => openGameModal());

  let snakeGifDirection = null;
  const animateSnake = () => {
    snakeGifDirection = snakeGifDirection === "right" ? "left" : "right";
    // altura inicial y final random
    const initialY = Math.floor(Math.random() * window.innerHeight);
    const finalY = Math.floor(Math.random() * window.innerHeight);

    // se mueve de derecha a izquierda o de izquierda a derecha
    const [initialX, finalX] =
      snakeGifDirection === "right"
        ? [-30, window.innerWidth + 30]
        : [window.innerWidth + 30, -30];

    const scale = snakeGifDirection === "right" ? "-1, 1" : "1, 1";

    snakeGif.animate(
      [
        {
          transform: `translateY(${initialY}px) translateX(${initialX}px) scale(${scale})`,
        },
        {
          transform: `translateY(${finalY}px) translateX(${finalX}px) scale(${scale})`,
        },
      ],
      {
        fill: "forwards",
        duration: 20000,
      }
    );
  };

  // más o menos una vez por minuto pasa la serpiente de un lado al otro
  const snakeGifLoop = () => {
    setTimeout(() => {
      animateSnake();
      snakeGifLoop();
    }, Math.floor(Math.random() * 25000) + 45000);
  };
  snakeGifLoop();
};
