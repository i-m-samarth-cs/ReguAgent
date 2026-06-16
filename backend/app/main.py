from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import create_db_and_tables
from app.routers import auth, regulatory, maps, departments, validation, audit, admin, reports

app = FastAPI(
    title="ReguAgent API",
    description="Agentic Regulatory Intelligence & Compliance System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(regulatory.router)
app.include_router(maps.router)
app.include_router(maps.router2)
app.include_router(departments.router)
app.include_router(validation.router)
app.include_router(audit.router)
app.include_router(admin.router)
app.include_router(reports.router)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/health")
def health():
    return {"status": "ok", "service": "reguagent-api"}
