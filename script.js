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

// shrink text until it fits the given width
function fitFont(text, size, maxW, family, weight = "bold", style = "") {
  do {
    ctx.font = `${style} ${weight} ${size}px ${family}`.trim();
    size -= 2;
  } while (ctx.measureText(text).width > maxW && size > 24);
}

const KN_FONT = "'Noto Sans Kannada','Nirmala UI',Tunga,sans-serif";
const EN_FONT = "Georgia, serif";

function drawTitle() {
  const P = T[lang].poster;
  const en = lang === "en";
  const fam = en ? EN_FONT : KN_FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#ffe58a";
  if ("letterSpacing" in ctx) ctx.letterSpacing = en ? "10px" : "0px";
  fitFont(P.top, 40, 800, fam);
  ctx.fillText(P.top, W / 2, 95);

  const g = ctx.createLinearGradient(0, 120, 0, 230);
  g.addColorStop(0, "#fff3a3");
  g.addColorStop(1, "#d9a000");
  ctx.fillStyle = g;
  if ("letterSpacing" in ctx) ctx.letterSpacing = en ? "2px" : "0px";
  fitFont(P.big, en ? 128 : 112, 940, fam);
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 5;
  ctx.fillText(P.big, W / 2, 185);
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
  const P = T[lang].poster;
  const fam = lang === "en" ? EN_FONT : KN_FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#f4c542";                       // line 1: Team AIGIRI ... wishes you
  fitFont(P.team, 34, 960, fam);
  ctx.fillText(P.team, W / 2, 1078);

  ctx.fillStyle = "#fff3d6";                       // lines 2 and 3
  fitFont(P.l2, 33, 960, fam, "normal", lang === "en" ? "italic" : "");
  ctx.fillText(P.l2, W / 2, 1123);
  fitFont(P.l3, 33, 960, fam, "normal", lang === "en" ? "italic" : "");
  ctx.fillText(P.l3, W / 2, 1165);
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
  ctx.fillText(T[lang].poster.foot, tx, top + 130);
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

// ---------- language (Kannada / English) ----------
const T = {
  kn: {
    title: "🎂 ಹುಟ್ಟುಹಬ್ಬದ ಪೋಸ್ಟರ್ ಮೇಕರ್",
    fmt: "JPG, PNG ಅಥವಾ WEBP",
    upload: "ಹುಟ್ಟುಹಬ್ಬದ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    ph: "ಹೆಸರು ನಮೂದಿಸಿ",
    make: "✨ ಪೋಸ್ಟರ್ ಮಾಡಿ →",
    note: "🔒 ನಿಮ್ಮ ಫೋಟೋ ನಿಮ್ಮ ಫೋನ್‌ನಲ್ಲೇ ಇರುತ್ತದೆ",
    yours: "🎉 ನಿಮ್ಮ ಹುಟ್ಟುಹಬ್ಬದ ಪೋಸ್ಟರ್",
    adjust: "🎯 ಫೋಟೋ ಹೊಂದಿಸಿ (ಜೂಮ್ / ಸರಿಸಿ)",
    zoom: "ಜೂಮ್", lr: "ಎಡ / ಬಲ", ud: "ಮೇಲೆ / ಕೆಳಗೆ",
    download: "⬇ ಪೋಸ್ಟರ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    share: "📤 ಪೋಸ್ಟರ್ ಹಂಚಿಕೊಳ್ಳಿ",
    motto: "ಸ್ನೇಹ • ಸಂಸ್ಕೃತಿ • ಸೇವೆ",
    loc: "📍 ಮೈಸೂರು, ಕರ್ನಾಟಕ",
    msgTitle: (n) => `🎂 ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು, ${n}!`,
    msg: "ಐಗಿರಿ ಗೆಳೆಯರ ಬಳಗ, ಮೈಸೂರು ತಂಡದ ವತಿಯಿಂದ<br>ನಿಮಗೆ ಸಂತೋಷ, ಆರೋಗ್ಯ, ಯಶಸ್ಸು ಮತ್ತು<br>ಸುಂದರ ನೆನಪುಗಳಿಂದ ತುಂಬಿದ<br>ಹುಟ್ಟುಹಬ್ಬದ ಹಾರ್ದಿಕ ಶುಭಾಶಯಗಳು! ❤️",
    needPhoto: "ದಯವಿಟ್ಟು ಮೊದಲು ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    needName: "ದಯವಿಟ್ಟು ಹೆಸರು ನಮೂದಿಸಿ.",
    badImg: "ಈ ಫೋಟೋ ಓದಲಾಗಲಿಲ್ಲ. ಬೇರೆ ಫೋಟೋ ಪ್ರಯತ್ನಿಸಿ.",
    poster: {
      top: "✦ ಹುಟ್ಟುಹಬ್ಬದ ✦", big: "ಶುಭಾಶಯಗಳು",
      team: "ಐಗಿರಿ ಗೆಳೆಯರ ಬಳಗ, ಮೈಸೂರು ತಂಡದಿಂದ ಶುಭಾಶಯಗಳು",
      l2: "ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಸಂತೋಷ, ಆರೋಗ್ಯ,",
      l3: "ಯಶಸ್ಸು ಮತ್ತು ಸುಂದರ ನೆನಪುಗಳು ತುಂಬಿರಲಿ!",
      foot: "ಮೈಸೂರು  •  ಸ್ನೇಹ • ಸಂಸ್ಕೃತಿ • ಸೇವೆ",
    },
  },
  en: {
    title: "🎂 Birthday Poster Maker",
    fmt: "JPG, PNG or WEBP",
    upload: "Upload Birthday Photo",
    ph: "Enter Name",
    make: "✨ MAKE POSTER →",
    note: "🔒 Your photo stays in your phone",
    yours: "🎉 Your Birthday Poster",
    adjust: "🎯 Adjust photo (zoom / move)",
    zoom: "Zoom", lr: "Left / Right", ud: "Up / Down",
    download: "⬇ DOWNLOAD POSTER",
    share: "📤 SHARE POSTER",
    motto: "Friendship • Culture • Service",
    loc: "📍 Mysuru, Karnataka",
    msgTitle: (n) => `🎂 Happy Birthday, ${n}!`,
    msg: "Team AIGIRI GELEYARA BALAGA,<br>Mysuru wishes you a wonderful<br>birthday filled with happiness,<br>good health, success and<br>beautiful memories! ❤️",
    needPhoto: "Please upload the birthday photo first.",
    needName: "Please enter the name.",
    badImg: "Could not read this image. Please try another photo.",
    poster: {
      top: "✦ HAPPY ✦", big: "BIRTHDAY",
      team: "Team AIGIRI GELEYARA BALAGA, Mysuru wishes you",
      l2: "a wonderful birthday filled with happiness,",
      l3: "good health, success and beautiful memories!",
      foot: "Mysuru  •  Friendship • Culture • Service",
    },
  },
};

let lang = "kn";                                   // default language
try { lang = localStorage.getItem("lang") || "kn"; } catch {}
let fileName = "";

function updateMsgTitle() {
  $("msgTitle").textContent = T[lang].msgTitle($("name").value.trim());
}

// Put the chosen language on every piece of text (page + poster)
function applyLang() {
  const t = T[lang];
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t[el.dataset.i18n]));
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => (el.placeholder = t[el.dataset.i18nPh]));
  $("msgText").innerHTML = t.msg;
  $("uploadText").textContent = fileName ? "✅ " + fileName : t.upload;
  document.querySelectorAll("[data-lang]").forEach((b) => b.classList.toggle("on", b.dataset.lang === lang));
  if (created) { updateMsgTitle(); drawPoster(); }
}

