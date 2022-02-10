import { Pixi } from "./pixi.js";

import { Game } from "./game.js";
import { Server } from "./server.js";

let BackendURL = "https://back.kh.loc";
let centrifugoHost = "wss://centrifugo.kh.loc";
const IS_DEV = true;

console.log(window.location.hostname, "host");

if (window.location.hostname == "bakla.games") {
    centrifugoHost = "wss://centrifugo.sopost.ru";
    BackendURL = "https://back.bakla.games";
}

Pixi.init(IS_DEV);

// Load server info
Server.init(BackendURL, centrifugoHost, Game.setKingFromWs);
Server.load();

// Init Game
Game.init(Server, Pixi);
Game.loadUser();

// Show loading text
Pixi.showLoading();

// Loader
Pixi.load(Game.playGuest, Game.handlerClick, Game.gameLoop);