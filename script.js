const mainContainer = document.getElementById("main-container");
const template = document.getElementById("card");
const countEpisodes = document.getElementById("episode-count");
const message = document.getElementById("message");
const loader = document.getElementById("loader");
const errorMessage = document.getElementById("errorMessage");

// Using a helper function to reuse episode code
const getEpisodeCode = (episode) => {
  const seasonNo = String(episode.season).padStart(2, "0");
  const episodeNo = String(episode.number).padStart(2, "0");
  return `S${seasonNo}E${episodeNo}`;
}

const state = {
  searchTerm: "",
  episodes: [],
  selectEpisode: "",
};

const createEpisodeCard = (episode) => {
  const card = template.content.cloneNode(true);

  const link = card.querySelector(".episode-link");
  link.href = episode.url;

  card.querySelector(".name").textContent =
    `${episode.name} - ${getEpisodeCode(episode)}`;
  card.querySelector("img").src = episode.image.medium;
  card.querySelector(".summary").innerHTML = episode.summary;

  return card;
};

async function fetchEpisodes() {
  loader.textContent = "Loading episodes...";
  try {
    const response = await fetch("https://api.tvmaze.com/shows/82/episodes");
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();

    state.episodes = result;
    loader.textContent = "";
    populateDropdownOptions();
    filterAndRender();

  } catch (error) {
    errorMessage.textContent = "Unable to load episodes. Please try again!";
    loader.textContent = "";
  }
}

fetchEpisodes();


function filterAndRender() {
  const searchTerm = state.searchTerm.toLowerCase();
  const selected = state.selectEpisode;

  mainContainer.textContent = "";

  const filteredEpisodes = state.episodes.filter((item) => {
    const episodeName = item.name.toLowerCase();
    const episodeSummary = item.summary.toLowerCase();

    const matchSearchTerm =
      episodeName.includes(searchTerm) || episodeSummary.includes(searchTerm);

    const matchSelection =
      selected === getEpisodeCode(item) || selected === "";

    return matchSearchTerm && matchSelection;
  });

  const episodeCards = filteredEpisodes.map(createEpisodeCard);
  mainContainer.append(...episodeCards);

  if (searchTerm.length > 0 || selected !== "") {
    countEpisodes.textContent = `Displaying ${filteredEpisodes.length}/${state.episodes.length}`;
  } else {
    countEpisodes.textContent = "";
  }

  // message if no episode matches the searchTerm
  if (filteredEpisodes.length === 0) {
    message.textContent = "No episodes found. Try another input in the search box."
  } else {
    message.textContent = "";
  }
}

// search box
const searchInput = document.getElementById("search");
searchInput.addEventListener("input", (event) => {
  state.searchTerm = event.target.value.trim();
  filterAndRender();
});

// dropdown select
const select = document.getElementById("select");

function populateDropdownOptions() {
  select.innerHTML = "";

  const allEpisodesOption = document.createElement("option");
  allEpisodesOption.value = "";
  allEpisodesOption.textContent = "All episodes";
  select.appendChild(allEpisodesOption);

  state.episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.textContent = `${getEpisodeCode(episode)} - ${episode.name}`;
    option.value = getEpisodeCode(episode);

    select.appendChild(option);
  });
}

select.addEventListener("change", (event) => {
  state.selectEpisode = event.target.value;

  filterAndRender();
});