const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#movie-search");
const suggestions = document.querySelector("#search-suggestions");
const genreList = document.querySelector("#genre-list");
const popularButton = document.querySelector("#popular-button");
const resultsTitle = document.querySelector("#results-title");
const resultsKicker = document.querySelector("#results-kicker");
const resultsDescription = document.querySelector("#results-description");
const resultCount = document.querySelector("#result-count");
const movieGrid = document.querySelector("#movie-grid");
const messagePanel = document.querySelector("#message-panel");

let suggestionMovies = [];
let activeGenre = null;
let searchSequence = 0;
let collectionSequence = 0;
let searchTimer;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function cleanTitle(title) {
  return title.replace(/\s+\(\d{4}\)\s*$/, "");
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-GB").format(value);
}

async function getJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.detail || "Something went wrong while loading movies.");
  }
  return body;
}

function setActiveGenre(genre) {
  activeGenre = genre;
  genreList.querySelectorAll(".genre-chip").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.genre === genre));
  });
}

function renderGenres(genres) {
  const preferredOrder = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", "Drama", "Fantasy",
    "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller", "Documentary",
  ];
  const ordered = [
    ...preferredOrder.filter((genre) => genres.includes(genre)),
    ...genres.filter((genre) => !preferredOrder.includes(genre)),
  ];

  genreList.innerHTML = ordered.map((genre) => `
    <button class="genre-chip" type="button" data-genre="${escapeHtml(genre)}" aria-pressed="false">
      ${escapeHtml(genre)}
    </button>
  `).join("");
}

function renderSuggestions(movies, query) {
  suggestionMovies = movies;
  searchInput.setAttribute("aria-expanded", "true");
  suggestions.hidden = false;

  if (movies.length === 0) {
    suggestions.innerHTML = `<div class="suggestions-empty">No movies found for “${escapeHtml(query)}”.</div>`;
    return;
  }

  suggestions.innerHTML = movies.map((movie, index) => `
    <button class="suggestion" type="button" role="option" aria-selected="false" data-index="${index}">
      <span>
        <span class="suggestion-title">${escapeHtml(cleanTitle(movie.title))}</span>
        <span class="suggestion-meta">${escapeHtml(movie.genres.slice(0, 3).join(" · ") || "Genre unknown")}</span>
      </span>
      <span class="suggestion-year">${movie.year || "—"}</span>
    </button>
  `).join("");
}

function closeSuggestions() {
  suggestions.hidden = true;
  searchInput.setAttribute("aria-expanded", "false");
}

async function searchMovies(query) {
  const sequence = ++searchSequence;
  try {
    const movies = await getJson(`/movies?${new URLSearchParams({ query, limit: "8" })}`);
    if (sequence === searchSequence) renderSuggestions(movies, query);
  } catch (error) {
    if (sequence === searchSequence) {
      suggestions.hidden = false;
      searchInput.setAttribute("aria-expanded", "true");
      suggestions.innerHTML = `<div class="suggestions-empty">${escapeHtml(error.message)}</div>`;
    }
  }
}

function makeMovieCard(movie, index) {
  const title = cleanTitle(movie.title);
  const genres = movie.genres.slice(0, 2).join(" · ") || "Genre unknown";
  const rating = Number(movie.rating || 0).toFixed(1);
  const year = movie.year || "Unknown year";

  return `
    <article class="movie-card">
      <button class="poster-button" type="button" data-similar-id="${movie.movieId}" aria-label="Discover movies like ${escapeHtml(title)}">
        <span class="poster-art">
          <span class="poster-topline"><span>${escapeHtml(movie.genres[0] || "Movie")}</span><span>${year}</span></span>
          <span class="poster-film-title">${escapeHtml(title)}</span>
          <span class="poster-bottomline">CineMatch · ${String(index + 1).padStart(2, "0")}</span>
        </span>
      </button>
      <div class="movie-info">
        <h3 class="movie-title" title="${escapeHtml(movie.title)}">${escapeHtml(title)}</h3>
        <div class="movie-subtitle"><span>${escapeHtml(genres)}</span><b class="meta-separator">·</b><span>${year}</span></div>
        <div class="movie-stats">
          <span class="movie-rating">${rating}<span class="rating-scale"> / 5</span></span>
          <span>${formatNumber(movie.votes)} ratings</span>
        </div>
        <button class="similar-link" type="button" data-similar-id="${movie.movieId}">Explore similar movies <span aria-hidden="true">↗</span></button>
      </div>
    </article>
  `;
}

