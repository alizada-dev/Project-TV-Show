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
  shows: [],
  episodes: [],
  selectedShowId: "",
  selectedEpisode: "",
  searchTerm: "",
  cache: {}, // prevent fetching same URL twice
};

// HELPERS

function getEpisodeCode(episode) {
  const seasonNo = String(episode.season).padStart(2, "0");
  const episodeNo = String(episode.number).padStart(2, "0");
  return `S${seasonNo}E${episodeNo}`;
}

function clearUI() {
  mainContainer.textContent = "";
  message.textContent = "";
  errorMessage.textContent = "";
}

function createBackToShowsLink() {
  const backBtn = document.createElement("button");
  backBtn.textContent = "← Back to Shows";
  backBtn.className = "back-button";

  backBtn.addEventListener("click", () => {
    state.selectedShowId = "";
    state.selectedEpisode = "";
    state.searchTerm = "";

    searchInput.value = "";
    episodeSelect.innerHTML = "";
    countEpisodes.textContent = "";

    showSelect.value = "";

    renderShows();
  });

  return backBtn;
}


// EPISODE CARD

function createEpisodeCard(episode) {
  const card = template.content.cloneNode(true);

  card.querySelector(".episode-link").href = episode.url;
  card.querySelector(".name").textContent =
    `${episode.name} - ${getEpisodeCode(episode)}`;

  card.querySelector("img").src =
    episode.image?.medium || "";

  card.querySelector(".summary").innerHTML =
    episode.summary || "No summary available.";

  return card;
}


// FETCH ALL SHOWS

async function fetchShows() {
  loader.textContent = "Loading shows...";

  try {
    const res = await fetch("https://api.tvmaze.com/shows");

    if (!res.ok) {
      throw new Error(`Status: ${res.status}`);
    }

    const data = await res.json();

    state.shows = data;

    loader.textContent = "";
    episodeSelect.style.display = "none";
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
      throw new Error(`Status: ${res.status}`);
    }

    const data = await res.json();

    state.cache[showId] = data;
    state.episodes = data;

    loader.textContent = "";

    episodeSelect.style.display = "block";
    populateEpisodeDropdown();
    renderEpisodes();

  } catch (error) {
    loader.textContent = "";
    errorMessage.textContent =
      "Unable to load episodes.";
  }
}


// SHOW DROPDOWN

function populateShowDropdown() {
  showSelect.innerHTML = "";

  const allShowsOption = document.createElement("option");
  allShowsOption.value = "";
  allShowsOption.textContent = "All Shows";
  showSelect.appendChild(allShowsOption);

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
    const code = getEpisodeCode(episode);

    option.value = code;
    option.textContent = `${code} - ${episode.name}`;

    episodeSelect.appendChild(option);
  });
}


// RENDER SHOWS LISTING

function renderShows() {
  clearUI();

  episodeSelect.innerHTML = "";
  countEpisodes.textContent = "";

  const search = state.searchTerm.toLowerCase();

  const filteredShows = state.shows.filter((show) => {
    const name = show.name.toLowerCase();
    const summary = (show.summary || "").toLowerCase();
    const genres = (show.genres || []).join(" ").toLowerCase();

    return (
      name.includes(search) ||
      summary.includes(search) ||
      genres.includes(search)
    );
  });

  if (filteredShows.length === 0) {
    message.textContent = "No shows found.";
    return;
  }

  filteredShows.forEach((show) => {

    const card = document.getElementById("show-card").content.cloneNode(true);

    const article = card.querySelector("article");

    article.addEventListener("click", async () => {
      state.selectedShowId = String(show.id);
      state.selectedEpisode = "";
      state.searchTerm = "";

      searchInput.value = "";
      showSelect.value = show.id;

      await fetchEpisodesByShow(show.id);
    })

    const title = card.querySelector("h2");
    title.textContent = show.name;

    const image = card.querySelector("img");
    image.src = show.image?.medium || "";
    image.alt = show.name;

    const rating = card.querySelector(".show-rating");
    rating.textContent = `Rating: ${show.rating?.average || "N/A"}`;

    const genres = card.querySelector(".show-genres");
    genres.textContent = `Genres: ${show.genres?.join(", ") || "N/A"}`;

    const status = card.querySelector(".show-status");
    status.textContent = `Status: ${show.status || "N/A"}`;

    const runtime = card.querySelector(".show-runtime");
    runtime.textContent = `Runtime: ${show.runtime || "N/A"} mins`;

    const summary = card.querySelector(".show-summary");
    summary.innerHTML = show.summary || "No summary available.";

    mainContainer.appendChild(card);
  });
}


// RENDER EPISODES

function renderEpisodes() {
  clearUI();

  mainContainer.appendChild(createBackToShowsLink());

  const search = state.searchTerm.toLowerCase();

  const filteredEpisodes = state.episodes.filter((episode) => {
    const name = episode.name.toLowerCase();
    const summary = (episode.summary || "").toLowerCase();

    const matchesSearch =
      name.includes(search) ||
      summary.includes(search);

    const matchesEpisode =
      state.selectedEpisode === "" ||
      getEpisodeCode(episode) === state.selectedEpisode;

    return matchesSearch && matchesEpisode;
  });

  const cards = filteredEpisodes.map(createEpisodeCard);
  mainContainer.append(...cards);

  countEpisodes.textContent =
    search || state.selectedEpisode
      ? `Displaying ${filteredEpisodes.length}/${state.episodes.length}`
      : "";

  if (filteredEpisodes.length === 0) {
    message.textContent = "No episodes found.";
  }
}

// EVENTS

// show dropdown
showSelect.addEventListener("change", async (e) => {
  const showId = e.target.value;

  state.selectedShowId = showId;
  state.selectedEpisode = "";
  state.searchTerm = "";

  searchInput.value = "";
  episodeSelect.value = "";

  if (showId === "") {
    renderShows();
    return;
  }

  await fetchEpisodesByShow(showId);
});


// episode dropdown
episodeSelect.addEventListener("change", (e) => {
  state.selectedEpisode = e.target.value;
  renderEpisodes();
});


// search input
searchInput.addEventListener("input", (e) => {
  state.searchTerm = e.target.value.toLowerCase().trim();

  if (state.selectedShowId === "") {
    renderShows();
  } else {
    renderEpisodes();
  }
});


// INIT

fetchShows();