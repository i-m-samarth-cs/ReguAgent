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
    from sqlmodel import Session, select
    from app.database import engine
    from app.models.models import User
    with Session(engine) as session:
        try:
            users_exist = session.exec(select(User)).first()
            if not users_exist:
                print("[startup] No users found. Running auto-seed...")
                from app.seed_data import seed
                seed(drop_all=False)
        except Exception as e:
            print(f"[startup] Auto-seed skipped or failed: {e}")


@app.get("/health")
def health():
    return {"status": "ok", "service": "reguagent-api"}
