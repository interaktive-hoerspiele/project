let storyData = null;
let currentStory = null;
let currentSceneId = null;
let sceneHistory = [];
let isGoingBack = false;

const screenCover = document.getElementById("screen-cover");
const screenSelect = document.getElementById("screen-select");
const screenStory = document.getElementById("screen-story");

const btnStart = document.getElementById("btn-start");
const btnBackCover = document.getElementById("btn-back-cover");
const btnBackOne = document.getElementById("btn-back-one");

const coverImg = document.getElementById("cover-img");
const bgImg = document.getElementById("bg-img");
const sceneTitle = document.getElementById("scene-title");
const promptText = document.getElementById("prompt-text");
const choicesContainer = document.getElementById("choices");
const storyList = document.getElementById("story-list");
const player = document.getElementById("player");

function showScreen(screen) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  screen.classList.add("active");
}

function stopAudio() {
  player.pause();
  player.currentTime = 0;
  player.onended = null;   // WICHTIG: verhindert Neustart der Szene
}

function loadStoryData() {
  return fetch("story.json")
    .then(res => res.json())
    .then(data => {
      storyData = data;
      coverImg.src = storyData.app.cover_image;
      generateStoryList();
    });
}

function generateStoryList() {
  storyList.innerHTML = "";

  storyData.stories.forEach(story => {
    const btn = document.createElement("button");
    btn.textContent = story.title;
    btn.onclick = () => {
      currentStory = story;
      startStory();
    };
    storyList.appendChild(btn);
  });
}

function startStory() {
  stopAudio();
  sceneHistory = [];
  currentSceneId = currentStory.start_scene;
  loadScene(currentSceneId);
  showScreen(screenStory);
}

function loadScene(sceneId) {
  const scene = currentStory.scenes[sceneId];
  if (!scene) return;

  if (!isGoingBack && currentSceneId) {
    sceneHistory.push(currentSceneId);
  }

  isGoingBack = false;
  currentSceneId = sceneId;

  sceneTitle.textContent = scene.title || "";
  bgImg.src = scene.background || storyData.app.default_background;

  promptText.textContent = "";
  choicesContainer.innerHTML = "";

  stopAudio(); // verhindert Neustart beim Zurückgehen
  player.src = scene.narration || "";
  player.play();

  if (scene.type === "decision") {
    player.onended = () => {
      promptText.textContent = scene.prompt;
      showChoices(scene);
    };
  }

  if (scene.type === "ending") {
    player.onended = () => {
     promptText.textContent = scene.ending_title || "";
      showEnding(scene);
    };
  }
}

function showChoices(scene) {
  choicesContainer.innerHTML = "";

  const btnA = document.createElement("button");
  btnA.textContent = scene.choice_a.label;
  btnA.onclick = () => loadScene(scene.choice_a.next);

  const btnB = document.createElement("button");
  btnB.textContent = scene.choice_b.label;
  btnB.onclick = () => loadScene(scene.choice_b.next);

  choicesContainer.appendChild(btnA);
  choicesContainer.appendChild(btnB);
}

function showEnding(scene) {
  choicesContainer.innerHTML = "";

  if (scene.ending_text) {
    const endText = document.createElement("p");
    endText.textContent = scene.ending_text;
    choicesContainer.appendChild(endText);
  }

  const btnRestart = document.createElement("button");
  btnRestart.textContent = "Zurück zur Auswahl";
  btnRestart.onclick = () => {
    stopAudio();
    sceneHistory = [];
    showScreen(screenSelect);
  };

  choicesContainer.appendChild(btnRestart);
}

btnStart.addEventListener("click", () => {
  stopAudio();
  showScreen(screenSelect);
});

btnBackCover.addEventListener("click", () => {
  stopAudio();
  showScreen(screenCover);
});

btnBackOne.addEventListener("click", () => {
  stopAudio();

  // Wenn History leer → direkt zur Auswahl
  if (sceneHistory.length === 0) {
    showScreen(screenSelect);
    return;
  }

  // Sonst eine Ebene zurück
  isGoingBack = true;
  const previous = sceneHistory.pop();
  loadScene(previous);
});

loadStoryData();
