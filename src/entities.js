/**
 * entities.js
 * Création d'entités : Ship, Asteroid, Bullet, GameState, Debris...
 */
import {
    ShipTag, AsteroidTag, BulletTag, GameStateTag, DebrisTag,
    PositionComponent, VelocityComponent, CollisionBoxComponent,
    GraphicsComponent, LifeTimeComponent, GameStateComponent, InputComponent,
    Asteroid3DComponent
} from "./components.js";

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const VIEW_LEFT = -GAME_WIDTH / 2;
export const VIEW_RIGHT = GAME_WIDTH / 2;
export const VIEW_BOTTOM = -GAME_HEIGHT / 2;
export const VIEW_TOP = GAME_HEIGHT / 2;

function generateAsteroidPolygon(radius, sides = 8) {
    const points = [];
    for (let i = 0; i < sides; i++) {
        const angle = i * (2 * Math.PI / sides);
        const randFactor = 0.8 + Math.random() * 0.4;
        const r = radius * randFactor;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        points.push({x, y});
    }
    return points;
}

// ===========
//  Debris
// ===========
export function createAsteroidDebris(ecs, x, y, color = [1, 1, 1], count = 8) {
    for (let i = 0; i < count; i++) {
        const e = ecs.createEntity();
        ecs.addComponent(e, new DebrisTag());

        ecs.addComponent(e, new PositionComponent(x, y, 0));

        const angle = Math.random() * Math.PI * 2;
        const speed = 80 + Math.random() * 120;
        const dx = speed * Math.cos(angle);
        const dy = speed * Math.sin(angle);
        const dr = (Math.random() - 0.5) * 4;
        ecs.addComponent(e, new VelocityComponent(dx, dy, dr));

        const poly = generateDebrisPolygon(5 + Math.floor(Math.random() * 6),
            8 + Math.random() * 12);

        const startC = [1.0, 0.7 + 0.3 * Math.random(), 0.0];
        const endC = [0.3, 0.3, 0.3];
        ecs.addComponent(e, new GraphicsComponent("debris", startC, {
            polyPoints: poly,
            startColor: startC,
            endColor: endC
        }));

        const life = 1.5 + Math.random() * 0.5;
        const lifeC = new LifeTimeComponent(life);
        lifeC.initial = life;
        ecs.addComponent(e, lifeC);
    }
}

function generateDebrisPolygon(sides, baseSize) {
    const points = [];
    for (let i = 0; i < sides; i++) {
        const angle = i * (2 * Math.PI / sides);
        const rFactor = 0.5 + Math.random() * 0.5;
        const r = baseSize * rFactor;
        const xx = Math.cos(angle) * r;
        const yy = Math.sin(angle) * r;
        points.push({x: xx, y: yy});
    }
    return points;
}

export function createShipDebris(ecs, x, y, color = [0, 1, 0]) {
    for (let i = 0; i < 3; i++) {
        const e = ecs.createEntity();
        ecs.addComponent(e, new DebrisTag());

        ecs.addComponent(e, new PositionComponent(x, y, 0));
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 50;
        ecs.addComponent(e, new VelocityComponent(speed * Math.cos(angle), speed * Math.sin(angle), 0));

        ecs.addComponent(e, new GraphicsComponent("shipDebris", color, {
            barIndex: i
        }));

        ecs.addComponent(e, new LifeTimeComponent(2.0));
    }
}

// ===========
//  GameState
// ===========
export function createGameState(ecs) {
    const e = ecs.createEntity();
    ecs.addComponent(e, new GameStateTag());
    ecs.addComponent(e, new GameStateComponent());
    ecs.addComponent(e, new InputComponent());
    return e;
}

// ===========
//   Ship
// ===========
export function createShip(ecs, x = 0, y = 0) {
    const e = ecs.createEntity();
    ecs.addComponent(e, new ShipTag());
    ecs.addComponent(e, new PositionComponent(x, y, 0));
    ecs.addComponent(e, new VelocityComponent(0, 0, 0));
    ecs.addComponent(e, new CollisionBoxComponent(12));
    ecs.addComponent(e, new GraphicsComponent("ship", [0, 1, 0], {
        size: 20
    }));
    return e;
}

// ===========
//  Asteroid
// ===========
export function createAsteroid(ecs, x, y, radius = 40, dx = 50, dy = 50) {
    const e = ecs.createEntity();
    ecs.addComponent(e, new AsteroidTag());
    ecs.addComponent(e, new PositionComponent(x, y, Math.random() * Math.PI * 2));
    ecs.addComponent(e, new VelocityComponent(dx, dy, (Math.random() - 0.5) * 0.5));
    ecs.addComponent(e, new CollisionBoxComponent(radius));
    ecs.addComponent(e, new Asteroid3DComponent(0, 0, 0.5 + Math.random(), 0.5 + Math.random(), null));

    const sides = 8;
    const polyPoints = generateAsteroidPolygon(radius, sides);
    ecs.addComponent(e, new GraphicsComponent("asteroid", [1, 1, 1], {
        radius,
        polyPoints
    }));

    return e;
}

// ===========
//  Bullet
// ===========
export function createBullet(ecs, x, y, rotation, speed = 300) {
    const e = ecs.createEntity();
    ecs.addComponent(e, new BulletTag());

    const offset = 20;
    const bx = x - Math.sin(rotation) * offset;
    const by = y + Math.cos(rotation) * offset;
    ecs.addComponent(e, new PositionComponent(bx, by, rotation));

    const dx = -Math.sin(rotation) * speed;
    const dy = Math.cos(rotation) * speed;
    ecs.addComponent(e, new VelocityComponent(dx, dy, 0));

    ecs.addComponent(e, new CollisionBoxComponent(5));
    ecs.addComponent(e, new GraphicsComponent("bullet", [1, 1, 0], {size: 4}));
    ecs.addComponent(e, new LifeTimeComponent(2.0));
    return e;
}
