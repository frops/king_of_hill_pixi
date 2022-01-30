import { Pixi } from "./pixi.js";

import { Game } from "./game.js";
import { Server } from "./server.js";

let BackendURL = "https://back.kh.loc";
let centrifugoHost = "wss://centrifugo.kh.loc";
const IS_DEV = true;

if (!IS_DEV) {
    centrifugoHost = "ws://kh.sopost.ru";
    BackendURL = "http://kh.sopost.ru/back";
}

Pixi.init(IS_DEV);

// Load server info
Server.init(BackendURL, centrifugoHost, Game.clickHandler);
Server.load();

// Init Game
Game.init(Server, Pixi);
Game.loadUser();

// Show loading text
Pixi.showLoading();

// Loader
Pixi.load(Game.playGuest, Game.handlerClick, Game.gameLoop);