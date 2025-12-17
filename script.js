let count = 0;

const counter = document.getElementById("counter");
const clickBtn = document.getElementById("clickBtn");
const resetBtn = document.getElementById("resetBtn");
const themeLightBtn = document.getElementById("themeLight");
const themeBlueBtn = document.getElementById("themeBlue");
const themeDarkBtn = document.getElementById("themeDark");
const body = document.body;
let currentTheme = 'light';

if (!counter) {
    console.warn('Element with id "counter" not found.');
}

if (clickBtn) {
    clickBtn.addEventListener("click", () => {
    count++;
    if (counter) counter.textContent = count;

    counter.style.transform = "scale(1.2)";
    // small pressed animation for button
    clickBtn.classList.add('pressed');
    setTimeout(() => clickBtn.classList.remove('pressed'), 120);
    setTimeout(() => {
        if (counter) counter.style.transform = "scale(1)";
    }, 150);
    });
} else {
    console.warn('Element with id "clickBtn" not found.');
}

if (resetBtn) {
    resetBtn.addEventListener("click", () => {
    count = 0;
    if (counter) counter.textContent = count;
    resetBtn.classList.add('pressed');
    setTimeout(() => resetBtn.classList.remove('pressed'), 120);
    });
} else {
    console.warn('Element with id "resetBtn" not found.');
}

// Theme handling
function applyTheme(theme) {
    currentTheme = theme;
    body.classList.remove('theme-light', 'theme-blue', 'theme-dark');
    if (theme === 'blue') body.classList.add('theme-blue');
    else if (theme === 'dark') body.classList.add('theme-dark');
    else body.classList.add('theme-light');
    try { localStorage.setItem('theme', theme); } catch (e) { /* ignore */ }
    // apply slider adjustments
    if (theme === 'light') {
        const val = 100;
        const adjusted = adjustLightness('#f4f6f8', val);
        document.documentElement.style.setProperty('--bg-color', adjusted);
        const textCol = getLuminance(adjusted) < 0.6 ? '#ffffff' : '#0f172a';
        document.querySelectorAll('.container, .container *').forEach(el => el.style.color = textCol);
    } else if (theme === 'blue') {
        const val = 100;
        const adjusted = adjustSaturation('#e7f0ff', val);
        document.documentElement.style.setProperty('--bg-color', adjusted);
        const textCol = getLuminance(adjusted) < 0.6 ? '#ffffff' : '#0f172a';
        document.querySelectorAll('.container, .container *').forEach(el => el.style.color = textCol);
    } else if (theme === 'dark') {
        const adjusted = '#1f2937';
        document.documentElement.style.setProperty('--bg-color', adjusted);
        document.querySelectorAll('.container, .container *').forEach(el => el.style.color = '#f3f4f6');
    }
}

if (themeLightBtn) themeLightBtn.addEventListener('click', () => applyTheme('light'));
if (themeBlueBtn) themeBlueBtn.addEventListener('click', () => applyTheme('blue'));
if (themeDarkBtn) themeDarkBtn.addEventListener('click', () => applyTheme('dark'));

// Helpers for color conversion and luminance
function hexToRgb(hex) {
    hex = hex.replace('#','');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex,16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHsl(r,g,b) {
    r/=255; g/=255; b/=255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h, s, l = (max + min) / 2;
    if (max === min) h = s = 0;
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
}

function hslToHex(h,s,l) {
    s /= 100; l /= 100;
    const k = n => (n + h/30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(Math.min(k(n)-3, 9-k(n), 1), -1);
    const toHex = x => Math.round(255 * x).toString(16).padStart(2, '0');
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function adjustLightness(hex, percent) {
    const {r,g,b} = hexToRgb(hex);
    const hsl = rgbToHsl(r,g,b);
    const newL = Math.min(100, Math.max(0, Math.round(hsl.l * percent / 100)));
    return hslToHex(hsl.h, hsl.s, newL);
}

function adjustSaturation(hex, percent) {
    const {r,g,b} = hexToRgb(hex);
    const hsl = rgbToHsl(r,g,b);
    const newS = Math.min(100, Math.max(0, Math.round(hsl.s * percent / 100)));
    return hslToHex(hsl.h, newS, hsl.l);
}

function getLuminance(hex) {
    const {r,g,b} = hexToRgb(hex);
    // relative luminance (approx)
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// Sliders removed: no-op

// Load persisted theme
try {
    const saved = localStorage.getItem('theme');
    if (saved) applyTheme(saved);
} catch (e) { /* ignore */ }
// Ensure default theme applied if nothing saved
if (!localStorage.getItem('theme')) applyTheme('light');

// Keyboard accessibility: space => click, R => reset
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (clickBtn) clickBtn.click();
    } else if (e.key.toLowerCase() === 'r') {
        if (resetBtn) resetBtn.click();
    }
});
