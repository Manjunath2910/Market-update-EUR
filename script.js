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


/* HIDE BUTTONS */

downloadBtn.style.visibility = "hidden";

if (instagramBtn) {
    instagramBtn.style.visibility = "hidden";
}

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
if(download){
setTimeout(()=>{

const storyCanvas =
document.createElement("canvas");

storyCanvas.width = 1080;
storyCanvas.height = 1920;

const sctx =
storyCanvas.getContext("2d");


/* REMOVE BLACK BACKGROUND */

sctx.clearRect(0,0,1080,1920);


/* FIT FULL IMAGE */

const storyScale =
Math.min(
1080 / canvas.width,
1920 / canvas.height
);

const storyWidth =
canvas.width * storyScale;

const storyHeight =
canvas.height * storyScale;

const storyX =
(1080 - storyWidth)/2;

const storyY =
(1920 - storyHeight)/2;


/* DRAW IMAGE */

sctx.drawImage(
canvas,
storyX,
storyY,
storyWidth,
storyHeight
);


/* DOWNLOAD STORY */

const storyLink =
document.createElement("a");

storyLink.download =
"pandamoney-story.png";

storyLink.href =
storyCanvas.toDataURL("image/png");

document.body.appendChild(storyLink);

storyLink.click();

document.body.removeChild(storyLink);

},1200);

}
return postCanvas;
}




/* START */

window.onload = () => {

loadRates();

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
        const postCanvas = await downloadImage(false);

        alert("5. Image Generated");

        alert("6. Uploading to Cloudinary");

        // Upload the SAME canvas
        const imageUrl = await uploadToCloudinary(postCanvas);

        alert("7. Cloudinary Upload Success");

        console.log("Cloudinary URL:", imageUrl);

        alert("8. Sending request to Express Server");

        const response = await fetch("http://localhost:3000/publish", {

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
        


async function uploadToCloudinary(postCanvas) {

    const blob = await new Promise(resolve =>
        postCanvas.toBlob(resolve, "image/png", 1)
    );

    const formData = new FormData();

    formData.append(
        "image",
        blob,
        "market-update.png"
    );

    const response = await fetch("http://localhost:3000/upload", {

        method: "POST",

        body: formData

    });

    const data = await response.json();

    if (!data.success) {

        throw new Error("Cloudinary upload failed");

    }

    return data.imageUrl;

}