const jsLink = document.querySelector(".js_link");
const redMessage = document.querySelector(".redMessage");





function showLink() {
  jsLink.innerHTML = `
  <div>
  <a href='alphabet.html' class='js_link'>Aphabet</a>,
  <a href='numbers.html' class='js_link'>Numbers</a>,
  <a href='color.html' class='js_link'>Colors</a>,
  <a href='verbs.html' class='js_link'>Verbs</a>,
  <a href='greet&intro.html' class='js_link'>Greetings and introductions</a>,
  <a href='personal-information.html' class='js_link'>Personal information</a>,
  <a href='family.html' class='js_link'>Family</a>
  </div>`;
}


function showNothing() {
  redMessage.textContent = "Games will be available soon.";
}


