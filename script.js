const apiKey = "e861da91-0e07-4364-8f77-403c7db89dd8";

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

history.push({
date,
rate
});

historyHTML += `
<div class="history-item">
<span class="history-date">${date}</span>
<span class="history-rate">
₹${rate.toFixed(2)}
</span>
</div>
`;
}

document.getElementById("historyBox").innerHTML =
historyHTML;

const yesterdayRate = history[14].rate;
const todayRate = history[15].rate;

document.getElementById("today").innerHTML =
`₹${todayRate.toFixed(2)}`;

document.getElementById("yesterday").innerHTML =
`₹${yesterdayRate.toFixed(2)}`;


/* Arrow Logic */

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

console.table(history);

}catch(error){

document.getElementById("status").innerHTML =
`
<div class="status-icon">!</div>
FAILED TO LOAD DATA
`;

console.log(error);

}

}

loadRates();