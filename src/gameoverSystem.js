/**
 * gameoverSystem.js
 * Gère la fin + respawn
 */
import {GameStateTag, GameStateComponent, ShipTag} from "./components.js";
import {createShip} from "./entities.js";

let respawnTimer = 0;

export function gameoverSystem(ecs, dt) {
    const [gsEntity] = ecs.getEntitiesWithComponents(GameStateTag, GameStateComponent);
    if (!gsEntity) return;
    const gs = ecs.getComponent(gsEntity, GameStateComponent);

    const msgEl = document.getElementById("gameOverMessage");
    if (gs.state === "gameover") {
        if (msgEl) msgEl.style.display = "block";
        return;
    } else {
        if (msgEl) msgEl.style.display = "none";
    }

    // respawn
    const ships = ecs.getEntitiesWithComponents(ShipTag);
    if (gs.lives > 0 && ships.length === 0) {
        respawnTimer -= dt;
        if (respawnTimer <= 0) {
            createShip(ecs, 0, 0);
            respawnTimer = 1.5;
        }
    }
}
