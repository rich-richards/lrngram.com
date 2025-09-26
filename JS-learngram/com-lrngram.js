let name1 = "";
let name2 = "";
let country2 = "";
let country1 = "";
let age1 = "";
let age2 = "";

const container4 = document.querySelector(".container-4");
const container5 = document.querySelector(".container-5");
const container6 = document.querySelector(".container-6");
const container7 = document.querySelector(".container-7");
const container8 = document.querySelector(".container-8");
const container9 = document.querySelector(".container-9");
const container10 = document.querySelector(".container-10");
const container11 = document.querySelector(".container-11");
const container12 = document.querySelector(".container-12");






const dataLesson = [
  "Hi, how are you?",
  "Hey, i am fine!",
  "What is your name?",
  `My name is ${name1}.`,
  `Good, my name is ${name2}.`,
  "Where are are you from?",
  `I am from ${country2}.`,
  `Nice, i am from ${country1}.`,
  `I am ${age2} years old, how old are you?`,
  `I am ${age1} years old.`,
  `Nice to meet you, ${name1}.`,
  `Me too, ${name2}.`
];




function nameSend1() {
  const name_put = document.querySelector(".namePut").value;
  const jsput_infos = document.querySelector(".jsPutInfos");
  
  name1 = name_put;
 
  jsput_infos.textContent = name1 + " was added!";
  
  container4.innerHTML = `
    <div class="container-4"><p class="per-2"><span class="p-2">You: </span>My name is <span class='added-element'>${name1}</span>.</p></div>
 `;
  container11.innerHTML = `
    <div class="container-11"><p class="per-1">Nice to meet you <span class='added-element'>${name1}</span>.<span class="p-1"> :Someone</span></p></div>
  `;
}


function nameSend2() {
  const name_putFriend = document.querySelector(".namePutFriend").value;
  const jsput_infos2 = document.querySelector(".jsPutInfos2");
  
  name2 = name_putFriend;
 
  jsput_infos2.textContent = name2 + " was added!";
  
  container5.innerHTML = `
    <div class="container-5"><p class="per-1">Good, my name is <span class='added-element'>${name2}</span>.<span class="p-1"> :Someone</span></p></div>    
 `;
  container12.innerHTML = `
    <div class="container-12"><p class="per-2"><span class="p-2">You: </span>Me too, <span class='added-element'>${name2}</span>.</p></div>
  `;
}

function countrySend2() {
  const country_putFriend = document.querySelector(".countryPutFriend").value;
  const jsput_infos4 = document.querySelector(".jsPutInfos4");
  

  country2 = country_putFriend;

  jsput_infos4.textContent = country2 + " was added!";
  container7.innerHTML = `
    <div class="container-7"><p class="per-1">I am from <span class='added-element'>${country2}</span>.<span class="p-1"> :Someone</span></p></div>
  `;
}



function countrySend1() {
  const country_put = document.querySelector(".countryPut").value;
  const jsput_infos3 = document.querySelector(".jsPutInfos3");
  

  country1 = country_put;

  jsput_infos3.textContent = country1 + " was added!";
  container8.innerHTML = `
    <div class="container-8"><p class="per-2"><span class="p-2">You: </span>Nice, i am from <span class='added-element'>${country1}</span>.</p></div>
  `;
}


function ageSend2() {
  const age_putFriend = document.querySelector(".agePutFriend").value;  
  const jsput_infos6 = document.querySelector(".jsPutInfos6");
  

  age2 = age_putFriend;

  jsput_infos6.textContent = age2 + " was added!";
  container9.innerHTML = `
    <div class="container-9"><p class="per-1">I am <span class='added-element'>${age2}</span> years old, how old are you?<span class="p-1"> :Someone</span></p></div>
  `;
}



function ageSend1() {
  const age_put = document.querySelector(".agePut").value;  
  const jsput_infos5 = document.querySelector(".jsPutInfos5");
  
  age1 = age_put;

  jsput_infos5.textContent = age1 + " was added!";
  container10.innerHTML = `
    <div class="container-10"><p class="per-2"><span class="p-2">You: </span>I am <span class='added-element'>${age1}</span> years old.</p></div>
  `;
}











