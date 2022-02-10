import * as helpers from "./helpers.js";
import { Pixi } from "./pixi.js";
import { User } from "./user.js";

export let Game = {
    server: null,
    user: null,
    pixi: null,
    state: null,
    timerClick: 0,
    buttonClick: true,
    everySecTimer: null,
    king: {
        user: null,
        boardedAt: null,
        duration: null,
    },
    init: function (Server, Pixi) {
        Game.server = Server;
        Game.pixi = Pixi;

        Game.everySecTimer = setInterval(function () {
            if (Game.server.time !== null) {
                Game.server.time += 1000;
            }

            if (Game.king.duration !== null) {
                Game.king.duration++;
                Game.pixi.updateKingDuration(Game.king.duration);
            }
        }, 1000);

        if (!Game.server.isLoaded) {
            console.warn('server not loaded yet');
            return
        }
    },
    loadUser: function () {
        // getting JWT from cookie
        Game.user = User.loadByJwt(helpers.getCookieData('jwt'));

        if (Game.user && Game.user.isLoaded) {
            Game.pixi.showIntroName(Game.user.name);
            return;
        }

        // if local user not found, then we try to create guest
        Game.server.createGuest(function (token) { // Create new guest user
            Game.user = User.loadByJwt(token);
            Game.pixi.showIntroName(Game.user.name);
            return;
        }, function (err) {
            console.err("failed to create guest" + err);
            return;
        });
    },
    playGuest: function (e) {
        if (!Game.user.isLoaded) {
            console.error('failed to load user');
            return;
        }

        Game.pixi.loadGameScene(Game.user);
        Game.server.info(function(resp) {
            Game.setKingFromResp(resp);

            console.log(resp, 'game info');
            console.log(Game.server.time, 'server time');
        });
        Game.state = Game.playState;
    },
    setKingFromResp: function(resp) {
        Game.king.boardedAt = new Date(resp.boarded_at).getTime();
        Game.king.user = resp.user;
        Game.changeKing();
    },
    handlerClick: function () {
        if (!Game.user.isLoaded) {
            console.warn('user not loaded', 'handlerClick');
            return;
        }

        if (Game.buttonClick == true) {
            Game.buttonClick = false;
            Game.timerClick = 10;

            Game.pixi.targetBtn.texture = Game.pixi.targetBtnPressed.texture;
            //resetRayLines(e);
            // resetPointFlow(e, damage)

            Game.server.click(Game.user, function(resp) {
                console.log(resp);
            })
        }
    },
    clickHandler: function (data) {
        Game.changeKing(data);
    },
    gameLoop: function (delta) {
        Game.playState(delta);
    },
    playState: function (delta) {
        if (Game.timerClick == 0) {
            Game.buttonClick = true;
            Game.pixi.targetBtn.texture = Game.pixi.originalBtnTexture.texture;
        } else if (Game.timerClick > 0) {
            Game.timerClick--;
        }

        // Game.pixi.runRays();
        // runPointFlow();
    },
    setKingFromWs: function (msg) {
        Game.king.boardedAt = new Date(msg.boarded_at).getTime();
        Game.king.user.name = msg.name;
        Game.king.user.uuid = msg.uuid;
        Game.changeKing();
    },
    changeKing: function() {
        Game.king.duration = parseInt((Game.server.time - Game.king.boardedAt) / 1000);
        let isYourself = Game.king.user.uuid === Game.user.uuid;
        Game.pixi.changeKing(Game.king, isYourself);
    }
};