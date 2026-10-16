from pathlib import Path
import pandas as pd

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "movies.csv"


def load_movies() -> pd.DataFrame:
    """Laad films en voeg gemiddelde score en aantal beoordelingen toe."""
    df = pd.read_csv(DATA_PATH)

    ratings_path = DATA_PATH.with_name("ratings.csv")
    ratings = pd.read_csv(ratings_path, usecols=["movieId", "rating"])
    summary = (
        ratings.groupby("movieId")["rating"]
        .agg(rating="mean", votes="count")
        .reset_index()
    )
    df = df.merge(summary, on="movieId", how="left")

    # genres is bv. "Animation|Comedy" -> lijst
    df["genres"] = df["genres"].fillna("").apply(
        lambda g: [x.strip() for x in g.split("|") if x.strip()]
    )

    # Haal het jaartal uit titels zoals "Toy Story (1995)".
    df["year"] = pd.to_numeric(
        df["title"].str.extract(r"\((\d{4})\)\s*$", expand=False),
        errors="coerce",
    )

    # Films zonder beoordelingen krijgen een neutrale score en nul stemmen.
    df["rating"] = pd.to_numeric(df["rating"], errors="coerce").fillna(0.0)
    df["votes"] = pd.to_numeric(df["votes"], errors="coerce").fillna(0).astype(int)

    return df
