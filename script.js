let storyData = null;
let currentStory = null;
let currentSceneId = null;

const screenCover = document.getElementById("screen-cover");
const screenStory = document.getElementById("screen-story");

const btnStart = document.getElementById("btn-start");
const btnBackCover = document.getElementById("btn-back-cover");

const coverImg = document.getElementById("cover-img");
const bgImg = document.getElementById("bg-img");
const sceneTitle = document.getElementById("scene-title");
const promptText = document.getElementById("prompt-text");
const choicesContainer = document.getElementById("choices");
const player = document.getElementById("player");

function showScreen(screen) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  screen.classList.add("active");
}

function loadStoryData() {
  return fetch("story.json")
    .then(res => res.json())
    .then(data => {
      storyData = data;
      currentStory = storyData.stories[0];
      if (storyData.app && storyData.app.cover_image) {
        coverImg.src = storyData.app.cover_image;
      }
    });
}

function startStory() {
  if (!currentStory) return;
  currentSceneId = currentStory.start_scene;
  loadScene(currentSceneId);
  showScreen(screenStory);
}

function loadScene(sceneId) {
  const scene = currentStory.scenes[sceneId];
  if (!scene) return;

  currentSceneId = sceneId;

  // Titel & Hintergrund
  sceneTitle.textContent = scene.title || "";
  bgImg.src = scene.background || storyData.app.default_background || "";

  // Prompt verstecken
  promptText.textContent = "";
  promptText.style.display = "none";

  // Buttons verstecken
  choicesContainer.innerHTML = "";
  choicesContainer.style.display = "none";

  // Audio laden
  player.src = scene.narration || "";
  player.currentTime = 0;
  player.play();

  // Verhalten nach Audio-Ende
  if (scene.type === "decision") {
    player.onended = () => {
      promptText.textContent = scene.prompt || "";
      promptText.style.display = "block";
      showChoices(scene);
    };
  } else if (scene.type === "ending") {
    player.onended = () => {
      promptText.textContent = scene.ending_title || "";
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
  endText.textContent = `${scene.ending_title}\n\n${scene.ending_text}`;
  choicesContainer.appendChild(endText);

  const btnRestart = document.createElement("button");
  btnRestart.textContent = "Zurück zum Start";
  btnRestart.onclick = () => {
    showScreen(screenCover);
    player.pause();
  };
  choicesContainer.appendChild(btnRestart);

  choicesContainer.style.display = "block";
}

btnStart.addEventListener("click", () => {
  startStory();
});

btnBackCover.addEventListener("click", () => {
  player.pause();
  showScreen(screenCover);
});

loadStoryData();
