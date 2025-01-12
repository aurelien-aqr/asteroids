/**
 * physicsSystem.js
 * Gère le déplacement + wrap
 */
import {PositionComponent, VelocityComponent, Asteroid3DComponent} from "./components.js";
import {VIEW_LEFT, VIEW_RIGHT, VIEW_BOTTOM, VIEW_TOP} from "./entities.js";

export function physicsSystem(ecs, dt) {
    const movables = ecs.getEntitiesWithComponents(PositionComponent, VelocityComponent);
    for (const e of movables) {
        const pos = ecs.getComponent(e, PositionComponent);
        const vel = ecs.getComponent(e, VelocityComponent);

        pos.rotation += vel.dr * dt;
        pos.x += vel.dx * dt;
        pos.y += vel.dy * dt;

        if (pos.x < VIEW_LEFT) pos.x = VIEW_RIGHT;
        if (pos.x > VIEW_RIGHT) pos.x = VIEW_LEFT;
        if (pos.y < VIEW_BOTTOM) pos.y = VIEW_TOP;
        if (pos.y > VIEW_TOP) pos.y = VIEW_BOTTOM;
    }

    const ast3Ds = ecs.getEntitiesWithComponents(Asteroid3DComponent);
    for (const e of ast3Ds) {
        const a3d = ecs.getComponent(e, Asteroid3DComponent);
        a3d.angleX += a3d.speedX * dt;
        a3d.angleY += a3d.speedY * dt;
    }
}
