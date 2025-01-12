/**
 * inputSystem.js
 * Gère l'appui sur les touches, rotation/propulsion du vaisseau
 */
import {GameStateTag, InputComponent, ShipTag, PositionComponent, VelocityComponent} from "./components.js";
import {createBullet, VIEW_LEFT, VIEW_RIGHT, VIEW_BOTTOM, VIEW_TOP} from "./entities.js";
import {playShoot} from "./audio.js";

export function inputSystem(ecs, dt) {
    const [gsEntity] = ecs.getEntitiesWithComponents(GameStateTag, InputComponent);
    if (!gsEntity) return;
    const input = ecs.getComponent(gsEntity, InputComponent);

    const ships = ecs.getEntitiesWithComponents(ShipTag, PositionComponent, VelocityComponent);
    if (ships.length === 0) return;
    const ship = ships[0];

    const pos = ecs.getComponent(ship, PositionComponent);
    const vel = ecs.getComponent(ship, VelocityComponent);

    // Rotation
    const rotationSpeed = 2.5;
    if (input.left) {
        pos.rotation += rotationSpeed * dt;
    }
    if (input.right) {
        pos.rotation -= rotationSpeed * dt;
    }

    // Avancer
    const thrust = 120;
    if (input.up) {
        vel.dx += -Math.sin(pos.rotation) * thrust * dt;
        vel.dy += Math.cos(pos.rotation) * thrust * dt;
    } else {
        vel.dx *= 0.98;
        vel.dy *= 0.98;
    }

    // Tir
    if (input.shoot) {
        playShoot();
        createBullet(ecs, pos.x, pos.y, pos.rotation, 400);
        input.shoot = false;
    }

    // Hyperspace
    if (input.hyper) {
        // on téléporte
        pos.x = VIEW_LEFT + Math.random() * (VIEW_RIGHT - VIEW_LEFT);
        pos.y = VIEW_BOTTOM + Math.random() * (VIEW_TOP - VIEW_BOTTOM);
        input.hyper = false;
    }
}
