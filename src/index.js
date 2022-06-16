import { Pixi } from "./pixi.js";
import { Game } from "./game.js";
import { Server } from "./server.js";

// let BackendURL = "https://back.kh.loc";
let MainURL = 'https://kh.loc';
let Domain = 'kh.loc';
let BackendURL = "http://127.0.0.1:8084";
let centrifugoHost = "wss://centrifugo.kh.loc";
const IS_DEV = true;

console.log(window.location.hostname, "host");

if (window.location.hostname == "bakla.games") {
    centrifugoHost = "wss://centrifugo.sopost.ru";
    BackendURL = "https://back.bakla.games";
    MainURL = 'https://backla.games';
    Domain = 'bakla.games';
}

Pixi.init(IS_DEV);

// Load server info
Server.init(MainURL, Domain, BackendURL, centrifugoHost, Game.setKingFromWs).load(function(server) {
    // Init Game
    Game.init(server, Pixi);
    Game.loadUser();

    // Show loading text
    Pixi.showLoading();

    // Loader
    Pixi.load(Game.user, Game.createGuest, Game.playHandler, Game.logoutHanlder, Game.handlerClick, Game.gameLoop, Server.getGoogleLink);
});