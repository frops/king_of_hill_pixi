const RESOURCE_PATH = "spritesheet.json";
let BackendURL = "http://localhost:8084/back";
let centrifugoHost = "ws://localhost:8000";
let WIDTH = 400;
let HEIGHT = 700;
const RAY_COUNT = 28;
const RAY_MAX_WAY = 100;
const RAY_SPEED = 0.05;
const RAY_TIMER = 25;
const VIEW_SCALE = 0.4;
const MODE = 'prod';

if (mobileCheck()) {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
}

if (MODE != "dev") {
    centrifugoHost = "ws://kh.sopost.ru";
    BackendURL = "http://kh.sopost.ru/back";
}

let w2 = WIDTH / 2;
let w4 = WIDTH / 4;
let w8 = WIDTH / 8;
let w16 = WIDTH / 16;
let w32 = WIDTH / 32;

// Lines for ray when clicking
let lines = [];

// Timer for rays
let timerRay = 0;

// Timer for point flow
let timerPointFlow = 0;

// Timer for press button
let timerClick = 0;

// State for clicking
let buttonClick = true;

// Sprites for buttons
let targetBtn, targetBtnPressed, originalBtnTexture;

// Containers
let kingBar; // bar with text about king of hill

// Sprites
let man;

// Scenes
let gameScene, introScene;

// Centrifugo
let centrifuge;

// Application
let app = new PIXI.Application({
    width: WIDTH,
    height: HEIGHT,
    antialias: true
});

let basicTextStyle = {
    fontFamily: "Verdana",
    fontSize: '20pt',
    fill: "#fff"
};

let smallTextStyle = basicTextStyle;
smallTextStyle.fontSize = '16pt';

let King = {
    user: null,

    // Seconds on the Hill
    secs: 0,

    // Change King
    changeKing: function (king) {
        this.name = king.name;
        this.secs = 0;
    }
};

var Server = {
    time: null,
    token: "",
    version: "",
    isLoaded: false,
};

var User = {
    isLoaded: false,
    isGuest: true,
    name: "",
    uuid: "",
    jwt: "",
}

// Load server info
loadServerInfo();

// Pixi
app.renderer.backgroundColor = 0xd7b6cb;
app.renderer.view.style.position = 'absolute';
document.body.appendChild(app.view);

let loadingScene = new PIXI.Container();
app.stage.addChild(loadingScene);

loadingText = new PIXI.Text("Загрузка...\n", new PIXI.TextStyle(basicTextStyle));
loadingScene.addChild(loadingText);
loadingText.anchor.set(0.5);
loadingText.position.set(WIDTH / 2, HEIGHT / 3);

// Loader
const loader = new PIXI.Loader();
loader.add(RESOURCE_PATH).load(setup);

function setup() {
    id = loader.resources[RESOURCE_PATH].textures

    showIntroScene();

    gameScene = new PIXI.Container();
    gameScene.visible = false;
    app.stage.addChild(gameScene);

    // Background
    bg = new PIXI.Sprite(id["back_start.png"]);
    bg.width = WIDTH;
    bg.height = HEIGHT;
    bg.anchor.set(0, 0);
    gameScene.addChild(bg);

    // Scorebar
    let scoreBar = new PIXI.Container();
    gameScene.addChild(scoreBar);

    let rectangle = new PIXI.Graphics();
    rectangle.beginFill(0x312259)
        .drawRect(0, 0, gameScene.width, 60)
        .endFill();
    scoreBar.addChild(rectangle);

    score = new PIXI.Text("", new PIXI.TextStyle({
        fontFamily: "Verdana",
        fontSize: '10pt',
        fill: "#fff"
    }));
    score.x = 0;
    score.y = (scoreBar.height / 2);
    scoreBar.addChild(score);

    // Current user
    kingBar = new PIXI.Container();
    kingBar.y = HEIGHT / 1.7;
    gameScene.addChild(kingBar);

    kingBarRect = new PIXI.Graphics();
    kingBarRect.beginFill(0x312259, 0.8)
        .drawRect(20, 0, WIDTH - 40, 60)
        .endFill();
    kingBar.addChild(kingBarRect);

    kingName = new PIXI.Text("", new PIXI.TextStyle({
        fontFamily: "Verdana",
        fontSize: 20,
        fill: "#fff"
    }));
    kingName.anchor.set(0.5);
    kingName.x = kingBarRect.width / 2;
    kingName.y = kingBarRect.height / 2;
    kingBar.addChild(kingName);

    // Load another
    loadMan();
    loadRays();
    loadTargetBtn();
    loadPointFlow();

    state = play;

    app.ticker.add(delta => gameLoop(delta));

    loadingScene.visible = false;

    if (MODE == 'dev') {
        playGuest();
    }
}