function showLoading() {
  movieGrid.setAttribute("aria-busy", "true");
  movieGrid.innerHTML = Array.from({ length: 8 }, () => '<div class="loading-card" aria-hidden="true"></div>').join("");
  messagePanel.hidden = true;
  resultCount.textContent = "";
}

function renderResults(movies) {
  movieGrid.setAttribute("aria-busy", "false");
  if (movies.length === 0) {
    movieGrid.innerHTML = "";
    messagePanel.textContent = "No movies found for this selection. Try another genre or title.";
    messagePanel.hidden = false;
    resultCount.textContent = "0 MOVIES";
    return;
  }

  messagePanel.hidden = true;
  movieGrid.innerHTML = movies.map(makeMovieCard).join("");
  resultCount.textContent = `${String(movies.length).padStart(2, "0")} MOVIES`;
}

async function loadCollection({ url, kicker, title, description }) {
  const sequence = ++collectionSequence;
  resultsKicker.textContent = kicker;
  resultsTitle.textContent = title;
  resultsDescription.textContent = description;
  showLoading();

  try {
    const response = await getJson(url);
    if (sequence !== collectionSequence) return;
    renderResults(response.results || []);
  } catch (error) {
    if (sequence !== collectionSequence) return;
    movieGrid.setAttribute("aria-busy", "false");
    movieGrid.innerHTML = "";
    resultCount.textContent = "";
    messagePanel.innerHTML = `${escapeHtml(error.message)}<br /><span>Check that the server is running, then refresh this page.</span>`;
    messagePanel.hidden = false;
  }
}

function loadPopular() {
  setActiveGenre(null);
  loadCollection({
    url: "/recommendations/popular?limit=8&min_votes=20",
    kicker: "A GOOD PLACE TO START",
    title: "Popular with movie lovers",
    description: "Top-rated movies, ranked by score and number of ratings.",
  });
}

function loadGenre(genre) {
  setActiveGenre(genre);
  loadCollection({
    url: `/recommendations/genre/${encodeURIComponent(genre)}?limit=8`,
    kicker: "PICKED BY GENRE",
    title: `Top ${genre} movies`,
    description: `The highest-rated movies in the ${genre} genre.`,
  });
  document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
}

function loadSimilar(movie) {
  setActiveGenre(null);
  closeSuggestions();
  searchInput.value = movie.title;
  loadCollection({
    url: `/recommendations/similar/${movie.movieId}?limit=8`,
    kicker: "BASED ON YOUR MOVIE",
    title: `More like ${cleanTitle(movie.title)}`,
    description: `Movies that share genres with ${cleanTitle(movie.title)}.`,
  });
  document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
}

searchInput.addEventListener("input", () => {
  window.clearTimeout(searchTimer);
  const query = searchInput.value.trim();
  if (query.length < 2) {
    searchSequence += 1;
    closeSuggestions();
    return;
  }
  searchTimer = window.setTimeout(() => searchMovies(query), 220);
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (query.length >= 2) searchMovies(query);
});

suggestions.addEventListener("click", (event) => {
  const option = event.target.closest("[data-index]");
  if (!option) return;
  const movie = suggestionMovies[Number(option.dataset.index)];
  if (movie) loadSimilar(movie);
});

genreList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-genre]");
  if (button) loadGenre(button.dataset.genre);
});

movieGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-similar-id]");
  if (!button) return;
  const movieId = Number(button.dataset.similarId);
  const movieTitle = button.closest(".movie-card")?.querySelector(".movie-title")?.textContent || "this movie";
  loadSimilar({ movieId, title: movieTitle });
});

popularButton.addEventListener("click", () => {
  loadPopular();
  document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.addEventListener("click", (event) => {
  if (!searchForm.contains(event.target)) closeSuggestions();
});

getJson("/genres")
  .then(renderGenres)
  .catch(() => { genreList.innerHTML = '<span class="genre-loading">Could not load genres.</span>'; });

loadPopular();
