const mainContainer = document.getElementById("main-container");
const template = document.getElementById("card");
const countEpisodes = document.getElementById("episode-count");
const message = document.getElementById("message");
const loader = document.getElementById("loader");
const errorMessage = document.getElementById("errorMessage");

const searchInput = document.getElementById("search");
const select = document.getElementById("select");
const showSelection = document.getElementById("show");


const state = {
  searchTerm: "",
  episodes: [],
  selectEpisode: "",
  shows: [],
  selectedShow: "",
};


const getEpisodeCode = (episode) => {
  const seasonNo = String(episode.season).padStart(2, "0");
  const episodeNo = String(episode.number).padStart(2, "0");
  return `S${seasonNo}E${episodeNo}`;
};


const createEpisodeCard = (episode) => {
  const card = template.content.cloneNode(true);

  card.querySelector(".episode-link").href = episode.url;
  card.querySelector(".name").textContent =
    `${episode.name} - ${getEpisodeCode(episode)}`;
  card.querySelector("img").src = episode.image?.medium || "";
  card.querySelector(".summary").innerHTML = episode.summary || "";

  return card;
};


async function fetchShows() {
  const res = await fetch("https://api.tvmaze.com/shows");
  const data = await res.json();
  state.shows = data;
  populateShowDropdown();
}
fetchShows();


async function fetchEpisodesByShow(showId) {
  loader.textContent = "Loading episodes...";

  try {
    const res = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);

    const data = await res.json();

    state.episodes = data;

    loader.textContent = "";

    populateEpisodeDropdown();
    filterAndRender();
  } catch (err) {
    errorMessage.textContent = "Failed to load episodes";
  }
}


function populateShowDropdown() {
  showSelection.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Please select show";
  defaultOption.value = "";
  showSelection.appendChild(defaultOption);

  state.shows.forEach((show) => {
    const option = document.createElement("option");
    option.textContent = show.name;
    option.value = show.id; 
    showSelection.appendChild(option);
  });
}

showSelection.addEventListener("change", (e) => {
  const showId = e.target.value;

  state.selectedShow = showId;
  state.selectEpisode = "";
  state.searchTerm = "";

  if (!showId) return;

  fetchEpisodesByShow(showId);
});

function populateEpisodeDropdown() {
  select.innerHTML = "";

  const all = document.createElement("option");
  all.textContent = "All episodes";
  all.value = "";
  select.appendChild(all);

  state.episodes.forEach((ep) => {
    const option = document.createElement("option");
    option.textContent = `${getEpisodeCode(ep)} - ${ep.name}`;
    option.value = getEpisodeCode(ep);
    select.appendChild(option);
  });
}

select.addEventListener("change", (e) => {
  state.selectEpisode = e.target.value;
  filterAndRender();
});


searchInput.addEventListener("input", (e) => {
  state.searchTerm = e.target.value.toLowerCase();
  filterAndRender();
});


function filterAndRender() {
  const search = state.searchTerm.toLowerCase();
  const selectedEpisode = state.selectEpisode;

  mainContainer.textContent = "";

  const filtered = state.episodes.filter((ep) => {
    const name = ep.name.toLowerCase();
    const summary = (ep.summary || "").toLowerCase();

    const matchSearch = name.includes(search) || summary.includes(search);

    const matchEpisode =
      selectedEpisode === "" || getEpisodeCode(ep) === selectedEpisode;

    return matchSearch && matchEpisode;
  });

  const cards = filtered.map(createEpisodeCard);
  mainContainer.append(...cards);

  countEpisodes.textContent =
    search || selectedEpisode
      ? `Displaying ${filtered.length}/${state.episodes.length}`
      : "";

  message.textContent = filtered.length === 0 ? "No episodes found." : "";
}
