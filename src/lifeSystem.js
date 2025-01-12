/**
 * lifeSystem.js
 * supprime entités (bullet, etc.) après un temps
 */
import {LifeTimeComponent} from "./components.js";

export function lifeSystem(ecs, dt) {
    const ents = ecs.getEntitiesWithComponents(LifeTimeComponent);
    for (const e of ents) {
        const lifeC = ecs.getComponent(e, LifeTimeComponent);
        lifeC.life -= dt;
        if (lifeC.life <= 0) {
            ecs.removeEntity(e);
        }
    }
}
