/**
 * components.js
 * Tous les composants ECS
 */

export class ShipTag {
}

export class AsteroidTag {
}

export class BulletTag {
}

export class GameStateTag {
}

export class DebrisTag {
}

// Position / Rotation
export class PositionComponent {
    constructor(x, y, rotation = 0) {
        this.x = x;
        this.y = y;
        this.rotation = rotation;
    }
}

// Vitesse
export class VelocityComponent {
    constructor(dx, dy, dr = 0) {
        this.dx = dx;
        this.dy = dy;
        this.dr = dr;
    }
}

// Collision circulaire
export class CollisionBoxComponent {
    constructor(radius) {
        this.radius = radius;
    }
}

// Graphique
export class GraphicsComponent {
    constructor(shape, color = [1, 1, 1], extra = {}) {
        this.shape = shape;
        this.color = color;
        this.extra = extra;
    }
}

// Durée de vie
export class LifeTimeComponent {
    constructor(seconds) {
        this.life = seconds;
        this.initial = seconds;
    }
}

// État global
export class GameStateComponent {
    constructor() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.state = "running";
    }
}

// Input
export class InputComponent {
    constructor() {
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        this.shoot = false;
        this.hyper = false;
    }
}

// Asteroide 3D
export class Asteroid3DComponent {
    constructor(angleX = 0, angleY = 0, speedX = 1, speedY = 1, texture = null) {
        this.angleX = angleX;
        this.angleY = angleY;
        this.speedX = speedX;
        this.speedY = speedY;
        this.texture = texture;
    }
}
