const photoInput = document.getElementById("photo");
const nameInput = document.getElementById("name");
const makePosterButton = document.getElementById("makePoster");
const downloadButton = document.getElementById("downloadPoster");

const canvas = document.getElementById("posterCanvas");
const ctx = canvas.getContext("2d");

const previewSection = document.getElementById("previewSection");

const TEMPLATE_PATH = "assets/template.png";


// Hide preview until a poster is created
previewSection.style.display = "none";


// Load an image
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Image could not be loaded."));

        img.src = src;
    });
}


// Crop an image so it fills the target area
function drawCoverImage(img, x, y, width, height) {

    const imageRatio = img.width / img.height;
    const areaRatio = width / height;

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
        x,
        y,
        width,
        height
    );
}


// Create the poster
makePosterButton.addEventListener("click", async () => {

    const file = photoInput.files[0];
    const personName = nameInput.value.trim();

    // Check photo
    if (!file) {
        alert("Please upload the birthday person's photo.");
        return;
    }

    // Check name
    if (!personName) {
        alert("Please enter the birthday person's name.");
        return;
    }

    try {

        makePosterButton.disabled = true;
        makePosterButton.textContent = "CREATING...";

        // Load template
        const template = await loadImage(TEMPLATE_PATH);

        // Load uploaded photo
        const photoURL = URL.createObjectURL(file);
        const photo = await loadImage(photoURL);

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw template first
        ctx.drawImage(
            template,
            0,
            0,
            canvas.width,
            canvas.height
        );


        /*
         * PHOTO AREA
         *
         * Template size:
         * 864 × 1536
         *
         * The large central area is approximately:
         * x = 38
         * y = 430
         * width = 788
         * height = 985
         */

        const photoX = 38;
        const photoY = 430;
        const photoWidth = 788;
        const photoHeight = 985;


        // Create clipping area
        ctx.save();

        ctx.beginPath();

        ctx.rect(
            photoX,
            photoY,
            photoWidth,
            photoHeight
        );

        ctx.clip();


        // Draw uploaded photo
        drawCoverImage(
            photo,
            photoX,
            photoY,
            photoWidth,
            photoHeight
        );

        ctx.restore();


        /*
         * NAME
         */

        ctx.save();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Name position
        const nameX = canvas.width / 2;
        const nameY = 1370;

        // Font size
        let fontSize = 70;

        // Reduce font size for long names
        if (personName.length > 18) {
            fontSize = 55;
        }

        if (personName.length > 25) {
            fontSize = 45;
        }

        ctx.font = `bold ${fontSize}px Georgia, serif`;

        // Shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Gold name
        ctx.fillStyle = "#f4c542";

        ctx.fillText(
            personName,
            nameX,
            nameY
        );

        ctx.restore();


        // Show preview
        previewSection.style.display = "block";

        // Show download button
        downloadButton.style.display = "block";

        // Scroll to poster
        previewSection.scrollIntoView({
            behavior: "smooth"
        });


        // Release uploaded image
        URL.revokeObjectURL(photoURL);


    } catch (error) {

        console.error(error);

        alert(
            "Something went wrong while creating the poster."
        );

    } finally {

        makePosterButton.disabled = false;
        makePosterButton.textContent = "MAKE POSTER";
    }
});


// Download poster
downloadButton.addEventListener("click", () => {

    const link = document.createElement("a");

    link.download = "AIGIRI-Birthday-Poster.png";

    link.href = canvas.toDataURL(
        "image/png",
        1.0
    );

    link.click();
});
