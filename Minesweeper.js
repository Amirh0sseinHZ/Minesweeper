export class Minesweeper {
  constructor(config) {
    this.el = config.el;
    this.width = config.width >= 3 ? Math.floor(Math.abs(config.width)) : 3;
    this.height = config.height >= 3 ? Math.floor(Math.abs(config.height)) : 3;
    this.difficulty = {
      easy: 0.1,
      normal: 0.15,
      hard: 0.2,
      default: 0.1,
    };
    const coefficient =
      config.difficulty in this.difficulty
        ? this.difficulty[config.difficulty]
        : this.difficulty["default"];
    this.minesCount = this.flagsRemaining = Math.floor(
      this.width * this.height * coefficient
    );
    this.squaresMap = new Array();
    this.flagsRemainingEl;
    this.emojiEl;
    this.stopWatch = {};
    this.debug = !!config.debug;

    this.BoardGenerator();
    this.Initializing();
  }

  Initializing = () => {
    this.flagsRemaining = this.minesCount;
    this.isGameOver = false;
    this.isFirstClick = true;
    this.MineDistributing();
    this.SetFlagsRemaning(this.flagsRemaining);
    this.SetEmoji("happy");
    this.SetStopWatch(0);

    if (this.debug) {
      this.Debug_MakeMinesVisible();
    }
  };

  Start = () => {
    this.isFirstClick = false;
    let counter = 1;
    this.stopWatch.interval = setInterval(() => {
      if (this.isGameOver) {
        return;
      }
      this.SetStopWatch(counter);
      counter++;
    }, 1000);
  };

  ResetGame = () => {
    this.squaresMap.forEach((square) => {
      square.ResetDefault();
    });
    clearInterval(this.stopWatch.interval);
    this.Initializing();
  };

  BoardGenerator = () => {
    /* Disabling Context Menu */
    this.el.addEventListener("contextmenu", (e) => e.preventDefault());

    /* Header */
    const header = document.createElement("header");
    header.className = "minesweeper__header";
    if (this.width < 5) header.style.width = 35 * this.width + "px"; // responsiveness
    this.el.appendChild(header);

    /* Header -> Sections */
    for (let i = 0; i < 3; i++) {
      const div = document.createElement("div");
      div.classList = "header__section";
      header.appendChild(div);
    }

    /* Header -> Sections -> Section 1 – FlagsCounter */
    const flagsRemainingContainer = document.createElement("div");
    flagsRemainingContainer.classList = "counter";
    this.flagsRemainingEl = flagsRemainingContainer;
    header.childNodes[0].appendChild(flagsRemainingContainer);

    /* Header -> Sections -> Section 2 – Emoji */
    const emojiContainer = document.createElement("div");
    const emoji = document.createElement("div");
    emojiContainer.classList = "emoji";
    emojiContainer.appendChild(emoji);
    emoji.addEventListener("click", this.ResetGame);
    this.emojiEl = emoji;
    header.childNodes[1].appendChild(emojiContainer);

    /* Header -> Sections -> Section 3 – Timer */
    const stopWatch = document.createElement("div");
    stopWatch.classList = "counter";
    this.stopWatch.el = stopWatch;
    header.childNodes[2].appendChild(stopWatch);

    /* Body */
    const body = document.createElement("div");
    body.className = "minesweeper__body";
    this.el.appendChild(body);

    /* Grid Template */
    body.style.gridTemplateColumns = `repeat(${this.width}, 1fr)`;
    body.style.gridTemplateRows = `repeat(${this.height}, 1fr)`;

    /* Squares */
    for (let y = this.height - 1; y >= 0; y--)
      for (let x = 0; x < this.width; x++) {
        const newSquare = new Square(x, y);
        this.squaresMap.push(newSquare);
        body.appendChild(newSquare.GetElement());
        /* Event Listeners */
        newSquare
          .GetElement()
          .addEventListener("click", this.LeftClick.bind(this, newSquare));
        newSquare
          .GetElement()
          .addEventListener(
            "contextmenu",
            this.RightClick.bind(this, newSquare)
          );
      }
  };

  SetEmoji = (status) => {
    this.emojiEl.classList = `icon icon--${status}`;
  };

  SetFlagsRemaning = (number) => {
    this._visualizeNumber(this.flagsRemainingEl, number);
  };

  SetStopWatch = (number) => {
    this._visualizeNumber(this.stopWatch.el, number);
  };

  MineDistributing = () => {
    // Shuffling the squares order in the array
    this._shuffle(this.squaresMap);

    // Plant the mines in the beggining
    //  of the shuffled array
    for (let i = 0; i < this.minesCount; i++) this.squaresMap[i].PlantMine();
  };

  GetNeighbors = (square) => {
    return this.squaresMap.filter(
      (e) =>
        JSON.stringify(square.GetNeighborsCords()).indexOf(
          JSON.stringify(e.GetCords())
        ) >= 0
    );
  };

  CountNeighborMines = (square) => {
    const neighbors = this.GetNeighbors(square);

    let num_mines = 0;

    neighbors.forEach((neighbor) => {
      if (neighbor.is_mine) num_mines++;
    });

    return num_mines;
  };

  LeftClick = (square) => {
    if (this.isGameOver || square.is_flag || square.is_seen) return;
    if (this.isFirstClick) {
      if (square.is_mine) {
        // Preventing from first attempt lose
        this.MoveMine(square);
      }
      this.Start();
    } else {
      if (square.is_mine) {
        this.Lose(square);
        return;
      }
    }
    this.Check(square);
    this.CheckForWin();
  };

  Lose = (square) => {
    square.MakeMineBolded();
    this.Debug_MakeMinesVisible();
    this.isGameOver = true;
    this.SetEmoji("sad");
  };

  CheckForWin = () => {
    const safeSquares = this.squaresMap.filter((square) => !square.is_mine)
      .length;
    const seenSquares = this.squaresMap.filter((square) => square.is_seen)
      .length;
    if (safeSquares == seenSquares) {
      this.SetFlagsRemaning(0);
      this.Debug_MakeMinesVisible("flag");
      this.SetEmoji("cool");
      this.isGameOver = true;
    }
  };

  RightClick = (square) => {
    if (this.isGameOver || square.is_seen) return;
    if (this.isFirstClick) this.Start();
    if (!square.is_flag) {
      if (this.flagsRemaining <= 0) return;
      this.SetFlagsRemaning(--this.flagsRemaining);
    } else this.SetFlagsRemaning(++this.flagsRemaining);
    square.ToggleFlag();
  };

  Check = (square) => {
    if (square.is_mine || square.is_flag || square.is_seen) return;
    let countMinesAround = this.CountNeighborMines(square);
    square.Seen();

    if (countMinesAround == 0) {
      const neighbors = this.GetNeighbors(square);
      neighbors.forEach((neighbor) => {
        this.Check(neighbor);
      });
    } else {
      square.PrintNumber(countMinesAround);
    }
  };

  MoveMine = (square) => {
    square.RemoveMine();
    this.squaresMap[this.minesCount].PlantMine();
    if (this.debug) {
      this.Debug_MakeMinesVisible();
    }
  };

  _visualizeNumber = (parentContainer, number) => {
    parentContainer.innerHTML = "";
    number = Math.abs(number);
    if (number > 999) number = 999;
    const digits = ("" + this._pad(number, 3)).split("");
    digits.forEach((digit) => {
      const el = document.createElement("div");
      el.classList = `counter__digit counter__digit--${digit}`;
      parentContainer.appendChild(el);
    });
  };

  _shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  _pad(n, length) {
    let len = length - ("" + n).length;
    return (len > 0 ? new Array(++len).join("0") : "") + n;
  }

  Debug_MakeMinesVisible = (markAs) => {
    this.squaresMap.forEach((square) => {
      square.MakeMineVisible(markAs);
    });
  };
}

