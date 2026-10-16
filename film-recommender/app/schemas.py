from pydantic import BaseModel


class MovieOut(BaseModel):
    movieId: int
    title: str
    genres: list[str]
    year: int | None = None
    rating: float
    votes: int


class RecommendationResponse(BaseModel):
    strategy: str
    count: int
    results: list[MovieOut]