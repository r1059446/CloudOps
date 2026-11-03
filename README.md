# CloudOps — CineMatch

## Start de volledige stack

Vereisten: Git en Docker Desktop (met Docker Compose).

Na het clonen van de CloudOps-repository start je de applicatie vanuit de hoofdmap:

```powershell
docker compose up --build
```

Open daarna **http://localhost:8000**. De interactieve API-documentatie staat op **http://localhost:8000/docs**. Stop de stack met `Ctrl+C`; verwijder de container daarna eventueel met `docker compose down`.

De optionele `.env.example` bevat alleen de hostpoort. Kopieer die naar `.env` als poort 8000 al bezet is en pas `PORT` aan:

```powershell
Copy-Item .env.example .env
```

`.env` wordt door Git genegeerd. De huidige applicatie heeft geen API-sleutels of andere secrets nodig. Zet secrets voor toekomstige integraties uitsluitend in een lokale `.env` of in secrets van de CI/CD-omgeving; commit ze nooit.

## Opbouw

- `film-recommender/app/main.py` bevat de FastAPI-endpoints en serveert de webinterface.
- `film-recommender/app/data_loader.py` laadt de MovieLens-CSV-bestanden uit `data/`.
- `film-recommender/app/recommender.py` bevat de baseline-logica voor populaire, genre- en vergelijkbare films.
- `film-recommender/Dockerfile` bouwt de applicatie als een niet-root container. De CSV-data wordt in de image opgenomen, zodat er geen aparte database of downloadstap nodig is.
- `compose.yaml` start de volledige lokale stack met één service en controleert de `/health`-endpoint.
- `.github/workflows/build.yml` bouwt de Docker-image automatisch bij elke push en pull request. De workflow publiceert de image niet.

Meer details over endpoints en lokaal ontwikkelen staan in [`film-recommender/README.md`](film-recommender/README.md). De cursusintro, het projectvoorstel en feedback staan in [`docs/`](docs/).
