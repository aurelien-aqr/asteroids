/**
 * audio.js
 * Gère la musique + SFX
 */

const music = new Audio("assets/music.mp3");
music.loop = true;
music.volume = 0.5;

const sfxShoot = new Audio("assets/shoot.wav");
const sfxExplode = new Audio("assets/explode.wav");
const sfxAsteroidBreak = new Audio("assets/asteroidBreak.wav");

let musicStarted = false;

export function playMusic() {
    if (!musicStarted) {
        musicStarted = true;
        const startMusic = () => {
            music.play().catch(() => {});
            document.body.removeEventListener('click', startMusic);
            document.body.removeEventListener('keydown', startMusic);
        };
        document.body.addEventListener('click', startMusic, { once: true });
        document.body.addEventListener('keydown', startMusic, { once: true });
    }
}

export function pauseMusic() {
    music.pause();
}

export function toggleMusic(mute) {
    if (mute) {
        music.pause();
    } else {
        music.play().catch(() => {});
    }
}

export function playShoot() {
    sfxShoot.currentTime = 0;
    sfxShoot.play().catch(() => {});
}

export function playExplode() {
    sfxExplode.currentTime = 0;
    sfxExplode.play().catch(() => {});
}

export function playAsteroidBreak() {
    sfxAsteroidBreak.currentTime = 0;
    sfxAsteroidBreak.play().catch(() => {});
}