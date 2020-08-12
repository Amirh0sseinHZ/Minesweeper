import { Minesweeper } from "./Minesweeper.js";

import "../css/minesweeper.scss";

document.addEventListener("DOMContentLoaded", function () {
  const games = document.getElementsByClassName("minesweeper");
  [...games].forEach(function (game) {
    new Minesweeper({
      el: game,
      width: game.getAttribute("data-width") || 10,
      height: game.getAttribute("data-height") || 10,
      difficulty: game.getAttribute("data-difficulty") || "easy",
      debug: game.getAttribute("data-debug") == "true" ? true : false || false,
    });
  });
});
