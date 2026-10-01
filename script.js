// =====================================================
// AIGIRI Birthday Poster Maker
// The whole poster is DRAWN BY CODE on a <canvas>,
// so no template image file is needed anymore.
// =====================================================

// ---- 1. Grab the elements from index.html (by their id) ----
const $ = (id) => document.getElementById(id);

const canvas = $("poster");
const ctx = canvas.getContext("2d");   // ctx = our "paintbrush"
const W = canvas.width;                // 1080
const H = canvas.height;               // 1350

const LOGO_URL = "https://koushil24.github.io/aigiri-geleyara-balaga/images/logo.png";

// ---- 2. Variables that remember things ----
let photo = null;  // the uploaded picture
let logo = null;   // the AIGIRI logo

// ---- 3. Helper: load an image file and wait until ready ----
function loadImage(src, useCors) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (useCors) img.crossOrigin = "anonymous"; // lets us download the final poster
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ---- 4. Helper: rounded rectangle (works on every browser) ----
function roundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ---- 5. Helper: same "random" confetti every time ----
function seededRandom(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

// ---- 6. Draw each part of the poster ----
function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#5c0000");
  g.addColorStop(0.5, "#8f0000");
  g.addColorStop(1, "#3d0000");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Golden sun rays behind the photo
  const cx = W / 2, cy = 560, rays = 28;
  for (let i = 0; i < rays; i++) {
    if (i % 2) continue;
    const a1 = (i / rays) * Math.PI * 2;
    const a2 = ((i + 1) / rays) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, 1100, a1, a2);
    ctx.closePath();
    ctx.fillStyle = "rgba(244, 197, 66, 0.07)";
    ctx.fill();
  }

  // Confetti
  const rand = seededRandom(7);
  const colors = ["#f4c542", "#ffe58a", "#fff3d6", "#ff6b5a"];
  for (let i = 0; i < 80; i++) {
    ctx.save();
    ctx.translate(rand() * W, rand() * 1200);
    ctx.rotate(rand() * Math.PI);
    ctx.globalAlpha = 0.35 + rand() * 0.45;
    ctx.fillStyle = colors[Math.floor(rand() * colors.length)];
    ctx.fillRect(0, 0, 10 + rand() * 14, 6 + rand() * 8);
    ctx.restore();
  }
}

function drawTitle() {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#ffe58a";
  ctx.font = "bold 40px Georgia, serif";
  if ("letterSpacing" in ctx) ctx.letterSpacing = "10px";
  ctx.fillText("✦ HAPPY ✦", W / 2, 95);

  const g = ctx.createLinearGradient(0, 120, 0, 230);
  g.addColorStop(0, "#fff3a3");
  g.addColorStop(1, "#d9a000");
  ctx.fillStyle = g;
  ctx.font = "bold 128px Georgia, serif";
  if ("letterSpacing" in ctx) ctx.letterSpacing = "2px";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 5;
  ctx.fillText("BIRTHDAY", W / 2, 185);
  ctx.shadowColor = "transparent";
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
}

function drawPhoto() {
  const cx = W / 2, cy = 570, r = 270;

  // Gold ring
  const ring = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  ring.addColorStop(0, "#fff3a3");
  ring.addColorStop(0.5, "#d9a000");
  ring.addColorStop(1, "#fff3a3");
  ctx.beginPath();
  ctx.arc(cx, cy, r + 22, 0, Math.PI * 2);
  ctx.fillStyle = ring;
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 30;
  ctx.fill();
  ctx.shadowColor = "transparent";

  // Clip to a circle, then draw the photo inside
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  if (photo) {
    const d = r * 2;
    const zoom = Number($("zoom").value) / 100;
    const scale = Math.max(d / photo.width, d / photo.height) * zoom;
    const dw = photo.width * scale;
    const dh = photo.height * scale;
    const mx = (Number($("moveX").value) / 100) * ((dw - d) / 2);
    const my = (Number($("moveY").value) / 100) * ((dh - d) / 2);
    ctx.drawImage(photo, cx - dw / 2 + mx, cy - dh / 2 + my, dw, dh);
  } else {
    ctx.fillStyle = "#4a0000";
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = "#f4c542";
    ctx.font = "bold 44px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("Add photo", cx, cy);
  }
  ctx.restore();

  // Thin inner ring
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#fff8dc";
  ctx.stroke();
}

