let storyData = null;
let currentStory = null;
let currentSceneId = null;
let sceneHistory = [];

const screenCover = document.getElementById("screen-cover");
const screenSelect = document.getElementById("screen-select");
const screenStory = document.getElementById("screen-story");

const btnStart = document.getElementById("btn-start");
const btnBackCover = document.getElementById("btn-back-cover");
const btnBackCover2 = document.getElementById("btn-back-cover2");
const btnBackSelect = document.getElementById("btn-back-select");
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
  player.onended = null;
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

  if (currentSceneId) {
    sceneHistory.push(currentSceneId);
  }

  currentSceneId = sceneId;

  sceneTitle.textContent = scene.title || "";
  bgImg.src = scene.background || storyData.app.default_background;

  promptText.textContent = "";
  promptText.style.display = "none";

  choicesContainer.innerHTML = "";
  choicesContainer.style.display = "none";

  stopAudio();
  player.src = scene.narration || "";
  player.play();

  if (scene.type === "decision") {
    player.onended = () => {
      promptText.textContent = scene.prompt;
      promptText.style.display = "block";
      showChoices(scene);
    };
  }

  if (scene.type === "ending") {
    player.onended = () => {
      promptText.textContent = scene.ending_title;
      promptText.style.display = "block";
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

  choicesContainer.style.display = "block";
}

function showEnding(scene) {
  choicesContainer.innerHTML = "";

  const endText = document.createElement("p");
  endText.textContent = scene.ending_text;
  choicesContainer.appendChild(endText);

  const btnRestart = document.createElement("button");
  btnRestart.textContent = "Zurück zum Start";
  btnRestart.onclick = () => {
    stopAudio();
    showScreen(screenCover);
  };
  choicesContainer.appendChild(btnRestart);

  choicesContainer.style.display = "block";
}

btnStart.addEventListener("click", () => {
  stopAudio();
  showScreen(screenSelect);
});

btnBackCover.addEventListener("click", () => {
  stopAudio();
  showScreen(screenCover);
});

btnBackCover2.addEventListener("click", () => {
  stopAudio();
  showScreen(screenCover);
});

btnBackSelect.addEventListener("click", () => {
  stopAudio();
  sceneHistory = [];
  showScreen(screenSelect);
});

btnBackOne.addEventListener("click", () => {
  stopAudio();
  if (sceneHistory.length > 0) {
    const previous = sceneHistory.pop();
    loadScene(previous);
  }
});

loadStoryData();