function showIntroScene() {
    introScene = new PIXI.Container();
    app.stage.addChild(introScene);

    // Background
    bgStart = new PIXI.Sprite(id["back_start.png"]);
    bgStart.anchor.set(0, 0);
    introScene.addChild(bgStart);

    // Logo
    let logo = new PIXI.Sprite(id["logo.png"]);
    logo.anchor.set(0, 0);
    introScene.addChild(logo);
    logo.scale.x = VIEW_SCALE;
    logo.scale.y = VIEW_SCALE;
    logo.x = WIDTH / 2 - logo.width / 2;
    logo.y = HEIGHT / 8;

    // Start
    playGuestBtn = new PIXI.Sprite(id["play_guest.png"])
    playGuestBtn.anchor.set(0, 0);
    playGuestBtn.scale.x = VIEW_SCALE;
    playGuestBtn.scale.y = VIEW_SCALE;
    playGuestBtn.x = WIDTH / 2 - (playGuestBtn.width / 2);
    playGuestBtn.y = HEIGHT / 1.6;
    playGuestBtn.interactive = true;
    playGuestBtn.buttonMode = true;
    playGuestBtn.on("pointerdown", playGuest);
    introScene.addChild(playGuestBtn);
}

// Runing functions
function gameLoop(delta) {
    state(delta);
}

function play() {
    if (timerClick == 0) {
        buttonClick = true;
        targetBtn.texture = originalBtnTexture.texture;
    } else if (timerClick > 0) {
        timerClick--;
    }

    runRays();
    // runPointFlow();
}

function handlerClick(e) {
    if (!User.isLoaded) {
        console.warn('user not loaded', 'handlerClick');
        return;
    }

    if (buttonClick == true) {
        buttonClick = false;
        timerClick = 10;

        targetBtn.texture = targetBtnPressed.texture;
        resetRayLines(e);
        // resetPointFlow(e, damage)

        axios.request({
            url: BackendURL + '/v1/click',
            method: 'post',
            headers: { "Authorization": "Bearer " + User.jwt },
            withCredentials: true,
        }).then(function (response) {
            console.log('CLICKED');
        }).catch(function (error) {
            console.error(error);
        });
    }

    resetRayLines(e);
}

function playGuest(e) {
    if (!Server.isLoaded) {
        console.warn('server not loaded yet');
        return
    }

    let jwt, jwtRaw = getCookieData('jwt');

    if (jwtRaw) {
        jwt = parseJwt(jwtRaw);
    }

    let isExpired = jwt && jwt.exp < parseInt(time() / 1000);

    if (jwt && !isExpired) {
        User = loadUser(jwt, jwtRaw);
        loadGameScene();
        console.log('LOCAL load user');
    } else {
        axios.request({
            url: BackendURL + '/v1/user/guest',
            method: 'post',
            headers: { "Authorization": "Bearer " + User.jwt },
            withCredentials: true,
        }).then(function (response) {
            userRaw = parseJwt(response.data.data.token);
            User = loadUser(userRaw, jwtRaw);
            loadGameScene();
            console.log('SERVER load user');
        }).catch(function (error) {
            console.error(error);
        });
    }
}

function loadServerInfo() {
    axios.get(BackendURL + '/v1/info')
        .then(function (response) {
            serverRaw = response.data.data;
            Server.time = new Date(serverRaw.time).getTime();
            Server.token = serverRaw.token;
            Server.version = serverRaw.version;
            Server.isLoaded = true;
            console.log('SERVER INFO loaded');
        }).catch(function (error) {
            console.error(error);
        });
}

function loadUser(jwt, jwtRaw) {
    User.isLoaded = true;
    User.uuid = jwt.uuid;
    User.name = jwt.name;
    User.isGuest = jwt.is_guest;
    User.jwt = jwtRaw;

    console.log(User, 'user loaded');

    return User
}

function loadGameScene() {
    introScene.visible = false;
    gameScene.visible = true;

    score.text = User.name;
    score.x = 10

    wsInit();
}

