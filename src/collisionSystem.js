/**
 * collisionSystem.js
 * bullet<->asteroid + ship<->asteroid
 * spawn debris
 */
import {
    AsteroidTag, BulletTag, ShipTag,
    PositionComponent, CollisionBoxComponent, GameStateTag, GameStateComponent
} from "./components.js";
import {createAsteroid, createAsteroidDebris, createShipDebris} from "./entities.js";
import {playExplode, playAsteroidBreak} from "./audio.js";

export function collisionSystem(ecs, dt) {
    const asteroids = ecs.getEntitiesWithComponents(AsteroidTag, PositionComponent, CollisionBoxComponent);
    const bullets = ecs.getEntitiesWithComponents(BulletTag, PositionComponent, CollisionBoxComponent);
    const ships = ecs.getEntitiesWithComponents(ShipTag, PositionComponent, CollisionBoxComponent);

    const [gsEntity] = ecs.getEntitiesWithComponents(GameStateTag, GameStateComponent);
    if (!gsEntity) return;
    const gs = ecs.getComponent(gsEntity, GameStateComponent);

    // bullet<->asteroid
    for (const a of asteroids) {
        if (!ecs.entities.has(a)) continue;
        const apos = ecs.getComponent(a, PositionComponent);
        const acoll = ecs.getComponent(a, CollisionBoxComponent);
        if (!apos || !acoll) continue;

        let destroyed = false;
        for (const b of bullets) {
            if (!ecs.entities.has(b)) continue;
            const bpos = ecs.getComponent(b, PositionComponent);
            const bcoll = ecs.getComponent(b, CollisionBoxComponent);
            if (!bpos || !bcoll) continue;

            const dx = apos.x - bpos.x;
            const dy = apos.y - bpos.y;
            const distSq = dx * dx + dy * dy;
            const minDist = acoll.radius + bcoll.radius;
            if (distSq < minDist * minDist) {
                // bullet hits asteroid
                ecs.removeEntity(b);

                const oldR = acoll.radius;
                if (oldR > 15) {
                    const newR = oldR * 0.5;
                    for (let i = 0; i < 2; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const sp = 30 + Math.random() * 30;
                        createAsteroid(ecs, apos.x, apos.y, newR, sp * Math.cos(angle), sp * Math.sin(angle));
                    }
                }
                // On remove l'astéroïde
                ecs.removeEntity(a);
                // On spawn des debris
                createAsteroidDebris(ecs, apos.x, apos.y, [1, 1, 1], 6);

                // Score
                if (oldR > 30) gs.score += 20;
                else if (oldR > 15) gs.score += 50;
                else gs.score += 100;

                playAsteroidBreak();
                destroyed = true;
                break;
            }
        }
        if (destroyed) continue;
    }

    // ship<->asteroid
    for (const s of ships) {
        if (!ecs.entities.has(s)) continue;
        const spos = ecs.getComponent(s, PositionComponent);
        const scoll = ecs.getComponent(s, CollisionBoxComponent);
        if (!spos || !scoll) continue;

        for (const a of asteroids) {
            if (!ecs.entities.has(a)) continue;
            const apos = ecs.getComponent(a, PositionComponent);
            const acoll = ecs.getComponent(a, CollisionBoxComponent);
            if (!apos || !acoll) continue;

            const dx = apos.x - spos.x;
            const dy = apos.y - spos.y;
            const distSq = dx * dx + dy * dy;
            const minDist = acoll.radius + scoll.radius;
            if (distSq < minDist * minDist) {
                // ship meurt
                gs.lives--;
                ecs.removeEntity(s);

                // On crée les 3 barres du vaisseau en debris
                createShipDebris(ecs, spos.x, spos.y, [0, 1, 0]);

                playExplode();
                if (gs.lives <= 0) {
                    gs.state = "gameover";
                }
                break;
            }
        }
    }
}
