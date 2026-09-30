const photoInput = document.getElementById("photo");
const nameInput = document.getElementById("name");

const makePosterButton =
    document.getElementById("makePoster");

const downloadButton =
    document.getElementById("downloadPoster");

const uploadText =
    document.getElementById("uploadText");

const canvas =
    document.getElementById("posterCanvas");

const ctx =
    canvas.getContext("2d");

const previewSection =
    document.getElementById("previewSection");


const TEMPLATE_PATH = "assets/template.png";


// --------------------------------------------------
// Load image
// --------------------------------------------------

function loadImage(src) {

    return new Promise((resolve, reject) => {

        const img = new Image();

        img.onload = () => resolve(img);

        img.onerror = () =>
            reject(
                new Error("Could not load image.")
            );

        img.src = src;
    });
}


// --------------------------------------------------
// Draw uploaded photo inside the birthday arch
// --------------------------------------------------

function drawPhotoInArch(img) {

    /*
        Template size:

        864 × 1536

        Photo area:

        Top of arch:
        approximately Y = 425

        Bottom of photo:
        approximately Y = 1115

        The bottom hills remain untouched.
    */

    const left = 38;
    const right = 826;

    const top = 425;
    const bottom = 1115;

    const centerX = 432;


    ctx.save();


    // Create the arch-shaped clipping path.

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


    // Calculate cover crop.

    const areaWidth = right - left;
    const areaHeight = bottom - top;

    const imageRatio =
        img.width / img.height;

    const areaRatio =
        areaWidth / areaHeight;

    let sourceWidth;
    let sourceHeight;
    let sourceX;
    let sourceY;


    if (imageRatio > areaRatio) {

        sourceHeight = img.height;

        sourceWidth =
            img.height * areaRatio;

        sourceX =
            (img.width - sourceWidth) / 2;

        sourceY = 0;

    } else {

        sourceWidth = img.width;

        sourceHeight =
            img.width / areaRatio;

        sourceX = 0;

        sourceY =
            (img.height - sourceHeight) / 2;
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

    /*
       The green landscape area is used for the name.
       This keeps the birthday heading completely clear.
    */

    const nameY = 1265;


    ctx.save();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";


    // Name plate

    const maxWidth = 650;

    let fontSize = 64;

    if (name.length > 18) {
        fontSize = 54;
    }

    if (name.length > 25) {
        fontSize = 45;
    }


    ctx.font =
        `bold ${fontSize}px Georgia, serif`;


    // Measure text

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


    // Gold border

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


    // Name

    ctx.shadowColor =
        "rgba(0,0,0,0.5)";

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

        const file =
            photoInput.files[0];

        const personName =
            nameInput.value.trim();


        if (!file) {

            alert(
                "Please upload the birthday person's photo."
            );

            return;
        }


        if (!personName) {

            alert(
                "Please enter the birthday person's name."
            );

            return;
        }


        try {

            makePosterButton.disabled =
                true;

            makePosterButton.innerHTML =
                "✨ CREATING POSTER...";


            // Load template

            const template =
                await loadImage(
                    TEMPLATE_PATH
                );


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


            // 1. Draw template first

            ctx.drawImage(
                template,
                0,
                0,
                canvas.width,
                canvas.height
            );


            /*
               2. Draw ONLY inside the
                  large birthday arch.
            */

            drawPhotoInArch(photo);


            /*
               3. Restore the bottom landscape
                  from the original template.

               This prevents the uploaded photo
               from covering the hills.
            */

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


            // 4. Add person's name

            drawName(personName);


            // Show preview

            previewSection.style.display =
                "block";


            downloadButton.style.display =
                "block";


            // Scroll to result

            previewSection.scrollIntoView({
                behavior: "smooth"
            });


            URL.revokeObjectURL(
                photoURL
            );


        } catch (error) {

            console.error(error);

            alert(
                "Could not create the poster. Please try again."
            );

        } finally {

            makePosterButton.disabled =
                false;

            makePosterButton.innerHTML =
                "<span>✨</span> MAKE POSTER <span>→</span>";
        }
    }
);


// --------------------------------------------------
// File selected
// --------------------------------------------------

photoInput.addEventListener(
    "change",
    () => {

        const file =
            photoInput.files[0];

        if (file) {

            uploadText.textContent =
                file.name;
        }
    }
);


// --------------------------------------------------
// Download
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