function wsInit() {
    if (!User.isLoaded || !Server.isLoaded) {
        console.warn("user or server not loaded");
        return;
    }

    centrifuge = new Centrifuge(centrifugoHost + "/connection/websocket", {
        debug: true
    });
    centrifuge.setToken(Server.token);

    centrifuge.on('connect', function (ctx) {
        console.log("connected", ctx);
    });

    centrifuge.on('disconnect', function (ctx) {
        console.log("disconnected", ctx);
    });

    centrifuge.subscribe("hill_click", function (ctx) {
        changeKing(ctx.data);
        console.log(ctx, "hill_click")
    });

    centrifuge.connect();
}

function changeKing(user) {
    King.user = user;
    kingName.text = user.name;
    kingName.x = kingBarRect.width / 2;
    kingName.y = kingBarRect.height / 2;
}

// Load functions
function loadTargetBtn() {
    // Target Button
    originalBtnTexture = new PIXI.Sprite(id["btn.png"])
    targetBtn = new PIXI.Sprite(id["btn.png"]);
    targetBtn.anchor.set(0, 0);
    targetBtn.scale.x = VIEW_SCALE;
    targetBtn.scale.y = VIEW_SCALE;
    targetBtn.x = WIDTH / 2 - (targetBtn.width / 2);
    targetBtn.y = HEIGHT - targetBtn.height - (HEIGHT / 16);
    targetBtn.interactive = true;
    targetBtn.buttonMode = true;
    targetBtn.on("pointerdown", handlerClick);
    gameScene.addChild(targetBtn);

    targetBtnPressed = new PIXI.Sprite(id["btn_pressed.png"]);
}

function loadMan() {
    // Target Button
    man = new PIXI.Sprite(id["man.png"])
    man.anchor.set(0, 0);
    man.x = w2 - man.width / 4 - 25;
    man.y = HEIGHT / 8;
    man.scale.x = VIEW_SCALE;
    man.scale.y = VIEW_SCALE;
    //gameScene.addChild(man);
}

function loadPointFlow() {
    pointFlow = new PIXI.Text("", new PIXI.TextStyle({
        fontFamily: "Verdana",
        fontSize: 24,
        fill: "#fff"
    }));
    pointFlow.anchor.set(0.5);
    gameScene.addChild(pointFlow);
}

// RAYS
function loadRays() {
    for (let i = 0; i < RAY_COUNT; i++) {
        let degree = (360 / RAY_COUNT) * i;
        let theta = degree * Math.PI / 180;
        let sin = Math.sin(theta);
        let cos = Math.cos(theta);

        lines[i] = {
            graphics: new PIXI.Graphics(),
            sin: sin,
            cos: cos,
        }

        gameScene.addChild(lines[i].graphics);

        lines[i].graphics.lineStyle(2, 0xe2da9c)
            .moveTo(0, 0)
            .lineTo(sin * 50, cos * 50)
            .endFill();
        lines[i].graphics.alpha = 0;
    }
}

function runRays() {
    if (timerRay > 0) {
        speed = 10;
        for (let i = 0; i < RAY_COUNT; i++) {
            lines[i].graphics.position.x += lines[i].sin * speed;
            lines[i].graphics.position.y += lines[i].cos * speed;
            lines[i].graphics.alpha -= 0.05;
        }

        timerRay--;
    }
}

function resetRayLines(e) {
    if (timerRay > RAY_TIMER / 3) {
        return;
    }

    timerRay = RAY_TIMER;

    for (let i = 0; i < RAY_COUNT; i++) {
        lines[i].graphics.position.x = targetBtn.position.x + targetBtn.width / 2 + targetBtn.width / 32;
        lines[i].graphics.position.y = targetBtn.position.y + targetBtn.height / 2 + 20;
        lines[i].graphics.alpha = 1;
    }
}

// POINT FLOW
function runPointFlow() {
    if (timerPointFlow > 0) {
        pointFlow.alpha -= 0.01;
        pointFlow.position.x += pointFlowConfig.sin * 2;
        pointFlow.position.y += pointFlowConfig.cos * 2;
        timerPointFlow--;
    }
}

function resetPointFlow(e, damage) {
    timerPointFlow = POINT_FLOW_TIMER;

    pointFlow.position.x = e.data.global.x;
    pointFlow.position.y = e.data.global.y;
    pointFlow.alpha = 1;
    pointFlow.text = "+" + damage;

    let degree = rand(0, 360);
    pointFlowConfig.sin = Math.sin(degree);
    pointFlowConfig.cos = Math.cos(degree);
}

function changeTargetTexture() {
    targetBtn.texture = targetBtnPressed.texture;
}