# Film Recommendation Engine — Baseline

## Starten met Docker

Start vanuit de hoofdmap van de repository de volledige applicatie met één commando:

```powershell
docker compose up --build
```

De webapp is beschikbaar op **http://localhost:8000** en de API-documentatie op **http://localhost:8000/docs**. De container serveert zowel de FastAPI-backend als de statische webinterface. De MovieLens-bestanden uit `data/` zitten in de image; er is geen aparte database, download of secret nodig.

Stop met `Ctrl+C` en voer eventueel `docker compose down` uit om de container te verwijderen.

### Poort aanpassen

De standaard hostpoort is `8000`. Als die poort al bezet is, maak je in de hoofdmap een lokale `.env` op basis van de template en wijzig je `PORT`:

```powershell
Copy-Item .env.example .env
```

`.env` wordt genegeerd door Git; commit dit bestand niet. De app gebruikt momenteel geen secrets. Bewaar eventuele secrets voor latere integraties lokaal of als GitHub Actions secrets.

## Architectuur

- `app/main.py`: FastAPI-routes en het serveren van de frontend.
- `app/data_loader.py`: leest `data/movies.csv` en `data/ratings.csv` en berekent scores en aantallen stemmen.
- `app/recommender.py`: baseline-aanbevelingen op basis van populariteit, genre en gedeelde genres.
- `app/schemas.py`: API-responseschema's.
- `data/`: MovieLens CSV-data die tijdens de image-build wordt opgenomen.

De Docker-image gebruikt Python 3.12, installeert de vastgelegde dependencies en draait als een niet-root gebruiker. GitHub Actions bouwt de image bij elke push en pull request; publiceren en deployen vallen buiten deze milestone.

## Lokaal starten

Open een terminal in deze map (`film-recommender`) en voer de volgende commando's uit in PowerShell:

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
