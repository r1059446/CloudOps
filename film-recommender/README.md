# Film Recommendation Engine — Baseline

## Lokaal starten

Open een terminal in deze map (`CloudOps/film-recommender`) en voer de volgende commando's uit in PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Open daarna **http://127.0.0.1:8000** voor de demo. Stop de server met `Ctrl+C`.

Als PowerShell het activeren van de virtuele omgeving blokkeert, kun je de omgeving ook zonder activatie gebruiken:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

## Demo gebruiken

- Zoek een filmtitel en kies een resultaat om aanbevelingen op basis van gedeelde genres te bekijken.
- Kies een genre voor de best beoordeelde films binnen dat genre.
- Bekijk de populaire films, gerangschikt op gemiddelde score en aantal beoordelingen.

De filmpagina gebruikt MovieLens CSV-bestanden uit `data/`. De gemiddelde score en het aantal beoordelingen worden lokaal uit `ratings.csv` berekend. De demo haalt geen posters of andere inhoud van externe websites op.

## API

- `GET /health` — statuscontrole
- `GET /genres` — beschikbare genres
- `GET /movies?query=toy&limit=8` — zoek films op titel
- `GET /recommendations/popular?limit=8&min_votes=20` — populaire films
- `GET /recommendations/genre/action?limit=8` — aanbevelingen per genre
- `GET /recommendations/similar/1?limit=8` — vergelijkbare films
- `GET /docs` — interactieve API-documentatie
