const apiKey = "e861da91-0e07-4364-8f77-403c7db89dd8";

let dataLoaded = false;


/* FETCH RATE */

async function getRate(date = null){

let url =
"https://api.wise.com/v1/rates?source=EUR&target=INR";

if(date){
url += `&time=${date}T00:00:00`;
}

const response = await fetch(url,{
headers:{
Authorization:`Bearer ${apiKey}`,
"Content-Type":"application/json"
}
});

if(!response.ok){
throw new Error("API Error");
}

const data = await response.json();

return data[0].rate;

}



/* LOAD RATES */

async function loadRates(){

try{

let history = [];


for(let i=15;i>=0;i--){

const d = new Date();
d.setDate(d.getDate()-i);

const date =
d.toISOString().split("T")[0];

const rate =
await getRate(date);

history.push({date,rate});


}

/* TODAY + YESTERDAY */

const yesterdayRate = history[14].rate;
const todayRate = history[15].rate;

document.getElementById("today").textContent =
`₹${todayRate.toFixed(2)}`;

document.getElementById("yesterday").textContent =
`₹${yesterdayRate.toFixed(2)}`;


/* STATUS */

if(todayRate > yesterdayRate){

document.getElementById("status").innerHTML =
`
<div class="status-icon">↑</div>
EUR HAS <span class="strengthened">STRENGTHENED</span> VS INR
`;

}
else if(todayRate < yesterdayRate){

document.getElementById("status").innerHTML =
`
<div class="status-icon">↓</div>
EUR HAS <span class="weakened">WEAKENED</span> VS INR
`;

}
else{

document.getElementById("status").innerHTML =
`
<div class="status-icon">•</div>
EUR RATE UNCHANGED
`;

}
dataLoaded = true;

}
catch(error){

document.getElementById("status").innerHTML =
`
<div class="status-icon">!</div>
FAILED TO LOAD DATA
`;

console.log(error);

}

}



/* DOWNLOAD BOTH IMAGES */

