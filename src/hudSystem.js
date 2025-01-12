/**
 * hudSystem.js
 * Affiche score, niveau, vies, icônes
 */
import {GameStateTag, GameStateComponent} from "./components.js";

function drawMiniShip(ctx, size = 20) {
    ctx.strokeStyle = "#0f0";
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(-0.6 * size, 0.4 * size);
    ctx.lineTo(0.6 * size, 0.4 * size);
    ctx.closePath();
    ctx.stroke();
}

export function hudSystem(ecs, dt) {
    const [gsEntity] = ecs.getEntitiesWithComponents(GameStateTag, GameStateComponent);
    if (!gsEntity) return;
    const gs = ecs.getComponent(gsEntity, GameStateComponent);

    const scoreEl = document.getElementById("scoreDisplay");
    if (scoreEl) scoreEl.textContent = "Score: " + gs.score;

    const lvlEl = document.getElementById("levelDisplay");
    if (lvlEl) lvlEl.textContent = "Niveau: " + gs.level;

    const livesEl = document.getElementById("livesDisplay");
    if (livesEl) livesEl.textContent = "Vies: " + gs.lives;

    // icônes vie
    const iconsEl = document.getElementById("livesIcons");
    if (iconsEl) {
        iconsEl.innerHTML = "";
        for (let i = 0; i < gs.lives; i++) {
            const c = document.createElement("canvas");
            c.width = 40;
            c.height = 40;
            c.className = "life-icon";
            iconsEl.appendChild(c);

            const ctx = c.getContext("2d");
            ctx.save();
            ctx.translate(20, 20);
            drawMiniShip(ctx, 12);
            ctx.restore();
        }
    }
}
