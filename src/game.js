import * as helpers from "./helpers.js";
import { Pixi } from "./pixi.js";
import { User } from "./user.js";

export let Game = {
    server: null,
    user: null,
    chars: [],
    pixi: null,
    state: null,
    timerClick: 0,
    buttonClick: true,
    everySecTimer: null,
    chooseChars: [],
    chosenCharUuid: null,
    noKing: "",
    king: {
        user: {duration: 0, name: "-", uuid:""},
        boardedAt: null,
        duration: null,
    },
    init: function (Server, Pixi) {
        if (!Server.isLoaded) {
            console.error('server not loaded yet');
            return
        }

        Game.server = Server;
        Game.noKing = Server.noKing;
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

        document.addEventListener('start_contest', function(e) {
            Game.startContest();
        });

        document.addEventListener('start_king_time', function(e) {
            Game.startKingTime(e.detail.data);
        });
    },
    loadUser: function () {
        Game.server.googleCallback.init();
        
        if (Game.server.googleCallback.isNeedRequest()) {
            Game.server.authGoogleUser(Game.server.googleCallback.code, Game.server.googleCallback.scope, function(token) {
                var date = new Date();
                let expires = date.setDate(date.getDate() + 7 * 86400 * 1000);
                document.cookie = `jwt=${token}; domain=.${Game.server.domain}; path=/; expires=${expires.toString()}`;
                window.location.href = Game.server.mainURL + "?state=play";
            });
        }

        // getting JWT from cookie
        Game.user = User.LoadByJwt(helpers.getCookieData('jwt'));

        if (Game.user && Game.user.isLoaded) {
            Game.pixi.showIntroName(Game.user.name);
            return;
        }
    },
    createGuest: function() {
        Game.server.createGuest(function(token) {
            var date = new Date();
            let expires = date.setDate(date.getDate() + 7 * 86400 * 1000);
            document.cookie = `jwt=${token}; domain=.kh.loc; path=/; expires=${expires.toString()}`;
            window.location.href = Game.server.mainURL + "?state=play";
        });
    },
    playHandler: function (e) {
        if (!Game.user.isLoaded) {
            console.error('failed to load user');
            return;
        }

        Game.server.info(Game.user, function(resp) {
            Game.user.SetChars(resp.user_info.chars);

            if (Game.user.chars.length == 0) {
                Game.server.getChooseChars(Game.user, function(chars) {
                    Game.chooseChars = chars;
                    Game.pixi.showChooseCharScene(chars, Game.chooseChar, Game.chooseLeftChar, Game.chooseRightChar, Game.chooseCharSubmit);
                });
            } else {
                Game.pixi.showGameScene(Game.user);
                Game.setKingFromResp(resp.king);
                // Game.pixi.changeLeaderBoard(resp.leaderboard);
                // Game.pixi.updateUserDuration(resp.user_info.duration);
            }
        });
        Game.state = Game.playState;
    },
    chooseCharSubmit: function() {
        Game.server.chooseChar(Game.user, Game.chosenCharUuid, function(resp) {
            Game.user.SetChars([resp.data.data]);
            Game.pixi.showGameScene(Game.user);
        });
    },
    chooseChar: function(uuid) {
        Game.pixi.redrawChooseCharsByUuid(uuid);
        Game.chosenCharUuid = uuid;
    },
    chooseLeftChar: function() {
        Game.chosenCharUuid = Game.pixi.redrawChooseChars('left');
    },
    chooseRightChar: function() {
        Game.chosenCharUuid = Game.pixi.redrawChooseChars('right');
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

            Game.pixi.toggleBtnState(true);
            // resetPointFlow(e, damage)

            Game.server.click(Game.user, function(resp) {
                console.log(resp, 'resp5')
                Game.pixi.updateUserDuration(resp.data.data.duration);
            })
        }
    },
    clickHandler: function (data) {
        Game.changeKing(data);
    },
    logoutHanlder: function() {
        document.cookie = `jwt=;domain=.${Game.server.domain};path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT`;
        window.location.href = Game.server.mainURL;
    },
    delete_cookie: function(name, path, domain ) {
        if( Game.get_cookie( name ) ) {
          document.cookie = name + "=" +
            ((path) ? ";path="+path:"")+
            ((domain)?";domain="+domain:"") +
            ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
        }
      },
      
    get_cookie: function(name){
          return document.cookie.split(';').some(c => {
              return c.trim().startsWith(name + '=');
          });
      },
    gameLoop: function (delta) {
        Game.playState(delta);
    },
    playState: function (delta) {
        if (Game.timerClick == 0) {
            Game.buttonClick = true;
            Game.pixi.toggleBtnState(false);
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
        // Game.pixi.changeLeaderBoard(msg.leaderboard);
    },
    changeKing: function() {
        if (!Game.king.user) {
            return;
        }

        // Game.king.duration = 20;//parseInt((Game.server.time - Game.king.boardedAt) / 1000);
        // let isYourself = Game.king.user.uuid === Game.user.uuid;
        // Game.pixi.changeKing(Game.king, isYourself);
    },

    startKingTime: function(data) {
        if (!data.user) {
            Game.pixi.noKing.visible = true;
            return;
        }

        console.log(data, 'KING TIME');
        Pixi.kingNameText.text = data.user.name;

        if (data.user.uuid == Game.noKing) {
            console.log("no king");
            return;
        }

        Pixi.changeKing({
            user: data.user,
            char: data.char,
        }, data.user.uuid == Game.user.uuid);
    },

    startContest: function() {
        Pixi.contestMode();
    }
};