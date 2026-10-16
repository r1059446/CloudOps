from fastapi import FastAPI, HTTPException, Query
from functools import lru_cache
from pathlib import Path
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.data_loader import load_movies
from app.recommender import BaselineRecommender
from app.schemas import RecommendationResponse, MovieOut

app = FastAPI(
    title="CineMatch",
    version="1.0.0",
    description="Discover movies by genre, ratings, and popularity.",
)

STATIC_DIR = Path(__file__).resolve().parent / "static"
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/", include_in_schema=False)
def home():
    return FileResponse(STATIC_DIR / "index.html")


@lru_cache
def get_recommender() -> BaselineRecommender:
    """Load the movie data once and reuse the recommender."""
    return BaselineRecommender(load_movies())


def _to_movie(r) -> MovieOut:
    return MovieOut(
        movieId=int(r.movieId),
        title=str(r.title),
        genres=list(r.genres),
        year=int(r.year) if r.year == r.year else None,
        rating=float(r.rating),
        votes=int(r.votes),
    )


def _to_response(strategy: str, df) -> RecommendationResponse:
    results = [_to_movie(row) for row in df.itertuples()]
    return RecommendationResponse(
        strategy=strategy, count=len(results), results=results
    )


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/genres", response_model=list[str])
def genres():
    """Return the genres available in the movie dataset."""
    all_genres = {
        genre
        for movie_genres in get_recommender().movies["genres"]
        for genre in movie_genres
    }
    return sorted(all_genres)


@app.get("/movies", response_model=list[MovieOut])
def search_movies(
    query: str = Query(min_length=1, max_length=100),
    limit: int = Query(8, ge=1, le=20),
):
    """Search for movies by title."""
    movies = get_recommender().movies
    search_term = query.strip()
    if not search_term:
        return []
    matches = movies[
        movies["title"].str.contains(search_term, case=False, regex=False)
    ]
    matches = matches.sort_values(["votes", "rating"], ascending=False).head(limit)
    return [_to_movie(row) for row in matches.itertuples()]


@app.get("/recommendations/popular", response_model=RecommendationResponse)
def popular(
    limit: int = Query(10, ge=1, le=50),
    min_votes: int = Query(20, ge=0),
):
    df = get_recommender().popular(limit=limit, min_votes=min_votes)
    return _to_response("popular", df)


@app.get("/recommendations/genre/{genre}", response_model=RecommendationResponse)
def by_genre(genre: str, limit: int = Query(10, ge=1, le=50)):
    df = get_recommender().by_genre(genre, limit=limit)
    if df.empty:
        raise HTTPException(status_code=404, detail=f"No movies found for genre '{genre}'.")
    return _to_response(f"genre:{genre}", df)


@app.get("/recommendations/similar/{movie_id}", response_model=RecommendationResponse)
def similar(movie_id: int, limit: int = Query(10, ge=1, le=50)):
    df = get_recommender().similar_to(movie_id, limit=limit)
    if df.empty:
        raise HTTPException(status_code=404, detail=f"Movie {movie_id} was not found.")
    return _to_response(f"similar:{movie_id}", df)
