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

let historyHTML = `
<div class="history-title">
PREVIOUS DATA
</div>
`;

for(let i=15;i>=0;i--){

const d = new Date();

d.setDate(d.getDate()-i);

const date =
d.toISOString().split("T")[0];

const rate =
await getRate(date);

history.push({date,rate});

historyHTML += `
<div class="history-item">
<span class="history-date">${date}</span>

<span class="history-rate">
₹${rate.toFixed(2)}
</span>
</div>
`;

}


/* HISTORY */

document.getElementById("historyBox").innerHTML =
historyHTML;


/* TODAY + YESTERDAY */

const yesterdayRate = history[14].rate;
const todayRate = history[15].rate;

document.getElementById("today").innerHTML =
`₹${todayRate.toFixed(2)}`;

document.getElementById("yesterday").innerHTML =
`₹${yesterdayRate.toFixed(2)}`;


/* STATUS */

if(todayRate > yesterdayRate){

document.getElementById("status").innerHTML =
`
<div class="status-icon">↑</div>
EUR HAS STRENGTHENED VS INR
`;

}
else if(todayRate < yesterdayRate){

document.getElementById("status").innerHTML =
`
<div class="status-icon">↓</div>
EUR HAS WEAKENED VS INR
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

async function downloadImage(){

if(!dataLoaded){

alert("Wait... market data loading");

return;

}

const card =
document.querySelector(".card");

const button =
document.querySelector(".download-btn");


/* HIDE BUTTON */

button.style.visibility = "hidden";

await new Promise(resolve =>
setTimeout(resolve,500)
);


/* EXACT SCREEN CAPTURE */

const canvas =
await html2canvas(card,{

scale:4,

useCORS:true,

allowTaint:true,

backgroundColor:"#000",

scrollX:0,
scrollY:0,

logging:false

});


/* SHOW BUTTON AGAIN */

button.style.visibility = "visible";



/* =================================
   INSTAGRAM POST 1:1
================================= */

const postCanvas =
document.createElement("canvas");

postCanvas.width = 1080;
postCanvas.height = 1080;

const pctx =
postCanvas.getContext("2d");

pctx.fillStyle = "#000";
pctx.fillRect(0,0,1080,1080);


/* FIT FULL IMAGE */

const postScale =
Math.min(
1000 / canvas.width,
1000 / canvas.height
);

const pw =
canvas.width * postScale;

const ph =
canvas.height * postScale;

const px =
(1080 - pw)/2;

const py =
(1080 - ph)/2;

pctx.drawImage(
canvas,
px,
py,
pw,
ph
);


/* DOWNLOAD POST */

const postLink =
document.createElement("a");

postLink.download =
"pandamoney-post.png";

postLink.href =
postCanvas.toDataURL("image/png",1);

document.body.appendChild(postLink);

postLink.click();

document.body.removeChild(postLink);



/* =================================
   STORY 9:16
================================= */

setTimeout(()=>{

const storyCanvas =
document.createElement("canvas");

storyCanvas.width = 1080;
storyCanvas.height = 1920;

const sctx =
storyCanvas.getContext("2d");

sctx.fillStyle = "#000";
sctx.fillRect(0,0,1080,1920);


/* FULL IMAGE FIT */

const storyScale =
Math.min(
980 / canvas.width,
1600 / canvas.height
);

const sw =
canvas.width * storyScale;

const sh =
canvas.height * storyScale;

const sx =
(1080 - sw)/2;

const sy =
(1920 - sh)/2;


/* DRAW FULL IMAGE */

sctx.drawImage(
canvas,
sx,
sy,
sw,
sh
);


/* DOWNLOAD STORY */

const storyLink =
document.createElement("a");

storyLink.download =
"pandamoney-story.png";

storyLink.href =
storyCanvas.toDataURL("image/png",1);

document.body.appendChild(storyLink);

storyLink.click();

document.body.removeChild(storyLink);

},1200);

}



/* START */

window.onload = () => {

loadRates();

};