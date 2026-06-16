from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///reguagent.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = "super_secret_key_for_demo_only"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    AI_MODE: str = "mock"
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    CORS_ORIGINS: str = "http://localhost:3000"
    PROMPTS_DIR: str = "/app/prompts"
    CELERY_ALWAYS_EAGER: bool = True

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
