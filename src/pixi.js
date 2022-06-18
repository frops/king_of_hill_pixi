import {autoDetectRenderer, Application, Container, Sprite, TilingSprite, Text, TextStyle, Graphics } from "pixi.js";
import * as helpers from "./helpers.js";
import { PointItems } from "./point_items.js";

const RESOURCE_PATH = "spritesheet.json";
const WIDTH = 720;
const HEIGHT = 1280;

export let Pixi = {
    app: null,
    textures: null,
    width: 0,
    height: 0,
    state: null,
    isDev: true,

    //Scenes
    introScene: null,
    loadingScene: null,
    gameScene: null,
    chooseCharScene: null,

    //Text
    introNameText: null,
    kingNameText: null,
    kingDuration: null,
    kingHillTitle: null,

    leaderboard: [],

    //Chars
    chooseChars: [],
    chosenChar: null,
    chosenCharText: "",

    //Point Items
    pointItems: {},

    //Textures
    originalBtnTexture: null,
    targetBtn: null,
    targetBtnPressed: null,
    score: null,
    duration: null,
    kingSprite: null,
    contestLogo: null,
    noKing: null,
    lines: [],

    // Functions
    init: function (isDev) {
        Pixi.width = WIDTH;
        Pixi.height = HEIGHT;
        Pixi.isDev = isDev;

        if (!helpers.mobileCheck()) { // if is mobile device
            Pixi.width = WIDTH;
            Pixi.height = HEIGHT;
        }

        // Pixi Application
        Pixi.app = new Application({
            width: Pixi.width,
            height: Pixi.height,
            antialias: true,
            resolution: window.devicePixelRatio // For good rendering on mobiles
        });
    
        document.querySelector('.container').appendChild(Pixi.app.view);
    },
    load: function (user, createGuestHandler, playHandler, logoutHanlder, handlerClick, gameLoop, loginGoogle) {
        Pixi.app.loader
            //.add(RESOURCE_PATH)
            .add('back_intro', 'img/back_intro.jpg')
            .add('back_game', 'img/back_game2.jpg')
            .add('btn_auth_google', 'img/btn_auth_google.png')
            .add('btn_auth_guest', 'img/btn_auth_guest.png')
            .add('start', 'img/start.png')
            .add('logout', 'img/logout.png')
            .add('click_btn', 'img/click_btn.png')
            .add('contest_logo', 'img/contest_logo.png')
            .add('no_king', 'img/no_king.png')
            .add('main_btn', 'img/main_btn.png');

        for (let i = 0; i < PointItems.length; i++) {
            Pixi.app.loader.add(PointItems[i].name, PointItems[i].path);
        }

        Pixi.app.loader.load(() => {
            if (user) {
                Pixi.showIntroAuthedScene(user, playHandler, logoutHanlder);
            } else {
                Pixi.showIntroScene(createGuestHandler, loginGoogle);
            }

            Pixi.gameScene = new Container();
            Pixi.gameScene.visible = false;
            Pixi.app.stage.addChild(Pixi.gameScene);

            // Background
            let bg = Pixi.getTextureSprite('back_game');
            bg.anchor.set(0, 0);
            Pixi.gameScene.addChild(bg);

            Pixi.contestLogo = Pixi.getTextureSprite('contest_logo');
            Pixi.contestLogo.x = 110;
            Pixi.contestLogo.y = 397;
            Pixi.contestLogo.visible = false;
            Pixi.gameScene.addChild(Pixi.contestLogo);

            Pixi.noKing = Pixi.getTextureSprite('no_king');
            Pixi.noKing.x = 110;
            Pixi.noKing.y = 363;
            Pixi.noKing.visible = false;
            Pixi.gameScene.addChild(Pixi.noKing);

            // Scorebar
            let scoreBar = new Container();
            Pixi.gameScene.addChild(scoreBar);

            Pixi.username = new Text("", new TextStyle({
                fontFamily: "Verdana",
                fontSize: 20,
                fill: "#FFDC5F"
            }));
            Pixi.username.anchor.set(0, 0);
            Pixi.username.x = 176;
            Pixi.username.y = 39;
            scoreBar.addChild(Pixi.username);

            Pixi.userScore = new Text("", new TextStyle({
                fontFamily: "Verdana",
                fontSize: 25,
                fill: "#68D413"
            }));
            Pixi.userScore.x = WIDTH - Pixi.userScore.width - 100;
            Pixi.userScore.y = 45;
            scoreBar.addChild(Pixi.userScore);

            // Current user
            Pixi.kingNameText = new Text("", new TextStyle({
                fontFamily: "Verdana",
                fontSize: 38,
                fill: "#1A5D7A"
            }));
            Pixi.kingNameText.x = Pixi.getCenterX(Pixi.kingNameText);
            Pixi.kingNameText.y = 840;
            Pixi.gameScene.addChild(Pixi.kingNameText);

            Pixi.kingHillTitle = Pixi.getTextObject("Царь горы", "24pt", "#0E4C67", "center", 300);
            Pixi.kingHillTitle.visible = false;
            Pixi.gameScene.addChild(Pixi.kingHillTitle);

            Pixi.kingDuration = new Text("", new TextStyle({
                fontFamily: "Verdana",
                fontSize: 24,
                fill: "#fff"
            }));
            Pixi.kingDuration.anchor.set(0.5);
            Pixi.kingDuration.x = WIDTH / 2;
            Pixi.kingDuration.y = 890;
            Pixi.gameScene.addChild(Pixi.kingDuration);

            // Load another
            // loadMan();
            // loadRays();
            Pixi.loadTargetBtn(handlerClick);
            // loadPointFlow();

            Pixi.app.ticker.add(delta => gameLoop(delta));
            Pixi.loadingScene.visible = false;
        });
    },
    showLoading: function () {
        Pixi.loadingScene = new Container();
        Pixi.app.stage.addChild(Pixi.loadingScene);

        let loadingText = new Text("Загрузка...\n", new TextStyle({
            fontFamily: "Verdana",
            fontSize: '12pt',
            fill: "#fff"
        }));
        Pixi.loadingScene.addChild(loadingText);
        loadingText.anchor.set(0.5);
        loadingText.position.set(Pixi.width / 2, Pixi.width / 3);
    },
    drawChooseButton: function(pressChooseBtnHandler) {
        let chooseBtn = Pixi.getTextureSprite("btn_submit");
        chooseBtn.interactive = true;
        chooseBtn.buttonMode = true;
        chooseBtn.on("pointerdown", pressChooseBtnHandler);
        chooseBtn.x = 282;
        chooseBtn.y = 942;
        Pixi.chooseCharScene.addChild(chooseBtn);
    },
    showChooseCharScene: function (chars, pressCharHandler, pressLeftHandler, pressRightHandler, pressChooseBtnHandler) {
        Pixi.chooseCharScene = new Container();
        Pixi.app.stage.addChild(Pixi.chooseCharScene);

        // Textures which should be loaded
        let textures = [];

        // Background
        let bg = Pixi.getTextureSprite('back_game');
        bg.anchor.set(0, 0);
        Pixi.chooseCharScene.addChild(bg);

        // Text choose char
        Pixi.chooseCharScene.addChild(
            Pixi.getTextObject("Выберите персонажа", '18pt', "#fff", "center", 50)
        );

        // Texture Button
        textures.push({name: 'btn_submit', path: 'img/btn_submit.png'});
        textures.push({name: 'btn_left', path: 'img/btn_left.png'});
        textures.push({name: 'btn_right', path: 'img/btn_right.png'});

        // Textures for 3 chars
        for (let i = 0; i < 3; i++) {
            textures.push({name: chars[i].uuid, path: 'chars/' + chars[i].uuid + '.png'})
        }

        Pixi.loadTextures(textures, function() {
            // Choose Button
            Pixi.drawChooseButton(pressChooseBtnHandler);

            let leftBtn = Pixi.getInteractiveSprite("btn_left", 129, 975, pressLeftHandler);
            let rightBtn = Pixi.getInteractiveSprite("btn_right", 539, 975, pressRightHandler);
            Pixi.chooseCharScene.addChild(leftBtn);
            Pixi.chooseCharScene.addChild(rightBtn);

            for (let i = 0; i < 3; i++) {
                let chooseCharSprite = new Sprite(Pixi.app.loader.resources[chars[i].uuid].texture);

                Pixi.chooseChars[i] = {
                    uuid: chars[i].uuid,
                    sprite: chooseCharSprite,
                    name: chars[i].name,
                }

                Pixi.chooseChars[i].sprite.interactive = true;
                Pixi.chooseChars[i].sprite.buttonMode = true;
                Pixi.chooseChars[i].sprite.on("pointerdown", function() {
                    pressCharHandler(chars[i].uuid)
                });
                Pixi.chooseChars[i].sprite.anchor.set(0, 0);            
                Pixi.chooseCharScene.addChild(Pixi.chooseChars[i].sprite);
            }

            Pixi.chosenChar = Pixi.chooseChars[1];

            Pixi.chosenCharText = Pixi.getTextObject(Pixi.chosenChar.name, "24pt", "#fff", "center", 800);
            Pixi.chooseCharScene.addChild(Pixi.chosenCharText);

            Pixi.redrawChooseChars(1);
            pressCharHandler(Pixi.chooseChars[1].uuid);
            Pixi.introScene.visible = false;
            Pixi.chooseCharScene.visible = true;
        });
    },
    redrawChooseCharsByUuid: function(uuid) {
        let move = 'no';

        for (let i = 0; i < 3; i++) {
            if (i != 1 && Pixi.chooseChars[i].uuid == uuid) {
                if (i == 0) {
                    move = 'right';
                } else {
                    move = 'left';
                }
            }
        }

        Pixi.redrawChooseChars('no');
    },
    redrawChooseChars: function(move) {
        let toggleLeftRight = false;
        
        if (move == 'left') {
            let reserveChar = Pixi.chooseChars[2];
            Pixi.chooseChars[2] = Pixi.chooseChars[1];
            Pixi.chooseChars[1] = Pixi.chooseChars[0];
            Pixi.chooseChars[0] = reserveChar;
        } else if (move == 'right') {
            let reserveChar = Pixi.chooseChars[0];
            Pixi.chooseChars[0] = Pixi.chooseChars[1];
            Pixi.chooseChars[1] = Pixi.chooseChars[2];
            Pixi.chooseChars[2] = reserveChar;
        }

        let name = Pixi.chooseChars[1].name;
        
        for (let i = 0; i < 3; i++) {
            if (i == 1) {
                Pixi.chooseChars[i].sprite.x = 240;
                Pixi.chooseChars[i].sprite.y = 304;
                Pixi.chooseChars[i].sprite.width = 240;
                Pixi.chooseChars[i].sprite.height = 457;
            } else {
                Pixi.chooseChars[i].sprite.x = 89;
                Pixi.chooseChars[i].sprite.y = 390;
                Pixi.chooseChars[i].sprite.width = 150;
                Pixi.chooseChars[i].sprite.height = 286;

                if (!toggleLeftRight) {
                    Pixi.chooseChars[i].sprite.x = 479;
                    toggleLeftRight = true;
                }
            }
        }

        Pixi.chosenCharText.text = name;
        Pixi.chosenCharText.x = (Pixi.width / 2) - (Pixi.chosenCharText.width / 2);

        return Pixi.chooseChars[1].uuid;
    },
    showIntroScene: function (createGuestHandler, loginGoogleHandler) {
        Pixi.introScene = new Container();
        Pixi.app.stage.addChild(Pixi.introScene);

        // Background
        let bg = Pixi.getTextureSprite('back_intro');
        bg.anchor.set(0, 0);
        Pixi.introScene.addChild(bg);

        // Auth Google Button
        let authBtn = Pixi.getTextureSprite('btn_auth_google');
        authBtn.position.set(110, 930);
        authBtn.interactive = true;
        authBtn.buttonMode = true;
        authBtn.on("pointerdown", loginGoogleHandler);
        Pixi.introScene.addChild(authBtn);

        // Auth Guest Button
        let playGuestBtn = Pixi.getTextureSprite('btn_auth_guest');
        playGuestBtn.anchor.set(0, 0);
        playGuestBtn.position.set(110, 750);
        playGuestBtn.interactive = true;
        playGuestBtn.buttonMode = true;
        playGuestBtn.on("pointerdown", createGuestHandler);
        Pixi.introScene.addChild(playGuestBtn);
    },
    showIntroAuthedScene: function(user, playGameHandler, logoutHanlder) {
        Pixi.introScene = new Container();
        Pixi.app.stage.addChild(Pixi.introScene);

        // Background
        let bg = Pixi.getTextureSprite('back_intro');
        bg.anchor.set(0, 0);
        Pixi.introScene.addChild(bg);

        // Current user
        let userNameText = new Text(user.name, new TextStyle({
            fontFamily: "Verdana",
            fontSize: 30,
            fill: "#fff"
        }));
        userNameText.anchor.set(0.5);
        userNameText.position.set((Pixi.width / 2), 589);
        Pixi.introScene.addChild(userNameText);

        // Start Button
        let startBtn = Pixi.getTextureSprite('start');
        startBtn.position.set(110, 930);
        startBtn.interactive = true;
        startBtn.buttonMode = true;
        startBtn.on("pointerdown", playGameHandler);
        Pixi.introScene.addChild(startBtn);
        
        // Start Button
        let logoutBtn = Pixi.getTextureSprite('logout');
        logoutBtn.position.set(230, 1178);
        logoutBtn.interactive = true;
        logoutBtn.buttonMode = true;
        logoutBtn.on("pointerdown", logoutHanlder);
        Pixi.introScene.addChild(logoutBtn);   
    },
    showGameScene: function (User) {
        let currentChar = User.GetChosenChar();
        console.log(User, 'current user ');
        let chosenCharTextureName = 'char_' + currentChar.char.uuid;
        let chosenCharTexturePath = 'chars/' + currentChar.char.uuid + '.png';
        let textures = [{name: chosenCharTextureName, path: chosenCharTexturePath}];

        Pixi.loadTextures(textures, function() {
            let chosenCharSprite = Pixi.getTextureSprite(chosenCharTextureName);
            chosenCharSprite.position.set(97, 17);
            chosenCharSprite.width = 47;
            chosenCharSprite.height = 101;
            Pixi.gameScene.addChild(chosenCharSprite);

            Pixi.introScene.visible = false;
            Pixi.gameScene.visible = true;

            if (Pixi.chooseCharScene) {
                Pixi.chooseCharScene.visible = false;
            }

            let names = User.name.split(" ");
            Pixi.username.text = names[0] + "\n" + names[1];
        });
    },
    showIntroName: function (name) {
        let timerId = setInterval(function () {
            if (Pixi.introNameText) {
                Pixi.introNameText.text = name;
                clearInterval(timerId);
            }
        }, 500);
    },
    loadTargetBtn: function (handlerClick) {
        //Pixi.targetBtn = new TilingSprite(texture, 230, 235);
        Pixi.targetBtn = Pixi.getTextureSprite('click_btn');
        Pixi.targetBtn.position.set(0, 0);

        Pixi.targetBtn.position.set(245, 951);
        Pixi.targetBtn.interactive = true;
        Pixi.targetBtn.buttonMode = true;
        Pixi.targetBtn.on("pointerdown", handlerClick);
        Pixi.gameScene.addChild(Pixi.targetBtn);
    },
    toggleBtnState: function(press) {
        // if (press) {
        //     Pixi.targetBtn.tilePosition.y = 235;
        // } else {
        //     Pixi.targetBtn.tilePosition.y = 0;
        // }
    },
    contestMode: function() {
        Pixi.noKing.visible = false;
        Pixi.kingHillTitle.visible = false;
        Pixi.contestLogo.visible = true;

        if (Pixi.kingSprite) {
            Pixi.gameScene.removeChild(Pixi.kingSprite);
            Pixi.kingNameText.text = "";
            Pixi.kingDuration.text = "";
        }
    },
    changeKing: function(king, isYourself) {
        let text = king.user.name;
        let charResourceName = 'char_' + king.char.uuid;
        Pixi.kingHillTitle.visible = true;
        Pixi.contestLogo.visible = false;

        Pixi.loadTexture('char_' + king.char.uuid, 'chars/' + king.char.uuid + '.png', function() {
            Pixi.kingSprite = Pixi.getTextureSprite(charResourceName);
            Pixi.kingSprite.x = 234;
            Pixi.kingSprite.y = 331;
            Pixi.gameScene.addChild(Pixi.kingSprite);
        
            Pixi.kingNameText.text = text;
            Pixi.kingNameText.x = Pixi.getCenterX(Pixi.kingNameText);
            Pixi.kingNameText.y = 828;
    
            Pixi.updateKingDuration(20);
        });
    },
    updateKingDuration: function(duration) {
        if (duration < 0) {
            Pixi.kingDuration.text = "-";
        } else {
            Pixi.kingDuration.text = duration;
        }

        Pixi.kingDuration.x = WIDTH / 2;
    },
    getFormatedDuration: function(duration) {
        if (duration < 1000) {
            return duration;
        }

        return (Math.floor((duration / 1000) * 10) / 10) + ' K';
    },
    updateUserDuration: function(duration) {
        Pixi.userScore.text = Pixi.getFormatedDuration(duration);
        Pixi.userScore.x = WIDTH - Pixi.userScore.width - 100;
    },
    changeLeaderBoard: function(leaderboard) {
        if (null == leaderboard) {
            console.warn('leaderboard is null');
            return;
        }

        for (let i = 0; i < 3; i++) {
            if (typeof leaderboard[i] === 'undefined') {
                continue;
            }

            Pixi.leaderboard[i].name.text = leaderboard[i].name;
            Pixi.leaderboard[i].score.text = Pixi.getFormatedDuration(leaderboard[i].duration);
            Pixi.leaderboard[i].score.x = WIDTH - Pixi.leaderboard[i].score.width - 80;
        }
    },

    // ANIMATIONS
    newPointItem: function(pointName) {
        const sprite = Pixi.getTextureSprite(pointName);
        sprite.anchor.set(0.5);
        Pixi.gameScene.addChild(sprite);

        return {
            sprite: sprite,
            timer: 0,
            sin: 0,
            cos: 0,
        };
    },
    startPointItems: function(pointName) {
        let freePointIndex = null;

        if (!Pixi.pointItems.hasOwnProperty(pointName)) {
            Pixi.pointItems[pointName] = [Pixi.newPointItem(pointName)];
            freePointIndex = 0;
        } else {
            console.log()
            for (let i = 0; i < Pixi.pointItems[pointName].length; i++) {
                if (Pixi.pointItems[pointName][i].timer < 1) {
                    freePointIndex = i;
                }
            }
        }

        if (freePointIndex === null) {
            Pixi.pointItems[pointName].push(Pixi.newPointItem(pointName));
            freePointIndex = Pixi.pointItems[pointName].length - 1;
        }

        // Set selected free index to start poisition
        Pixi.pointItems[pointName][freePointIndex].sin = helpers.getRandSin(180);
        Pixi.pointItems[pointName][freePointIndex].cos = helpers.getRandCos(180);
        Pixi.pointItems[pointName][freePointIndex].sprite.position.x = 360;
        Pixi.pointItems[pointName][freePointIndex].sprite.position.y = 1066;
        Pixi.pointItems[pointName][freePointIndex].sprite.alpha = 1;
        Pixi.pointItems[pointName][freePointIndex].timer = 40;
    },

    runPointItems: function() {
        if (Pixi.pointItems.length < 1) {
            return;
        }

        const speed = 5;

        for(let pointItemName in Pixi.pointItems) {
            for (let i = 0; i < Pixi.pointItems[pointItemName].length; i++) {
                if (Pixi.pointItems[pointItemName][i].timer < 1) {
                    Pixi.pointItems[pointItemName][i].sprite.alpha = 0;
                    continue;
                }

                Pixi.pointItems[pointItemName][i].sprite.position.x += Pixi.pointItems[pointItemName][i].sin * speed;
                Pixi.pointItems[pointItemName][i].sprite.position.y += Pixi.pointItems[pointItemName][i].cos * speed;
                Pixi.pointItems[pointItemName][i].sprite.alpha -= 0.01;
                Pixi.pointItems[pointItemName][i].sprite.angle += 10;

                Pixi.pointItems[pointItemName][i].timer--;
            }
        }
    },

    // HELPERS FUNCITONS

    getTextureSprite: function(name) {
        return new Sprite(Pixi.app.loader.resources[name].texture);
    },
    getInteractiveSprite: function(name, x, y, handler) {
        let btn = Pixi.getTextureSprite(name);
        btn.interactive = true;
        btn.buttonMode = true;
        btn.on("pointerdown", handler);
        btn.x = x;
        btn.y = y;
            
        return btn;
    },
    loadTexture: function(name, path, callback) {
        let textures = [{name: name, path: path}];
        Pixi.loadTextures(textures, callback);
    },
    loadTextures: function(textures, callback) {
        let cnt = textures.length;
        let isNeedLoad = false;

        for (let i = 0; i < cnt; i++) {
             if(!Pixi.app.loader.resources.hasOwnProperty(textures[i].name)) {
                Pixi.app.loader.add(textures[i].name, textures[i].path);
                isNeedLoad = true;
             }
        }

        if (isNeedLoad) {
            Pixi.app.loader.load(() => callback());
        } else {
            callback();
        }
    },
    getTextObject: function(name, fontSize, fill, x, y) {
        let text = new Text(name, new TextStyle({
            fontFamily: "Verdana",
            fontSize: fontSize,
            fill: fill
        }));

        if (x == 'center') {
            x = Pixi.getCenterX(text);
        }

        text.x = x;
        text.y = y;
        
        return text;
    },
    getCenterX: function(obj) {
        return (Pixi.width / 2) - (obj.width / 2);
    }
};