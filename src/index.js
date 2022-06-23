import { Pixi } from "./pixi.js";
import { Game } from "./game.js";
import { Server } from "./server.js";

// let BackendURL = "https://back.kh.loc";
let serverContext = {
    redirectURL: "https://tolocalhost.com",
    mainURL: "https://kh.loc",
    domain: "kh.loc",
    backendURL: "http://127.0.0.1:8084",
    //backendURL: "https://back.kh.loc", 
    centrifugoHost: "wss://centrifugo.kh.loc"
}

const IS_DEV = true;

if (window.location.hostname == "bakla.games") {
    serverContext = {
        redirectURL: "https://bakla.games",
        mainURL: "https://bakla.games",
        domain: "bakla.games",
        backendURL: "https://back.bakla.games",
        centrifugoHost: "wss://centrifugo.sopost.ru"
    }
}

Pixi.init(IS_DEV);

// Load server info
Server.init(serverContext, Game.setKingFromWs).load(function(server) {
    // Init Game
    Game.init(server, Pixi);
    Game.loadUser();

    // Show loading text
    Pixi.showLoading();

    // Loader
    Pixi.load(Game.user, Game.createGuest, Game.playHandler, Game.logoutHanlder, Game.handlerClick, Game.gameLoop, Server.getGoogleLink);
});