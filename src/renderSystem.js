/**
 * renderSystem.js
 * Rendu WebGL 2D :
 *  - Vaisseau + flamme si "up"
 *  - Balles
 *  - Astéroïdes
 *  - Débris d'astéroïde
 *  - Débris du vaisseau
 */
import {
    PositionComponent, GraphicsComponent, DebrisTag,
    GameStateTag, GameStateComponent, InputComponent, LifeTimeComponent
} from "./components.js";
import {GAME_WIDTH, GAME_HEIGHT} from "./entities.js";

let gl;
let shaderProgram;

let aPositionLoc;
let uColorLoc;
let uModelLoc;
let uProjectionLoc;

let shapeBuffer;

// ===================
//    Matrices
// ===================
function identity() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}

function translate(m, tx, ty) {
    const out = m.slice();
    out[12] = m[0] * tx + m[4] * ty + m[12];
    out[13] = m[1] * tx + m[5] * ty + m[13];
    return out;
}

function rotateZ(m, rad) {
    const out = m.slice();
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    out[0] = m[0] * c + m[4] * s;
    out[1] = m[1] * c + m[5] * s;
    out[4] = m[0] * -s + m[4] * c;
    out[5] = m[1] * -s + m[5] * c;
    return out;
}

function ortho(left, right, bottom, top, near, far) {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);
    const out = new Float32Array(16);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
}

// ===================
//   Shaders
// ===================
function createShader(gl, src, type) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("Shader error:", gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
    }
    return sh;
}

function createProgram(gl, vsSrc, fsSrc) {
    const vs = createShader(gl, vsSrc, gl.VERTEX_SHADER);
    const fs = createShader(gl, fsSrc, gl.FRAGMENT_SHADER);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error("Program link error:", gl.getProgramInfoLog(prog));
        return null;
    }
    return prog;
}

// =============
//  Dessin SHIP
// =============
function drawWireShip(size, showFlame) {
    const arr = new Float32Array([
        0, size,
        -0.6 * size, -0.4 * size,
        0.6 * size, -0.4 * size,
        0, size
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPositionLoc);

    gl.drawArrays(gl.LINE_STRIP, 0, 4);

    if (showFlame) {
        gl.uniform4f(uColorLoc, 1, 0.5, 0, 1);
        const flicker = 0.1 * size * (Math.random() - 0.5);
        const flame = new Float32Array([
            -0.3 * size + flicker, -0.4 * size,
            0.3 * size + flicker, -0.4 * size,
            0, -0.8 * size + flicker
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, flame, gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        gl.uniform4f(uColorLoc, 0, 1, 0, 1);
    }
}

// =============
// Dessin BULLET
// =============
function drawBullet(size) {
    const arr = new Float32Array([
        -size, -size,
        size, -size,
        size, size,
        -size, size
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPositionLoc);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

// =============
//  Astéroïde
// =============
function drawAsteroidPolygon(points) {
    const n = points.length;
    const arr = new Float32Array((n + 2) * 2);
    arr[0] = 0;
    arr[1] = 0;
    for (let i = 0; i < n; i++) {
        arr[(i + 1) * 2 + 0] = points[i].x;
        arr[(i + 1) * 2 + 1] = points[i].y;
    }
    arr[(n + 1) * 2 + 0] = points[0].x;
    arr[(n + 1) * 2 + 1] = points[0].y;

    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPositionLoc);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, n + 2);
}

// =============
//  Debris
// =============
function drawDebrisPolygon(points) {
    const n = points.length;
    const arr = new Float32Array((n + 2) * 2);
    arr[0] = 0;
    arr[1] = 0;
    for (let i = 0; i < n; i++) {
        arr[(i + 1) * 2 + 0] = points[i].x;
        arr[(i + 1) * 2 + 1] = points[i].y;
    }
    arr[(n + 1) * 2 + 0] = points[0].x;
    arr[(n + 1) * 2 + 1] = points[0].y;

    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPositionLoc);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, n + 2);
}

// =============
//  ShipDebris
// =============
function drawShipDebris(barIndex) {
    let arr;
    if (barIndex === 0) {
        arr = new Float32Array([
            -10, 0,
            0, -20
        ]);
    } else if (barIndex === 1) {
        arr = new Float32Array([
            0, -20,
            10, 0
        ]);
    } else {
        arr = new Float32Array([
            -10, -20,
            10, -20
        ]);
    }
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPositionLoc);

    gl.drawArrays(gl.LINE_STRIP, 0, arr.length / 2);
}

