let state = {
    name: "",
    location: "",
    mode: "",
    answers: [],
    restaurants: [],
    index: 0,
    matches: [],
    currentQ: 0
};

const app = document.getElementById("app");

function render(html) {
    app.innerHTML = html;
}

/* ---------- START ---------- */
function start() {
    state.answers = [];
    state.matches = [];
    state.index = 0;
    state.location = "";

    render(`
        <div class="card">
            <h3>Enter your name</h3>
            <input id="nameInput">
            <button onclick="saveName()">Continue</button>
        </div>
    `);
}

/* ---------- NAME ---------- */
function saveName() {
    const name = document.getElementById("nameInput").value.trim();
    if (!name) return alert("Enter your name");

    state.name = name;
    askLocation();
}

/* ---------- LOCATION ---------- */
function askLocation() {
    render(`
        <div class="card">
            <h3>Enter ZIP or use GPS</h3>
            <input id="zipInput" placeholder="ZIP code">
            <button onclick="useGPS()">Use GPS</button>
            <button onclick="saveLocation()">Continue</button>
        </div>
    `);
}

function saveLocation() {
    const zip = document.getElementById("zipInput").value.trim();
    if (!zip) return alert("Enter ZIP code");

    state.location = zip;
    chooseMode();
}

function useGPS() {
    navigator.geolocation.getCurrentPosition(pos => {
        state.location = `${pos.coords.latitude},${pos.coords.longitude}`;
        alert("Location captured");
        chooseMode(); // FIXED FLOW BREAK
    });
}

/* ---------- MODE ---------- */
function chooseMode() {
    render(`
        <div class="card">
            <h3>Hello ${state.name}</h3>
            <button onclick="startQuestions('single')">Just Me</button>
            <button onclick="startQuestions('couple')">Couple Mode</button>
        </div>
    `);
}

function startQuestions(mode) {
    state.mode = mode;
    state.answers = [];
    askQuestion(0);
}

/* ---------- QUESTIONS ---------- */
const questions = [
    "Mood?",
    "Budget?",
    "Distance?",
    "Cuisine?",
    "Speed?",
    "Vibe?"
];

const options = [
    ["Comfort", "Light", "Fast", "Surprise"],
    ["Cheap", "Moderate", "Doesn't matter"],
    ["Close", "10 min", "Anywhere"],
    ["American", "Italian", "Asian", "Mexican"],
    ["Quick", "Normal", "No rush"],
    ["Casual", "Date night", "Chill", "Trendy"]
];

function askQuestion(i) {
    state.currentQ = i;

    render(`
        <div class="card">
            <h3>${questions[i]}</h3>
            ${options[i].map(opt =>
                `<button onclick="answer('${opt}')">${opt}</button>`
            ).join("")}
        </div>
    `);
}

function answer(opt) {
    state.answers.push(opt);

    if (state.currentQ + 1 < questions.length) {
        askQuestion(state.currentQ + 1);
    } else {
        fetchRestaurants();
    }
}

/* ---------- API ---------- */
async function fetchRestaurants() {
    let lat, lng;

    if (state.location.includes(",")) {
        [lat, lng] = state.location.split(",").map(Number);
    } else {
        lat = 35.2271;
        lng = -80.8431;
    }

    try {
        const res = await fetch(`/api/restaurants?lat=${lat}&lng=${lng}`);
        const data = await res.json();

        state.restaurants = data;
        state.index = 0;
        state.matches = [];

        showSwipe();
    } catch (err) {
        console.error(err);
        alert("Error loading restaurants");
    }
}

/* ---------- SWIPE ---------- */
function showSwipe() {
    if (state.index >= state.restaurants.length) {
        return showResult();
    }

    const r = state.restaurants[state.index];

    render(`
        <div class="card">
            <img src="${r.image}" />
            <h3>${r.name}</h3>
            <p>${r.rating} ⭐</p>

            <button onclick="next('no')">Skip</button>
            <button onclick="next('yes')">Keep</button>
        </div>
    `);
}

function next(choice) {
    if (choice === "yes") {
        state.matches.push(state.restaurants[state.index]);
    }

    state.index++;
    showSwipe();
}

/* ---------- RESULT ---------- */
function showResult() {
    const r = state.matches[0] || state.restaurants[0];

    render(`
        <div class="card">
            <h2>${r.name}</h2>
            <img src="${r.image}" />
            <p>${r.rating} ⭐</p>
            <button onclick="start()">Start Over</button>
        </div>
    `);
}

/* ---------- GLOBAL ---------- */
window.start = start;
window.saveName = saveName;
window.saveLocation = saveLocation;
window.useGPS = useGPS;
window.chooseMode = chooseMode;
window.startQuestions = startQuestions;
window.askQuestion = askQuestion;
window.answer = answer;
window.fetchRestaurants = fetchRestaurants;
window.next = next;
window.showResult = showResult;

start();
