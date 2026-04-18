//You can edit ALL of the code here
const episodes = getAllEpisodes();
const rootElem = document.getElementById("card-section");
const template = rootElem.querySelector("#card");
const state = {
  searchTerm: "",
  episodes: episodes,
  selectEpisode: "",
};

function setup() {
  filterAndRender();
  selectEpisodes(episodes);
}

const createEpisodeCard = (episode) => {
  const card = template.content.cloneNode(true);

  const link = card.querySelector(".episode-link");
  link.href = episode.url;

  const episodeSeason = String(episode.season).padStart(2, "0");
  const episodeNo = String(episode.number).padStart(2, "0");

  card.querySelector(".name").textContent =
    `${episode.name} - S${episodeSeason}E${episodeNo}`;
  card.querySelector("img").src = episode.image.medium;
  card.querySelector(".summary").innerHTML = episode.summary;

  return card;
};


function filterAndRender() {
  const searchTerm = state.searchTerm.toLowerCase();
  const selected = state.selectEpisode.slice(0, 6);
  console.log(selected);
  rootElem.innerHTML = "";

  const filteredEpisodes = episodes.filter((item) => {
    const episodeName = item.name.toLowerCase();
    const episodeSummary = item.summary.toLowerCase();
    const episodeNo = item.number.toString().padStart(2, "0");
    const episodeSeason = item.season.toString().padStart(2, "0");
    const episodeCode = `S${episodeSeason}E${episodeNo}`;
    console.log({ selected, episodeCode });
    const matchSearchTerm =
      episodeName.includes(searchTerm) || episodeSummary.includes(searchTerm);
    const matchSelection = selected === episodeCode;
    return matchSearchTerm || matchSelection;
  });

  const display = document.getElementById("display");

  const episodeCards = filteredEpisodes.map(createEpisodeCard);
  const episodeCount =
    filteredEpisodes.length > 0
      ? `Displaying ${filteredEpisodes.length}/${episodes.length}`
      : `<p> Movie episode not found </p>`;
  display.innerHTML = episodeCount;
  rootElem.append(...episodeCards);
}



function searchEpisode() {
  const SearchInput = document.getElementById("search-bar");
  SearchInput.addEventListener("input", (event) => {
    state.searchTerm = event.target.value;
    filterAndRender();
  });
}
searchEpisode();

const select = document.getElementById("select");


function selectEpisodes(options) {
  select.innerHTML = select.firstElementChild.outerHTML;

  options.forEach((item) => {
    const option = document.createElement("option");
    const episodeSeason = String(item.season).padStart(2, "0");
    const episodeNo = String(item.number).padStart(2, "0");
    const episodeCode = `S${episodeSeason}E${episodeNo} - ${item.name}`;
    option.textContent = episodeCode;
    option.value = episodeCode;
    select.appendChild(option);
  });
}

select.addEventListener("change", (event) => {
  state.selectEpisode = event.target.value;
  console.log(event.target.value);
  filterAndRender();
});

window.onload = setup;