// =============
//   INIT
// =============
export function initWebGL() {
    const cvs = document.getElementById("gameCanvas");
    gl = cvs.getContext("webgl");
    if (!gl) {
        alert("WebGL non supporté");
        return;
    }

    const vsSource = `
    attribute vec2 aPosition;
    uniform mat4 uModel;
    uniform mat4 uProjection;
    uniform vec4 uColor;
    void main(){
      gl_Position= uProjection * uModel * vec4(aPosition, 0.0, 1.0);
    }
  `;
    const fsSource = `
    precision mediump float;
    uniform vec4 uColor;
    void main(){
      gl_FragColor= uColor;
    }
  `;
    shaderProgram = createProgram(gl, vsSource, fsSource);

    aPositionLoc = gl.getAttribLocation(shaderProgram, "aPosition");
    uColorLoc = gl.getUniformLocation(shaderProgram, "uColor");
    uModelLoc = gl.getUniformLocation(shaderProgram, "uModel");
    uProjectionLoc = gl.getUniformLocation(shaderProgram, "uProjection");

    shapeBuffer = gl.createBuffer();

    gl.useProgram(shaderProgram);

    const projection = ortho(-GAME_WIDTH / 2, GAME_WIDTH / 2, -GAME_HEIGHT / 2, GAME_HEIGHT / 2, -1, 1);
    gl.uniformMatrix4fv(uProjectionLoc, false, projection);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.viewport(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

// =============
//  RENDER
// =============
export function renderSystem(ecs, dt) {
    if (!gl) return;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(shaderProgram);

    let flameOn = false;
    {
        const [gsEntity] = ecs.getEntitiesWithComponents(GameStateTag, GameStateComponent, InputComponent);
        if (gsEntity) {
            const input = ecs.getComponent(gsEntity, InputComponent);
            if (input && input.up) {
                flameOn = true;
            }
        }
    }

    const renderables = ecs.getEntitiesWithComponents(PositionComponent, GraphicsComponent);
    for (const e of renderables) {
        const pos = ecs.getComponent(e, PositionComponent);
        const gfx = ecs.getComponent(e, GraphicsComponent);

        let model = identity();
        model = translate(model, pos.x, pos.y);
        model = rotateZ(model, pos.rotation);

        gl.uniformMatrix4fv(uModelLoc, false, model);

        let r = gfx.color[0], g = gfx.color[1], b = gfx.color[2];
        let alpha = 1.0;

        const lifeC = ecs.getComponent(e, LifeTimeComponent);
        if (gfx.shape === "debris" && lifeC) {
            const t = lifeC.life / (lifeC.initial || 1);
            alpha = t;

            if (gfx.extra.startColor && gfx.extra.endColor) {
                const sc = gfx.extra.startColor;
                const ec = gfx.extra.endColor;
                r = sc[0] * t + ec[0] * (1 - t);
                g = sc[1] * t + ec[1] * (1 - t);
                b = sc[2] * t + ec[2] * (1 - t);
            }
        }
        gl.uniform4f(uColorLoc, r, g, b, alpha);

        gl.bindBuffer(gl.ARRAY_BUFFER, shapeBuffer);

        switch (gfx.shape) {
            case "ship":
                drawWireShip(gfx.extra.size || 20, flameOn);
                break;

            case "bullet":
                drawBullet(gfx.extra.size || 3);
                break;

            case "asteroid":
                if (gfx.extra.polyPoints) {
                    drawAsteroidPolygon(gfx.extra.polyPoints);
                }
                break;

            case "debris":
                if (gfx.extra.polyPoints) {
                    drawDebrisPolygon(gfx.extra.polyPoints);
                }
                break;

            case "shipDebris":
                const barIndex = gfx.extra.barIndex || 0;
                drawShipDebris(barIndex);
                break;
        }
    }
}
