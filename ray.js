const COUNT_RAYS = 16;
const RAY_MAX_WAY = 100;
const SPEED = 0.1;
const TIMER = 40;

let app = new PIXI.Application({
    width: 400,
    height: 400,
    antialias: true,
    backgroundColor: 0x374f12,
});

let timer = 0;

app.renderer.backgroundCoolor = 0x374f12;
app.renderer.view.style.position = 'absolute';

document.body.appendChild(app.view);

gameScene = new PIXI.Container();
gameScene.interactive = true;
gameScene.width = app.renderer.width;
gameScene.hight = app.renderer.height;
app.stage.addChild(gameScene);

let lines = [];

for (let i = 0; i < COUNT_RAYS; i++) {
    let degree = (360 / COUNT_RAYS) * i;
    let theta = degree * Math.PI / 180;
    let sin = Math.sin(theta);
    let cos = Math.cos(theta);

    lines[i] = {
        graphics: new PIXI.Graphics(),
        sin: sin,
        cos: cos,
    }

    gameScene.addChild(lines[i].graphics);

    lines[i].graphics.position.set(app.renderer.width / 2, app.renderer.height / 2);
    lines[i].graphics.lineStyle(1, 0xffffff)
        .moveTo(0, 0)
        .lineTo(sin * 15, cos * 15)
        .endFill();
    lines[i].graphics.alpha = 0;
}

// Listen for animate update
app.ticker.add((delta) => {
    if (timer > 0) {
        playRay(delta);
        timer--;
    }
});

function playRay(delta) {
    speed = 6;
    for (let i = 0; i < COUNT_RAYS; i++) {
        lines[i].graphics.position.x += lines[i].sin * speed;
        lines[i].graphics.position.y += lines[i].cos * speed;
        lines[i].graphics.alpha -= 0.05;
    }
}

function resetRayLines(e) {
    for (let i = 0; i < COUNT_RAYS; i++) {
        lines[i].graphics.position.x = e.clientX - 55;
        lines[i].graphics.position.y = e.clientY;
        lines[i].graphics.alpha = 1;
    }
}

window.addEventListener('click', function (e) {
    if (timer < TIMER / 3) {
        resetRayLines(e);
        timer = TIMER;
    }

});