document.querySelectorAll("[data-lang]").forEach((b) =>
  b.addEventListener("click", () => {
    lang = b.dataset.lang;
    try { localStorage.setItem("lang", lang); } catch {}
    applyLang();
  })
);

// ---------- events ----------
$("photo").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    photo = await loadImage(URL.createObjectURL(file));
    fileName = file.name;
    $("uploadText").textContent = "✅ " + fileName;
    document.querySelector(".upload").classList.add("done");
    if (created) drawPoster();
  } catch {
    alert(T[lang].badImg);
  }
});

// MAKE POSTER button
$("makePoster").addEventListener("click", () => {
  if (!photo) { alert(T[lang].needPhoto); return; }
  if (!$("name").value.trim()) { alert(T[lang].needName); return; }

  created = true;
  updateMsgTitle();
  drawPoster();
  $("result").hidden = false;
  $("result").scrollIntoView({ behavior: "smooth" });
});

// redraw live while typing / adjusting (only after poster is created)
["name", "zoom", "moveX", "moveY"].forEach((id) =>
  $(id).addEventListener("input", () => {
    if (!created) return;
    updateMsgTitle();
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
      text: `${T[lang].msgTitle($("name").value.trim())} - Team AIGIRI GELEYARA BALAGA, Mysuru ❤️`,
    });
  } catch { /* user closed share sheet */ }
});

if (navigator.canShare && navigator.canShare({ files: [new File([""], "a.png", { type: "image/png" })] })) {
  $("share").hidden = false;
}

// ---------- start ----------
applyLang();
loadImage(LOGO_URL, true)
  .then((img) => { logo = img; if (created) drawPoster(); })
  .catch(() => { /* poster still works without the logo */ });
