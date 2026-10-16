import pandas as pd


class BaselineRecommender:

    def __init__(self, movies: pd.DataFrame):
        self.movies = movies

    # ---------- Populariteit ----------
    def popular(self, limit: int = 10, min_votes: int = 1000) -> pd.DataFrame:
        """Films met hoogste rating, met minimaal aantal stemmen."""
        filtered = self.movies[self.movies["votes"] >= min_votes]
        return (
            filtered.sort_values(["rating", "votes"], ascending=False)
            .head(limit)
            .reset_index(drop=True)
        )

    # ---------- Zelfde genre ----------
    def by_genre(self, genre: str, limit: int = 10) -> pd.DataFrame:
        """Topfilms binnen een genre, gesorteerd op rating."""
        genre = genre.strip().lower()
        mask = self.movies["genres"].apply(
            lambda gs: any(g.lower() == genre for g in gs)
        )
        filtered = self.movies[mask]
        return (
            filtered.sort_values(["rating", "votes"], ascending=False)
            .head(limit)
            .reset_index(drop=True)
        )

    # ---------- Vergelijkbaar met een film ----------
    def similar_to(self, movie_id: int, limit: int = 10) -> pd.DataFrame:
        """Films die genres delen met de opgegeven film."""
        row = self.movies[self.movies["movieId"] == movie_id]
        if row.empty:
            return pd.DataFrame()

        target_genres = set(row.iloc[0]["genres"])

        def overlap(genres):
            return len(target_genres.intersection(genres))

        candidates = self.movies[self.movies["movieId"] != movie_id].copy()
        candidates["overlap"] = candidates["genres"].apply(overlap)
        candidates = candidates[candidates["overlap"] > 0]

        return (
            candidates.sort_values(
                ["overlap", "rating", "votes"], ascending=False
            )
            .head(limit)
            .reset_index(drop=True)
        )