async function downloadImage(download = true){

if(!dataLoaded){

alert("Wait... market data loading");

return;

}

const card =
document.querySelector(".card");

const downloadBtn =
document.querySelector(".download-btn");

const instagramBtn =
document.querySelector(".instagram-btn");

const storyBtn =
document.querySelector(".story-btn");


/* HIDE BUTTONS */

downloadBtn.style.visibility = "hidden";

if (instagramBtn) {
    instagramBtn.style.visibility = "hidden";
}

if (storyBtn) {
    storyBtn.style.visibility = "hidden";
}

/* Capture at full 1080 (undo any mobile fit-scale during the shot).
   Uses !important because the mobile scale rule is !important. */
card.style.setProperty("transform", "none", "important");

await new Promise(resolve =>
setTimeout(resolve,500)
);

await document.fonts.ready;


/* EXACT CARD SIZE */

const rect =
card.getBoundingClientRect();


/* MAIN CAPTURE */

const canvas =
await html2canvas(card,{

scale:4,

useCORS:true,
allowTaint:true,

backgroundColor:null,

scrollX:0,
scrollY:0,

width:rect.width,
height:rect.height,

windowWidth:rect.width,
windowHeight:rect.height,

x:0,
y:0,

logging:false

});


/* SHOW BUTTON */

downloadBtn.style.visibility = "visible";

if (instagramBtn) {
    instagramBtn.style.visibility = "visible";
}

if (storyBtn) {
    storyBtn.style.visibility = "visible";
}

/* Restore the mobile fit-scale after the capture. */
card.style.removeProperty("transform");
fitCard();



/* =========================
   INSTAGRAM POST 1:1
========================= */

const postCanvas =
document.createElement("canvas");

postCanvas.width = 1080;
postCanvas.height = 1080;

const pctx =
postCanvas.getContext("2d");


/* REMOVE BLACK BORDER */

pctx.clearRect(0,0,1080,1080);


/* FIT FULL IMAGE */

const postScale =
Math.min(
1080 / canvas.width,
1080 / canvas.height
);

const postWidth =
canvas.width * postScale;

const postHeight =
canvas.height * postScale;

const postX =
(1080 - postWidth)/2;

const postY =
(1080 - postHeight)/2;


/* DRAW IMAGE */

pctx.drawImage(
canvas,
postX,
postY,
postWidth,
postHeight
);


/* DOWNLOAD POST */

/* DOWNLOAD POST */

if(download){

    const postLink =
    document.createElement("a");

    postLink.download =
    "pandamoney-post.png";

    postLink.href =
    postCanvas.toDataURL("image/png");

    document.body.appendChild(postLink);

    postLink.click();

    document.body.removeChild(postLink);

}


/* =========================
   STORY 9:16
========================= */
const storyCanvas =
document.createElement("canvas");

storyCanvas.width = 1080;
storyCanvas.height = 1920;

const sctx =
storyCanvas.getContext("2d");


/* Show the FULL card (nothing cropped), fit to the full width, centered.
   Then fill the space above/below by stretching the card's own top and bottom
   edge pixels — so the background blends seamlessly instead of showing bands. */

// Zoom in a little (>1) so the card fills more of the tall frame and the empty
// top/bottom space is small. 1 = fit width exactly; higher = bigger card, small
// side trim. 1.22 keeps the title/rates fully safe.
const ZOOM = 1.22;
const storyScale = (1080 / canvas.width) * ZOOM;
const cardW = Math.round(canvas.width * storyScale);
const cardH = Math.round(canvas.height * storyScale);
const cardX = Math.round((1080 - cardW) / 2);
const cardY = Math.round((1920 - cardH) / 2);

/* Extend the card's TOP edge upward to fill any small top area */
if (cardY > 0) {
sctx.drawImage(
canvas,
0, 0, canvas.width, 2,             // source: top 2px row of the card
cardX, 0, cardW, cardY + 2         // dest: from top of frame down to the card
);
}

/* Extend the card's BOTTOM edge downward to fill any small bottom area */
if (cardY + cardH < 1920) {
sctx.drawImage(
canvas,
0, canvas.height - 2, canvas.width, 2,                    // source: bottom 2px row
cardX, cardY + cardH - 2, cardW, 1920 - (cardY + cardH) + 2 // dest: below the card
);
}

/* Draw the full card, centered (slight side trim from the zoom) */
sctx.drawImage(
canvas,
cardX, cardY, cardW, cardH
);


/* DOWNLOAD STORY (only when the Download button was used) */

if(download){
const storyLink =
document.createElement("a");

storyLink.download =
"pandamoney-story.png";

storyLink.href =
storyCanvas.toDataURL("image/png");

document.body.appendChild(storyLink);

storyLink.click();

document.body.removeChild(storyLink);
}

/* Post uses the 1:1 canvas; Story uses the 9:16 canvas. */
return { postCanvas, storyCanvas };
}




/* Responsive: scale the fixed-1080 card to the phone width (only on small
   screens). Uses a real numeric scale, which CSS calc() can't produce from vw. */
function fitCard(){
    const card = document.querySelector(".card");
    if(!card) return;
    if(window.innerWidth <= 1120){
        const s = window.innerWidth / 1080;
        card.style.setProperty("transform-origin", "top left", "important");
        card.style.setProperty("transform", `scale(${s})`, "important");
    } else {
        card.style.removeProperty("transform");
        card.style.removeProperty("transform-origin");
    }
}

window.addEventListener("resize", fitCard);
window.addEventListener("orientationchange", fitCard);


/* START */

window.onload = () => {

loadRates();
fitCard();

};


