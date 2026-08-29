from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.requests.auth_request import RegisterRequest, LoginRequest
from app.core.security import hash_password, verify_password, create_access_token

def register_user(db: Session, data: RegisterRequest):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé.")

    user = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "Compte créé avec succès."}

def login_user(db: Session, data: LoginRequest):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Identifiants incorrects.")

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}

def google_auth_user(db: Session, google_user: dict):
    email = google_user.get("email")
    name = google_user.get("name") or google_user.get("given_name")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Adresse email manquante dans le profil Google."
        )

    # 1. Vérification si l'utilisateur existe
    user = db.query(User).filter(User.email == email).first()

    # 2. Création si nouvel utilisateur
    if not user:
        user = User(
            name=name,
            email=email,
            password=None  # Ou mot de passe nul/invalide pour les comptes OAuth
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # 3. Génération du token JWT
    token = create_access_token({"sub": str(user.id), "email": user.email})
    return token