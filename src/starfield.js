/**
 * starfield.js
 * Fond étoilé animé
 */
let ctx;
let stars = [];
const numStars = 100;
let width = 800;
let height = 600;

export function initStarfield() {
    const canvas = document.getElementById("starfieldCanvas");
    if (!canvas) return;
    width = canvas.width;
    height = canvas.height;
    ctx = canvas.getContext("2d");

    stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            speed: 0.2 + Math.random() * 0.5
        });
    }
}

export function updateStarfield(dt) {
    for (const s of stars) {
        s.y += s.speed * 50 * dt;
        if (s.y > height) {
            s.y = 0;
            s.x = Math.random() * width;
        }
    }
}

export function renderStarfield() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "white";
    for (const s of stars) {
        ctx.fillRect(s.x, s.y, 2, 2);
    }
}
