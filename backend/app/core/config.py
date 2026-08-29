from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    SECRET_KEY_ENCRYPTION: str

    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str

    FRONTEND_WEB_BASE_URL: str = "http://localhost:8081"

    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"  # Ignore les variables non déclarées dans le .env
    )

settings = Settings()