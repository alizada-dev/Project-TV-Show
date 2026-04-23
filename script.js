const mainContainer = document.getElementById("main-container");
const template = document.getElementById("card");
const countEpisodes = document.getElementById("episode-count");
const message = document.getElementById("message");
const loader = document.getElementById("loader");
const errorMessage = document.getElementById("errorMessage");

const searchInput = document.getElementById("search");
const episodeSelect = document.getElementById("select");
const showSelect = document.getElementById("show");

const state = {
  searchTerm: "",
  episodes: [],
  selectedEpisode: "",
  shows: [],
  selectedShow: "",
  cache: {}
};


// HELPER

const getEpisodeCode = (episode) => {
  const seasonNo = String(episode.season).padStart(2, "0");
  const episodeNo = String(episode.number).padStart(2, "0");
  return `S${seasonNo}E${episodeNo}`;
};


// EPISODE CARD

const createEpisodeCard = (episode) => {
  const card = template.content.cloneNode(true);

  card.querySelector(".episode-link").href = episode.url;
  card.querySelector(".name").textContent =
    `${episode.name} - ${getEpisodeCode(episode)}`;

  card.querySelector("img").src =
    episode.image.medium;

  card.querySelector(".summary").innerHTML =
    episode.summary || "No summary available.";

  return card;
};


// FETCH ALL SHOWS

async function fetchShows() {
  loader.textContent = "Loading shows...";

  try {
    const res = await fetch("https://api.tvmaze.com/shows");

    if (!res.ok) {
      throw new Error(`Error status: ${res.status}`);
    }

    const data = await res.json();

    state.shows = data;

    loader.textContent = "";
    errorMessage.textContent = "";

    populateShowDropdown();
    renderShows();

  } catch (error) {
    loader.textContent = "";
    errorMessage.textContent =
      "Unable to load TV shows. Please try again later.";
  }
}


// FETCH EPISODES WITH CACHE

async function fetchEpisodesByShow(showId) {
  // requirement:
  // never fetch same URL more than once

  if (state.cache[showId]) {
    state.episodes = state.cache[showId];
    populateEpisodeDropdown();
    renderEpisodes();
    return;
  }

  loader.textContent = "Loading episodes...";

  try {
    const res = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );

    if (!res.ok) {
      throw new Error(`Error status: ${res.status}`);
    }

    const data = await res.json();

    state.cache[showId] = data;
    state.episodes = data;

    loader.textContent = "";
    errorMessage.textContent = "";

    populateEpisodeDropdown();
    renderEpisodes();

  } catch (error) {
    loader.textContent = "";
    errorMessage.textContent =
      "Failed to load episodes.";
  }
}


// SHOW DROPDOWN

function populateShowDropdown() {
  showSelect.innerHTML = "";

  const allShowsOption = document.createElement("option");
  allShowsOption.value = "";
  allShowsOption.textContent = "All Shows";
  showSelect.appendChild(allShowsOption);

  // alphabetical order (case-insensitive)
  const sortedShows = [...state.shows].sort((a, b) =>
    a.name.toLowerCase().localeCompare(
      b.name.toLowerCase()
    )
  );

  sortedShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;

    showSelect.appendChild(option);
  });
}


// EPISODE DROPDOWN

function populateEpisodeDropdown() {
  episodeSelect.innerHTML = "";

  const allEpisodesOption = document.createElement("option");
  allEpisodesOption.value = "";
  allEpisodesOption.textContent = "All Episodes";
  episodeSelect.appendChild(allEpisodesOption);

  state.episodes.forEach((episode) => {
    const option = document.createElement("option");

    option.value = getEpisodeCode(episode);
    option.textContent =
      `${getEpisodeCode(episode)} - ${episode.name}`;

    episodeSelect.appendChild(option);
  });
}


// RENDER ALL SHOWS

function renderShows() {
  mainContainer.textContent = "";
  message.textContent = "";
  countEpisodes.textContent = "";
  episodeSelect.innerHTML = "";

  const filteredShows = state.shows.filter((show) =>
    show.name.toLowerCase().includes(state.searchTerm)
  );

  filteredShows.forEach((show) => {
    const container = document.createElement("div");
    const showName = document.createElement("h2");
    const img = document.createElement("img");
    showName.textContent = show.name;
    img.src = show.image.medium;
    container.appendChild(showName);
    container.appendChild(img)
    mainContainer.appendChild(container);
  });
}


// RENDER EPISODES

function renderEpisodes() {
  mainContainer.textContent = "";

  const search = state.searchTerm.toLowerCase();
  const selectedEpisode = state.selectedEpisode;

  const filteredEpisodes = state.episodes.filter((episode) => {
    const name = episode.name.toLowerCase();
    const summary = (episode.summary || "").toLowerCase();

    const matchesSearch =
      name.includes(search) ||
      summary.includes(search);

    const matchesEpisode =
      selectedEpisode === "" ||
      getEpisodeCode(episode) === selectedEpisode;

    return matchesSearch && matchesEpisode;
  });

  const cards = filteredEpisodes.map(createEpisodeCard);
  mainContainer.append(...cards);

  countEpisodes.textContent =
    search || selectedEpisode
      ? `Displaying ${filteredEpisodes.length}/${state.episodes.length}`
      : "";

  message.textContent =
    filteredEpisodes.length === 0
      ? "No episodes found."
      : "";
}


// SHOW SELECT EVENT

showSelect.addEventListener("change", async (e) => {
  const showId = e.target.value;

  state.selectedShow = showId;
  state.selectedEpisode = "";
  state.searchTerm = "";

  searchInput.value = "";
  episodeSelect.value = "";

  // All Shows selected
  if (showId === "") {
    state.episodes = [];
    renderShows();
    return;
  }

  await fetchEpisodesByShow(showId);
});


// EPISODE SELECT EVENT

episodeSelect.addEventListener("change", (e) => {
  state.selectedEpisode = e.target.value;
  renderEpisodes();
});


// SEARCH EVENT

searchInput.addEventListener("input", (e) => {
  state.searchTerm = e.target.value.toLowerCase().trim();

  // if no show selected → search shows
  if (state.selectedShow === "") {
    renderShows();
  } else {
    renderEpisodes();
  }
});


// INIT

fetchShows();