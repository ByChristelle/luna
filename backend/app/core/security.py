from datetime import datetime, timedelta, timezone
import os
import bcrypt
import jwt
from cryptography.fernet import Fernet
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.models.user import User

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key_pour_dev")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# Pour le chiffrement
KEY = os.getenv("SECRET_KEY_ENCRYPTION").encode()
fernet = Fernet(KEY)


def encrypt_data(data: str) -> str:
    if not data:
        return data
    return fernet.encrypt(data.encode()).decode()

def decrypt_data(token: str) -> str:
    if not token:
        return token
    return fernet.decrypt(token.encode()).decode()

# --- 1. Gestion des Mots de Passe ---
def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# --- 2. Gestion des Tokens JWT ---
def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


    # Configuration du scheme OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de valider les identifiants",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Décodage du token JWT
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    # Récupération de l'utilisateur dans la BDD
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
        
    return user