class Square {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.is_mine = false;
    this.is_seen = false;
    this.is_flag = false;
    this.el = document.createElement("div");
    this.el.className = "square";
  }

  GetElement = () => {
    return this.el;
  };

  PlantMine = () => {
    this.is_mine = true;
  };

  PlantFlag = () => {
    this.is_flag = true;
  };

  RemoveMine = () => {
    this.is_mine = false;
    this.el.innerHTML = "";
  };

  RemoveFlag = () => {
    this.is_flag = false;
  };

  ToggleFlag = () => {
    this.is_flag = !this.is_flag;
    this.el.classList.toggle("square--flag");
  };

  MakeMineVisible = (markAs = "mine") => {
    if (!this.is_mine) return;
    this.el.classList += ` square--${markAs}`;
  };

  MakeMineBolded = () => {
    if (!this.is_mine) return;
    this.el.classList += " square--clicked-mine";
  };

  Seen = () => {
    this.is_seen = true;
    this.el.classList += " square--seen";
  };

  PrintNumber = (number) => {
    this.el.innerHTML = number;
    this.el.classList += ` square--${number}`;
  };

  ResetDefault = () => {
    this.is_flag = false;
    this.is_mine = false;
    this.is_seen = false;
    this.el.className = "square";
    this.el.innerHTML = "";
  };

  GetNeighborsCords = () => {
    return [
      [this.x, this.y + 1],
      [this.x, this.y - 1],
      [this.x + 1, this.y + 1],
      [this.x + 1, this.y],
      [this.x + 1, this.y - 1],
      [this.x - 1, this.y + 1],
      [this.x - 1, this.y],
      [this.x - 1, this.y - 1],
    ];
  };

  GetCords = () => {
    return [this.x, this.y];
  };
}