function drawName(name) {
  const y = 975;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Shrink the font until the name fits
  let size = 84;
  ctx.font = `bold ${size}px Georgia, serif`;
  while (ctx.measureText(name).width > 780 && size > 30) {
    size -= 2;
    ctx.font = `bold ${size}px Georgia, serif`;
  }

  const pw = Math.min(ctx.measureText(name).width + 110, W - 80);
  const ph = 120;

  roundedRect(W / 2 - pw / 2, y - ph / 2, pw, ph, 28);
  const g = ctx.createLinearGradient(0, y - ph / 2, 0, y + ph / 2);
  g.addColorStop(0, "#a60000");
  g.addColorStop(1, "#5c0000");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#f4c542";
  ctx.stroke();

  ctx.fillStyle = "#ffe58a";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;
  ctx.fillText(name, W / 2, y + 4);
  ctx.shadowColor = "transparent";
}

function drawWish() {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff3d6";
  ctx.font = "italic 36px Georgia, serif";
  ctx.fillText("Wishing you happiness, good health", W / 2, 1090);
  ctx.fillText("and success in every step of life!", W / 2, 1140);
}

function drawFooter() {
  const top = 1210;
  ctx.fillStyle = "rgba(30, 0, 0, 0.75)";
  ctx.fillRect(0, top, W, H - top);
  ctx.fillStyle = "#f4c542";
  ctx.fillRect(0, top, W, 5);

  let textX = W / 2;
  if (logo) {
    const s = 96, lx = 150, ly = top + 70;
    ctx.save();
    ctx.beginPath();
    ctx.arc(lx, ly, s / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#fff";
    ctx.fillRect(lx - s / 2, ly - s / 2, s, s);
    ctx.drawImage(logo, lx - s / 2, ly - s / 2, s, s);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(lx, ly, s / 2, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#f4c542";
    ctx.stroke();
    textX = 630;
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffe58a";
  ctx.font = "bold 36px Georgia, serif";
  ctx.fillText("AIGIRI GELEYARA BALAGA", textX, top + 52);
  ctx.fillStyle = "#fff3d6";
  ctx.font = "26px Georgia, serif";
  ctx.fillText("Mysuru  •  Friendship • Culture • Service", textX, top + 98);
}

// ---- 7. Main function: redraws the whole poster ----
function drawPoster() {
  const name = $("name").value.trim() || "Your Name";
  ctx.clearRect(0, 0, W, H);
  drawBackground();
  drawTitle();
  drawPhoto();
  drawName(name);
  drawWish();
  drawFooter();

  $("wishText").textContent =
    `🎂 Happy Birthday, ${name}! Team AIGIRI GELEYARA BALAGA, Mysuru wishes you a wonderful birthday filled with happiness, good health, success and beautiful memories! ❤️`;
}

// ---- 8. Events: do something when the user acts ----
$("photo").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  try {
    photo = await loadImage(url);
    $("uploadText").textContent = "✅ " + file.name;
    $("adjust").hidden = false;
    drawPoster();
  } catch {
    alert("Could not read this image. Please try another photo.");
  }
});

["name", "zoom", "moveX", "moveY"].forEach((id) =>
  $(id).addEventListener("input", drawPoster)
);

// Make sure photo and name are filled
function ready() {
  if (!photo) { alert("Please choose a photo first."); return false; }
  if (!$("name").value.trim()) { alert("Please enter the name first."); return false; }
  return true;
}

// Turn the canvas into a PNG file
function getBlob() {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

$("download").addEventListener("click", async () => {
  if (!ready()) return;
  const blob = await getBlob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "AIGIRI-Birthday-Poster.png";
  a.click();
});

$("share").addEventListener("click", async () => {
  if (!ready()) return;
  const blob = await getBlob();
  const file = new File([blob], "AIGIRI-Birthday-Poster.png", { type: "image/png" });
  try {
    await navigator.share({ files: [file], text: $("wishText").textContent });
  } catch { /* user closed the share sheet */ }
});

$("copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("wishText").textContent);
    $("copy").textContent = "✅ Copied!";
    setTimeout(() => ($("copy").textContent = "📋 Copy wish message"), 1500);
  } catch {
    alert("Could not copy. Please select the text and copy manually.");
  }
});

// Show Share button only where the phone supports sharing files
if (navigator.canShare && navigator.canShare({ files: [new File([""], "a.png", { type: "image/png" })] })) {
  $("share").hidden = false;
}

// ---- 9. Start ----
drawPoster(); // show the empty poster immediately
loadImage(LOGO_URL, true)
  .then((img) => { logo = img; drawPoster(); })
  .catch(() => { /* poster still works without the logo */ });
