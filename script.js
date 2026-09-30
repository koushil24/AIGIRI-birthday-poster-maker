const photoInput = document.getElementById("photo");
const nameInput = document.getElementById("name");

const makePosterButton = document.getElementById("makePoster");
const downloadButton = document.getElementById("downloadPoster");

const uploadText = document.getElementById("uploadText");

const canvas = document.getElementById("posterCanvas");
const ctx = canvas.getContext("2d");

const previewSection = document.getElementById("previewSection");

const birthdayMessage = document.getElementById("birthdayMessage");
const birthdayTitle = document.getElementById("birthdayTitle");
const messageText = document.getElementById("messageText");

const TEMPLATE_PATH = "assets/template.png";


// --------------------------------------------------
// Load image
// --------------------------------------------------

function loadImage(src) {
    return new Promise((resolve, reject) => {

        const img = new Image();

        img.onload = () => resolve(img);

        img.onerror = () =>
            reject(new Error("Could not load image."));

        img.src = src;
    });
}


// --------------------------------------------------
// Draw uploaded photo inside birthday arch
// --------------------------------------------------

function drawPhotoInArch(img) {

    const left = 38;
    const right = 826;

    const top = 425;
    const bottom = 1115;

    const centerX = 432;

    ctx.save();

    ctx.beginPath();

    ctx.moveTo(left, bottom);

    ctx.lineTo(left, 800);

    ctx.bezierCurveTo(
        left,
        585,
        185,
        top,
        centerX,
        top
    );

    ctx.bezierCurveTo(
        679,
        top,
        right,
        585,
        right,
        800
    );

    ctx.lineTo(right, bottom);

    ctx.closePath();

    ctx.clip();


    // Cover crop

    const areaWidth = right - left;
    const areaHeight = bottom - top;

    const imageRatio = img.width / img.height;
    const areaRatio = areaWidth / areaHeight;

    let sourceWidth;
    let sourceHeight;
    let sourceX;
    let sourceY;


    if (imageRatio > areaRatio) {

        sourceHeight = img.height;
        sourceWidth = img.height * areaRatio;

        sourceX = (img.width - sourceWidth) / 2;
        sourceY = 0;

    } else {

        sourceWidth = img.width;
        sourceHeight = img.width / areaRatio;

        sourceX = 0;
        sourceY = (img.height - sourceHeight) / 2;
    }


    ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        left,
        top,
        areaWidth,
        areaHeight
    );

    ctx.restore();
}


// --------------------------------------------------
// Draw person's name
// --------------------------------------------------

function drawName(name) {

    const centerX = canvas.width / 2;
    const nameY = 1265;

    ctx.save();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";


    let fontSize = 64;

    if (name.length > 18) {
        fontSize = 54;
    }

    if (name.length > 25) {
        fontSize = 45;
    }


    ctx.font = `bold ${fontSize}px Georgia, serif`;

    const maxWidth = 650;

    const textWidth =
        Math.min(
            ctx.measureText(name).width,
            maxWidth
        );


    const plateWidth =
        Math.min(
            maxWidth + 60,
            textWidth + 70
        );

    const plateHeight = 88;

    const plateX =
        centerX - plateWidth / 2;

    const plateY =
        nameY - plateHeight / 2;


    // Name plate

    ctx.beginPath();

    ctx.roundRect(
        plateX,
        plateY,
        plateWidth,
        plateHeight,
        18
    );

    ctx.fillStyle = "#7a0000";
    ctx.fill();

    ctx.lineWidth = 5;
    ctx.strokeStyle = "#f4c542";
    ctx.stroke();


    // Name text

    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = "#ffe28a";

    ctx.fillText(
        name,
        centerX,
        nameY
    );

    ctx.restore();
}


// --------------------------------------------------
// Create poster
// --------------------------------------------------

makePosterButton.addEventListener(
    "click",
    async () => {

        const file = photoInput.files[0];
        const personName = nameInput.value.trim();


        // Check photo

        if (!file) {

            alert(
                "Please upload the birthday person's photo."
            );

            return;
        }


        // Check name

        if (!personName) {

            alert(
                "Please enter the birthday person's name."
            );

            return;
        }


        try {

            makePosterButton.disabled = true;

            makePosterButton.innerHTML =
                "✨ CREATING POSTER...";


            // Load template

            const template =
                await loadImage(TEMPLATE_PATH);


            // Load uploaded photo

            const photoURL =
                URL.createObjectURL(file);

            const photo =
                await loadImage(photoURL);


            // Clear canvas

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );


            // Draw template

            ctx.drawImage(
                template,
                0,
                0,
                canvas.width,
                canvas.height
            );


            // Draw photo inside arch

            drawPhotoInArch(photo);


            // Restore bottom landscape

            ctx.drawImage(
                template,
                0,
                1110,
                canvas.width,
                330,
                0,
                1110,
                canvas.width,
                330
            );


            // Add name to poster

            drawName(personName);


            // ------------------------------------------
            // Birthday message BELOW poster
            // ------------------------------------------

            birthdayTitle.textContent =
                `🎂 Happy Birthday, ${personName}!`;

            messageText.textContent =
                "Team AIGIRI GELEYARA BALAGA, Mysuru wishes you a wonderful birthday filled with happiness, good health, success and beautiful memories! ❤️";


            birthdayMessage.style.display = "block";

            previewSection.style.display = "block";

            downloadButton.style.display = "block";


            // Free temporary photo URL

            URL.revokeObjectURL(photoURL);


            // Scroll to result

            previewSection.scrollIntoView({
                behavior: "smooth"
            });


        } catch (error) {

            console.error(error);

            alert(
                "Could not create the poster. Please try again."
            );


        } finally {

            makePosterButton.disabled = false;

            makePosterButton.innerHTML =
                "<span>✨</span> MAKE POSTER <span>→</span>";
        }
    }
);


// --------------------------------------------------
// Photo selected
// --------------------------------------------------

photoInput.addEventListener(
    "change",
    () => {

        const file = photoInput.files[0];

        if (file) {

            uploadText.textContent =
                file.name;
        }
    }
);


// --------------------------------------------------
// Download poster
// --------------------------------------------------

downloadButton.addEventListener(
    "click",
    () => {

        const link =
            document.createElement("a");

        link.download =
            "AIGIRI-Birthday-Poster.png";

        link.href =
            canvas.toDataURL(
                "image/png",
                1.0
            );

        link.click();
    }
);
