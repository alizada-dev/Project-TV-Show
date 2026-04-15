//You can edit ALL of the code here
function setup() {

  const rootElem = document.getElementById("root");

  const template = rootElem.querySelector("#card");

  const episodes = getAllEpisodes();

  const createEpisodeCard = (episode) => {
    const card = template.content.cloneNode(true);

    const link = card.querySelector(".episode-link");
    link.href = episode.url;

    const s = String(episode.season).padStart(2, "0");
    const e = String(episode.number).padStart(2, "0");

    card.querySelector(".name").textContent = `${episode.name} - S${s}E${e}`;
    card.querySelector("img").src = episode.image.medium;
    card.querySelector(".summary").innerHTML = episode.summary;

    return card;
  }

  const episodeCards = episodes.map(createEpisodeCard);

  rootElem.append(...episodeCards);

}


window.onload = setup;
