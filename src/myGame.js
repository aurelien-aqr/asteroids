/**
 * myGame.js
 * Point d’entrée : init ECS, init Starfield, mainLoop
 */
import {ECS} from "./engine.js";
import {inputSystem} from "./inputSystem.js";
import {physicsSystem} from "./physicsSystem.js";
import {collisionSystem} from "./collisionSystem.js";
import {hudSystem} from "./hudSystem.js";
import {gameoverSystem} from "./gameoverSystem.js";
import {lifeSystem} from "./lifeSystem.js";
import {renderSystem, initWebGL} from "./renderSystem.js";

import {createGameState, createShip, createAsteroid, GAME_WIDTH, GAME_HEIGHT} from "./entities.js";
import {
    GameStateTag,
    GameStateComponent,
    InputComponent,
    AsteroidTag,
    PositionComponent,
    CollisionBoxComponent
} from "./components.js";

import {initStarfield, updateStarfield, renderStarfield} from "./starfield.js";
import {playMusic, toggleMusic} from "./audio.js";

let ecs;
let lastTime = 0;
let paused = false;
let muted = false;

function mainLoop(timestamp) {
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (!paused) {
        ecs.updateSystems(dt);
        updateStarfield(dt);
        checkAsteroidCount();
    }
    renderStarfield();

    if (!paused) {
        renderSystem(ecs, dt);
    } else {
        const cvs = document.getElementById("gameCanvas");
        if (cvs) {
            const c2d = cvs.getContext("2d");
            if (c2d) {
                c2d.save();
                c2d.fillStyle = "rgba(0,0,0,0.5)";
                c2d.fillRect(0, 0, cvs.width, cvs.height);
                c2d.fillStyle = "#fff";
                c2d.fillText("PAUSED", cvs.width / 2 - 30, cvs.height / 2);
                c2d.restore();
            }
        }
    }
    requestAnimationFrame(mainLoop);
}

function checkAsteroidCount() {
    const [gsEntity] = ecs.getEntitiesWithComponents(GameStateTag, GameStateComponent);
    if (!gsEntity) return;
    const gs = ecs.getComponent(gsEntity, GameStateComponent);

    const asts = ecs.getEntitiesWithComponents(AsteroidTag, PositionComponent, CollisionBoxComponent);
    if (asts.length === 0) {
        gs.level++;
        spawnAsteroids(gs.level * 5);
    }
}

function spawnAsteroids(n = 5) {
    for (let i = 0; i < n; i++) {
        const x = (Math.random() - 0.5) * GAME_WIDTH;
        const y = (Math.random() - 0.5) * GAME_HEIGHT;
        const dx = (Math.random() - 0.5) * 60;
        const dy = (Math.random() - 0.5) * 60;
        createAsteroid(ecs, x, y, 40, dx, dy);
    }
}

function initGame() {
    ecs = new ECS();

    ecs.addSystem(inputSystem);
    ecs.addSystem(physicsSystem);
    ecs.addSystem(lifeSystem);
    ecs.addSystem(collisionSystem);
    ecs.addSystem(hudSystem);
    ecs.addSystem(gameoverSystem);

    initWebGL();
    initStarfield();

    const gs = createGameState(ecs);

    createShip(ecs, 0, 0);
    spawnAsteroids(5);

    playMusic();
    requestAnimationFrame(mainLoop);
}

// BOUTONS
document.addEventListener("DOMContentLoaded", () => {
    const btnPause = document.getElementById("btnPause");
    if (btnPause) {
        btnPause.addEventListener("click", () => {
            paused = !paused;
            btnPause.textContent = paused ? "Continuer" : "Pause";
        });
    }
    const btnMute = document.getElementById("btnMute");
    if (btnMute) {
        btnMute.addEventListener("click", () => {
            muted = !muted;
            toggleMusic(muted);
            btnMute.textContent = muted ? "Unmute" : "Mute";
        });
    }
    const btnHyper = document.getElementById("btnHyperspace");
    if (btnHyper) {
        btnHyper.addEventListener("click", () => {
            const [gsEntity] = ecs.getEntitiesWithComponents(GameStateTag, GameStateComponent, InputComponent);
            if (gsEntity) {
                const input = ecs.getComponent(gsEntity, InputComponent);
                if (input) {
                    input.hyper = true;
                }
            }
        });
    }
});

// CLAVIER
document.addEventListener("keydown", (e) => {
    if (!ecs) return;
    const [gsEntity] = ecs.getEntitiesWithComponents(GameStateTag, GameStateComponent, InputComponent);
    if (!gsEntity) return;
    const input = ecs.getComponent(gsEntity, InputComponent);

    switch (e.key) {
        case "ArrowLeft":
            input.left = true;
            break;
        case "ArrowRight":
            input.right = true;
            break;
        case "ArrowUp":
            input.up = true;
            break;
        case " ":
            input.shoot = true;
            break;
        case "Shift":
            input.hyper = true;
            break;
        case "p":
        case "P":
            paused = !paused;
            break;
        case "m":
        case "M":
            muted = !muted;
            toggleMusic(muted);
            break;
        case "r":
        case "R": {
            const gs = ecs.getComponent(gsEntity, GameStateComponent);
            if (gs.state === "gameover") {
                resetGame();
            }
        }
            break;
    }
});
document.addEventListener("keyup", (e) => {
    if (!ecs) return;
    const [gsEntity] = ecs.getEntitiesWithComponents(GameStateTag, GameStateComponent, InputComponent);
    if (!gsEntity) return;
    const input = ecs.getComponent(gsEntity, InputComponent);

    switch (e.key) {
        case "ArrowLeft":
            input.left = false;
            break;
        case "ArrowRight":
            input.right = false;
            break;
        case "ArrowUp":
            input.up = false;
            break;
        case " ":
            input.shoot = false;
            break;
        case "Shift":
            input.hyper = false;
            break;
    }
});

function resetGame() {
    for (const e of ecs.entities.keys()) {
        ecs.removeEntity(e);
    }
    const gs = createGameState(ecs);
    createShip(ecs, 0, 0);
    spawnAsteroids(5);

    const gm = document.getElementById("gameOverMessage");
    if (gm) gm.style.display = "none";
}

window.onload = initGame;
