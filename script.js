// =====================================================
// AIGIRI Birthday Poster Maker  (v2)
// The poster is DRAWN BY CODE on a <canvas> - no template file needed.
// =====================================================

const $ = (id) => document.getElementById(id);   // shortcut: find element by id

const canvas = $("poster");
const ctx = canvas.getContext("2d");              // ctx = our paintbrush
const W = canvas.width;                           // 1080
const H = canvas.height;                          // 1350

const LOGO_URL = "https://koushil24.github.io/aigiri-geleyara-balaga/images/logo.png";

let photo = null;   // uploaded picture
let logo = null;    // organisation logo
let created = false; // becomes true after "MAKE POSTER" is clicked

// ---------- helpers ----------
function loadImage(src, cors) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (cors) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function seededRandom(seed) {          // same confetti every time
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

// ---------- poster parts ----------
function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#5c0000");
  g.addColorStop(0.5, "#8f0000");
  g.addColorStop(1, "#3d0000");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2, cy = 570, rays = 28;       // golden rays
  for (let i = 0; i < rays; i += 2) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, 1100, (i / rays) * Math.PI * 2, ((i + 1) / rays) * Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "rgba(244,197,66,0.07)";
    ctx.fill();
  }

  const rand = seededRandom(7);                // confetti
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

  ctx.save();                                   // clip to circle
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  if (photo) {
    const d = r * 2;
    const scale = Math.max(d / photo.width, d / photo.height) * (Number($("zoom").value) / 100);
    const dw = photo.width * scale, dh = photo.height * scale;
    const mx = (Number($("moveX").value) / 100) * ((dw - d) / 2);
    const my = (Number($("moveY").value) / 100) * ((dh - d) / 2);
    ctx.drawImage(photo, cx - dw / 2 + mx, cy - dh / 2 + my, dw, dh);
  }
  ctx.restore();

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
  let size = 84;
  ctx.font = `bold ${size}px Georgia, serif`;
  while (ctx.measureText(name).width > 780 && size > 30) {   // shrink to fit
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
  ctx.fillText("Wishing you happiness, good health", W / 2, 1085);
  ctx.fillText("and success in every step of life!", W / 2, 1135);
}

function drawFooter() {
  const top = 1195;
  ctx.fillStyle = "rgba(30,0,0,0.78)";
  ctx.fillRect(0, top, W, H - top);
  ctx.fillStyle = "#f4c542";
  ctx.fillRect(0, top, W, 5);

  let tx = W / 2;
  if (logo) {
    const s = 110, lx = 140, ly = top + 78;
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
    tx = 620;
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffe58a";
  ctx.font = "bold 40px 'Noto Sans Kannada', sans-serif";
  ctx.fillText("ಐಗಿರಿ ಗೆಳೆಯರ ಬಳಗ", tx, top + 42);
  ctx.font = "bold 30px Georgia, serif";
  ctx.fillText("AIGIRI GELEYARA BALAGA", tx, top + 92);
  ctx.fillStyle = "#fff3d6";
  ctx.font = "24px Georgia, serif";
  ctx.fillText("Mysuru  •  Friendship • Culture • Service", tx, top + 130);
}

function drawPoster() {
  const name = $("name").value.trim();
  ctx.clearRect(0, 0, W, H);
  drawBackground();
  drawTitle();
  drawPhoto();
  drawName(name);
  drawWish();
  drawFooter();
}

// ---------- events ----------
$("photo").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    photo = await loadImage(URL.createObjectURL(file));
    $("uploadText").textContent = "✅ " + file.name;
    document.querySelector(".upload").classList.add("done");
    if (created) drawPoster();
  } catch {
    alert("Could not read this image. Please try another photo.");
  }
});

// MAKE POSTER button
$("makePoster").addEventListener("click", () => {
  const name = $("name").value.trim();
  if (!photo) { alert("Please upload the birthday photo first."); return; }
  if (!name) { alert("Please enter the name."); return; }

  created = true;
  $("msgTitle").textContent = `🎂 Happy Birthday, ${name}!`;
  drawPoster();
  $("result").hidden = false;
  $("result").scrollIntoView({ behavior: "smooth" });
});

// redraw live while adjusting (only after poster is created)
["name", "zoom", "moveX", "moveY"].forEach((id) =>
  $(id).addEventListener("input", () => {
    if (!created) return;
    $("msgTitle").textContent = `🎂 Happy Birthday, ${$("name").value.trim() || ""}!`;
    drawPoster();
  })
);

const getBlob = () => new Promise((resolve) => canvas.toBlob(resolve, "image/png"));

$("download").addEventListener("click", async () => {
  const blob = await getBlob();
  if (!blob) { alert("Could not save the poster. Please try again."); return; }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Birthday-${$("name").value.trim().replace(/\s+/g, "-")}.png`;
  a.click();
});

$("share").addEventListener("click", async () => {
  const blob = await getBlob();
  const file = new File([blob], "AIGIRI-Birthday-Poster.png", { type: "image/png" });
  try {
    await navigator.share({
      files: [file],
      text: `🎂 Happy Birthday, ${$("name").value.trim()}! - Team AIGIRI GELEYARA BALAGA, Mysuru ❤️`,
    });
  } catch { /* user closed share sheet */ }
});

if (navigator.canShare && navigator.canShare({ files: [new File([""], "a.png", { type: "image/png" })] })) {
  $("share").hidden = false;
}

// ---------- start ----------
loadImage(LOGO_URL, true)
  .then((img) => { logo = img; if (created) drawPoster(); })
  .catch(() => { /* poster still works without the logo */ });