async function postToInstagram() {

    alert("1. Button Clicked");

    try {

        if (!dataLoaded) {
            alert("2. Market data not loaded");
            return;
        }

        alert("3. Market data loaded");

        alert("4. Generating image using Download workflow");

        // Generate exactly the same image as the Download button
        const { postCanvas } = await downloadImage(false);

        alert("5. Image Generated");

        alert("6. Uploading to Cloudinary");

        // Upload the SAME canvas
        const imageUrl = await uploadToCloudinary(postCanvas);

        alert("7. Cloudinary Upload Success");

        console.log("Cloudinary URL:", imageUrl);

        alert("8. Sending request to Express Server");

        const response = await fetch("/api/publish", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                imageUrl,

               caption: `💶 EUR Market Update

📅 ${new Date().toLocaleDateString()}

Today's EUR exchange rate against INR.

📈 Stay updated with PandaMoney for daily market insights.

#EUR #INR #Forex #ExchangeRate #PandaMoney #Finance`

            })

        });

        console.log("/publish status:", response.status);

        const result = await response.json();

        console.log(result);

        alert("9. Instagram API Returned");

        if (result.success) {

            alert("✅ Instagram Posted Successfully!");

        } else {

            alert("❌ Publish Failed");

            alert(JSON.stringify(result, null, 2));

        }

    } catch (err) {

        console.error(err);

        alert("ERROR: " + err.message);

    }

}
        


// Render a proper 9:16 STORY image: clone the card, stretch it to a portrait
// frame, and let the content spread to fill it (full content, no crop, no bands).
async function renderStoryCanvas() {
    const card = document.querySelector(".card");
    const clone = card.cloneNode(true);

    // Remove the buttons/script from the clone so they aren't in the image.
    clone.querySelectorAll(".download-btn, .instagram-btn, .story-btn, script")
        .forEach(el => el.remove());

    clone.classList.add("story-capture");

    // Force the portrait size with inline !important — beats the card's own
    // "aspect-ratio:1/1" and "height:1080px !important" rules that were keeping
    // it square (which left the white area at the bottom).
    clone.style.setProperty("position", "fixed", "important");
    clone.style.setProperty("top", "0", "important");
    clone.style.setProperty("left", "0", "important");
    clone.style.setProperty("z-index", "-1", "important");
    clone.style.setProperty("width", "1080px", "important");
    clone.style.setProperty("height", "1920px", "important");
    clone.style.setProperty("min-height", "1920px", "important");
    clone.style.setProperty("max-height", "1920px", "important");
    clone.style.setProperty("aspect-ratio", "auto", "important");
    clone.style.setProperty("justify-content", "space-evenly", "important");
    clone.style.setProperty("background-color", "#02110f", "important");
    // Undo the mobile fit-scale the card may carry, so the story renders full size.
    clone.style.setProperty("transform", "none", "important");
    clone.style.setProperty("transform-origin", "top left", "important");

    document.body.appendChild(clone);

    await document.fonts.ready;
    await new Promise(r => setTimeout(r, 350));

    const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#02110f",
        width: 1080,
        height: 1920,
        windowWidth: 1080,
        windowHeight: 1920,
        logging: false
    });

    document.body.removeChild(clone);
    return canvas;
}


async function postStoryToInstagram() {
    try {
        if (!dataLoaded) {
            alert("Market data still loading, please wait.");
            return;
        }
        // Build the proper 9:16 story image (portrait layout, full content).
        const storyCanvas = await renderStoryCanvas();
        const imageUrl = await uploadToCloudinary(storyCanvas);
        // Publish as an Instagram STORY.
        const response = await fetch("/api/publish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl, mediaType: "story" })
        });
        const result = await response.json();
        console.log(result);
        if (result.success) {
            alert("✅ Instagram Story Posted Successfully!");
        } else {
            alert("❌ Story Publish Failed");
            alert(JSON.stringify(result, null, 2));
        }
    } catch (err) {
        console.error(err);
        alert("ERROR: " + err.message);
    }
}


async function uploadToCloudinary(canvas) {

    // Send the image as a base64 data URL (JSON) so it works as a serverless
    // function on Vercel (no multipart parsing needed). JPEG keeps it small.
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

    const response = await fetch("/api/upload", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ image: dataUrl })

    });

    const data = await response.json();

    if (!data.success) {

        throw new Error("Cloudinary upload failed");

    }

    return data.imageUrl;

}