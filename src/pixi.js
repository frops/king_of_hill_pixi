import { Application, Container, Sprite, TilingSprite, Text, TextStyle, Graphics } from "pixi.js";
import * as helpers from "./helpers.js";

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

    //Text
    introNameText: null,
    kingNameText: null,
    kingDuration: null,

    leaderboard: [],

    //Textures
    originalBtnTexture: null,
    targetBtn: null,
    targetBtnPressed: null,
    score: null,
    duration: null,
    lines: [],

    // Functions
    init: function (isDev) {
        Pixi.width = WIDTH;
        Pixi.height = HEIGHT;
        Pixi.isDev = isDev;

        // if (helpers.mobileCheck()) { // if is mobile device
        //     Pixi.width = 720;
        //     Pixi.height = 1280;
        // }

        // Pixi Application
        Pixi.app = new Application({
            width: Pixi.width,
            height: Pixi.height,
            antialias: true,
            resolution: window.devicePixelRatio // For good rendering on mobiles
        });
        document.querySelector('.container').appendChild(Pixi.app.view);
    },
    load: function (playGuest, handlerClick, gameLoop, loginGoogle) {
        Pixi.app.loader
            .add(RESOURCE_PATH)
            .add('main_btn', 'img/main_btn.png')
            .add('back_game', 'img/back_game.jpg');

        Pixi.app.loader.load(() => {
            Pixi.textures = Pixi.app.loader.resources[RESOURCE_PATH].textures;
            Pixi.showIntroScene(playGuest, loginGoogle);

            Pixi.gameScene = new Container();
            Pixi.gameScene.visible = false;
            Pixi.app.stage.addChild(Pixi.gameScene);

            // Background
            let bg = new Sprite(Pixi.app.loader.resources['back_game'].texture);
            bg.width = Pixi.width;
            bg.height = Pixi.height;
            bg.anchor.set(0, 0);
            Pixi.gameScene.addChild(bg);

            // Scorebar
            let scoreBar = new Container();
            Pixi.gameScene.addChild(scoreBar);

            Pixi.username = new Text("", new TextStyle({
                fontFamily: "Verdana",
                fontSize: 25,
                fill: "#FFDC5F"
            }));
            Pixi.username.x = 0;
            Pixi.username.y = 45;
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
                fontSize: 30,
                fill: "#fff"
            }));
            Pixi.kingNameText.anchor.set(0.5);
            Pixi.kingNameText.x = WIDTH / 2;
            Pixi.kingNameText.y = 840;
            Pixi.gameScene.addChild(Pixi.kingNameText);

            Pixi.kingDuration = new Text("0", new TextStyle({
                fontFamily: "Verdana",
                fontSize: 24,
                fill: "#fff"
            }));
            Pixi.kingDuration.anchor.set(0.5);
            Pixi.kingDuration.x = WIDTH / 2;
            Pixi.kingDuration.y = 890;
            Pixi.gameScene.addChild(Pixi.kingDuration);

            let leaderBoardTextStyle = new TextStyle({
                fontFamily: "Verdana",
                fontSize: 24,
                fill: "#fff"
            });

            for (let i = 0; i < 3; i++) {            
                Pixi.leaderboard[i] = {
                    name: new Text("-", leaderBoardTextStyle),
                    score: new Text("0", leaderBoardTextStyle),
                };

                Pixi.leaderboard[i].name.x = 80;
                Pixi.leaderboard[i].score.x = WIDTH - (Pixi.leaderboard[i].score.width - 150);

                Pixi.leaderboard[i].name.y = 563 + (i * 57);
                Pixi.leaderboard[i].score.y = Pixi.leaderboard[i].name.y;


                Pixi.gameScene.addChild(Pixi.leaderboard[i].name);
                Pixi.gameScene.addChild(Pixi.leaderboard[i].score);
            }

            // Load another
            // loadMan();
            // loadRays();
            console.log(Pixi.textures);
            Pixi.loadTargetBtn(Pixi.app.loader.resources['main_btn'].texture, handlerClick);
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
    showIntroScene: function (playGuest, loginGoogle) {
        Pixi.introScene = new Container();
        Pixi.app.stage.addChild(Pixi.introScene);

        // Background
        let bgStart = new Sprite(Pixi.textures["back_start.png"]);
        bgStart.anchor.set(0, 0);
        Pixi.introScene.addChild(bgStart);

        // Auth Google
        let authBtn = new Graphics();
        authBtn.beginFill(0x336699)
            .drawRect(0, 0, 300, 100)
            .endFill()
            .position.set(200, Pixi.height - 150);

        authBtn.interactive = true;
        authBtn.buttonMode = true;
        authBtn.on("pointerdown", loginGoogle);

        Pixi.introScene.addChild(authBtn);
        let authBtnText = new Text("Login via Google", new TextStyle({
            fontFamily: "Verdana",
            fontSize: 19,
            fill: "#fff"
        }));
        authBtnText.anchor.set(0.5);
        authBtnText.x = authBtn.x + (authBtn.width / 2);
        authBtnText.y = authBtn.y + authBtn.height / 2;
        Pixi.introScene.addChild(authBtnText);

        // Logo
        let logo = new Sprite(Pixi.textures["logo.png"]);
        logo.anchor.set(0, 0);
        Pixi.introScene.addChild(logo);

        logo.x = Pixi.width / 2 - logo.width / 2;
        logo.y = Pixi.height / 8;

        // Start
        let playGuestBtn = new Sprite(Pixi.textures["play_guest.png"])
        playGuestBtn.anchor.set(0, 0);
        playGuestBtn.x = Pixi.width / 2 - (playGuestBtn.width / 2);
        playGuestBtn.y = Pixi.height / 1.6;
        playGuestBtn.interactive = true;
        playGuestBtn.buttonMode = true;
        playGuestBtn.on("pointerdown", playGuest);
        Pixi.introScene.addChild(playGuestBtn);

        // Intro name, below play guest btn
        Pixi.introNameText = new Text("", new TextStyle({
            fontFamily: "Verdana",
            fontSize: 15,
            fill: "#fff",
            dropShadow: true,
            dropShadowBlur: 0.2,
            dropShadowDistance: 1,
        }));
        Pixi.introNameText.anchor.set(0.5);
        Pixi.introNameText.x = Pixi.width / 2;
        Pixi.introNameText.y = playGuestBtn.y + playGuestBtn.height + Pixi.introNameText.height + 10;
        Pixi.introScene.addChild(Pixi.introNameText);
    },
    showIntroName: function (name) {
        let timerId = setInterval(function () {
            if (Pixi.introNameText) {
                Pixi.introNameText.text = name;
                clearInterval(timerId);
            }
        }, 500);
    },
    loadTargetBtn: function (texture, handlerClick) {
        Pixi.targetBtn = new TilingSprite(texture, 230, 235);
        Pixi.targetBtn.position.set(0, 0);

        Pixi.targetBtn.x = WIDTH / 2 - (Pixi.targetBtn.width / 2);
        Pixi.targetBtn.y = HEIGHT - (Pixi.targetBtn.height) - 50;
        Pixi.targetBtn.interactive = true;
        Pixi.targetBtn.buttonMode = true;
        Pixi.targetBtn.on("pointerdown", handlerClick);
        Pixi.gameScene.addChild(Pixi.targetBtn);
    },
    toggleBtnState: function(press) {
        if (press) {
            Pixi.targetBtn.tilePosition.y = 235;
        } else {
            Pixi.targetBtn.tilePosition.y = 0;
        }
    },
    showGameScene: function (User) {
        
            if (Pixi.gameScene) {
                Pixi.introScene.visible = false;
                Pixi.gameScene.visible = true;

                Pixi.username.text = User.name;
                Pixi.username.x = 100;
            
            }
        
    },
    changeKing: function(king, isYourself) {
        let text = king.user.name;

        if (isYourself) {
            text = "| Ты – Царь горы |";
            Pixi.kingNameText.style.fill = "#edd100";
        } else {
            Pixi.kingNameText.style.fill = "#fff";
        }

        Pixi.kingNameText.text = text;
        Pixi.kingNameText.x = WIDTH / 2;

        Pixi.updateKingDuration(king.duration);
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
};