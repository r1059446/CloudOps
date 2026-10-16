import pandas as pd
from app.recommender import BaselineRecommender


def make_df():
    return pd.DataFrame(
        [
            {"movieId": 1, "title": "A", "genres": ["Action"], "year": 2000, "rating": 8.0, "votes": 5000},
            {"movieId": 2, "title": "B", "genres": ["Action"], "year": 2001, "rating": 7.0, "votes": 100},
            {"movieId": 3, "title": "C", "genres": ["Comedy"], "year": 2002, "rating": 9.0, "votes": 8000},
        ]
    )


def test_popular_respects_min_votes():
    rec = BaselineRecommender(make_df())
    result = rec.popular(limit=10, min_votes=1000)
    assert list(result["movieId"]) == [3, 1]  # B valt af (te weinig votes)


def test_by_genre():
    rec = BaselineRecommender(make_df())
    result = rec.by_genre("action")
    assert set(result["movieId"]) == {1, 2}


def test_similar_to():
    rec = BaselineRecommender(make_df())
    result = rec.similar_to(1)
    assert 2 in list(result["movieId"])
    assert 3 not in list(result["movieId"])