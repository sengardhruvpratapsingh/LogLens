from fastapi import APIRouter
from backend.app.api.endpoints import health, analyze, analyses, export, samples

api_router = APIRouter(prefix="/api")

api_router.include_router(health.router)
api_router.include_router(analyze.router)
api_router.include_router(analyses.router)
api_router.include_router(export.router)
api_router.include_router(samples.router)
