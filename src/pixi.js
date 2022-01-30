import { Application, Container, Sprite, Text, TextStyle, Graphics } from "pixi.js";
import * as helpers from "./helpers.js";

const RESOURCE_PATH = "spritesheet.json";
const RAY_COUNT = 16;
const RAY_MAX_WAY = 100;
const RAY_SPEED = 0.05;
const RAY_TIMER = 25;
const VIEW_SCALE = 0.4;

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

    //Textures
    originalBtnTexture: null,
    targetBtn: null,
    targetBtnPressed: null,
    score: null,
    lines: [],

    // Functions
    init: function (isDev) {
        Pixi.width = 410;
        Pixi.height = 800;
        Pixi.isDev = isDev;

        if (helpers.mobileCheck()) { // if is mobile device
            Pixi.width = window.innerWidth;
            Pixi.height = window.innerHeight;
        }

        // Pixi Application
        Pixi.app = new Application({
            width: Pixi.width,
            height: Pixi.height,
            antialias: true,
            // resolution: window.devicePixelRatio // For good rendering on mobiles
        });
        document.body.appendChild(Pixi.app.view);
    },
    load: function (playGuest, handlerClick, gameLoop) {
        Pixi.app.loader.add(RESOURCE_PATH);

        Pixi.app.loader.load(() => {
            Pixi.textures = Pixi.app.loader.resources[RESOURCE_PATH].textures
            Pixi.showIntroScene(playGuest);

            Pixi.gameScene = new Container();
            Pixi.gameScene.visible = false;
            Pixi.app.stage.addChild(Pixi.gameScene);

            // Background
            let bg = new Sprite(Pixi.textures["back_start.png"]);
            bg.width = Pixi.width;
            bg.height = Pixi.height;
            bg.anchor.set(0, 0);
            Pixi.gameScene.addChild(bg);

            // Scorebar
            let scoreBar = new Container();
            Pixi.gameScene.addChild(scoreBar);

            let rectangle = new Graphics();
            rectangle.beginFill(0x312259)
                .drawRect(0, 0, Pixi.gameScene.width, 60)
                .endFill();
            scoreBar.addChild(rectangle);

            Pixi.score = new Text("", new TextStyle({
                fontFamily: "Verdana",
                fontSize: '10pt',
                fill: "#fff"
            }));
            Pixi.score.x = 0;
            Pixi.score.y = (scoreBar.height / 2);
            scoreBar.addChild(Pixi.score);

            // Current user
            let kingBar = new Container();
            kingBar.y = Pixi.height / 1.7;
            Pixi.gameScene.addChild(kingBar);

            let kingBarRect = new Graphics();
            kingBarRect.beginFill(0x312259, 0.8)
                .drawRect(20, 0, Pixi.width - 40, 60)
                .endFill();
            kingBar.addChild(kingBarRect);

            let kingName = new Text("", new TextStyle({
                fontFamily: "Verdana",
                fontSize: 20,
                fill: "#fff"
            }));
            kingName.anchor.set(0.5);
            kingName.x = kingBarRect.width / 2;
            kingName.y = kingBarRect.height / 2;
            kingBar.addChild(kingName);

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
    showIntroScene: function (playGuest) {
        Pixi.introScene = new Container();
        Pixi.app.stage.addChild(Pixi.introScene);

        // Background
        let bgStart = new Sprite(Pixi.textures["back_start.png"]);
        bgStart.anchor.set(0, 0);
        Pixi.introScene.addChild(bgStart);

        // Logo
        let logo = new Sprite(Pixi.textures["logo.png"]);
        logo.anchor.set(0, 0);
        Pixi.introScene.addChild(logo);

        logo.scale.x = VIEW_SCALE;
        logo.scale.y = VIEW_SCALE;
        logo.x = Pixi.width / 2 - logo.width / 2;
        logo.y = Pixi.height / 8;

        // Start
        let playGuestBtn = new Sprite(Pixi.textures["play_guest.png"])
        playGuestBtn.anchor.set(0, 0);
        playGuestBtn.scale.x = VIEW_SCALE;
        playGuestBtn.scale.y = VIEW_SCALE;
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
    loadTargetBtn: function (handlerClick) {
        // Target Button
        Pixi.originalBtnTexture = new Sprite(Pixi.textures["btn.png"])

        Pixi.targetBtn = new Sprite(Pixi.textures["btn.png"]);
        Pixi.targetBtn.anchor.set(0, 0);
        Pixi.targetBtn.scale.x = VIEW_SCALE;
        Pixi.targetBtn.scale.y = VIEW_SCALE;
        Pixi.targetBtn.x = Pixi.width / 2 - (Pixi.targetBtn.width / 2);
        Pixi.targetBtn.y = Pixi.height - Pixi.targetBtn.height - (Pixi.height / 16);
        Pixi.targetBtn.interactive = true;
        Pixi.targetBtn.buttonMode = true;
        Pixi.targetBtn.on("pointerdown", handlerClick);

        Pixi.gameScene.addChild(Pixi.targetBtn);

        Pixi.targetBtnPressed = new Sprite(Pixi.textures["btn_pressed.png"]);
    },
    loadGameScene: function (User) {
        Pixi.introScene.visible = false;
        Pixi.gameScene.visible = true;

        Pixi.score.text = User.name;
        Pixi.score.x = 10
    }
};