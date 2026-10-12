from sqlalchemy.orm import Session
from app.models.message import Message
from app.core.security import encrypt_data, decrypt_data

def save_message(db: Session, user_id: int, role: str, content: str) -> Message:
    """Sauvegarde un message chiffré en base."""
    try:
        encrypted_content = encrypt_data(content)
        print(f'[save_message] role={role} | original={content[:20]} | chiffré={encrypted_content[:20]}')
    except Exception as e:
        print(f'[message_controller] Erreur chiffrement: {e}')
        encrypted_content = content
    db_message = Message(
        user_id=user_id,
        role=role,
        content=encrypted_content,
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    db_message.content = content
    return db_message

def get_messages_by_user(db: Session, user_id: int) -> list:
    """Récupère et déchiffre tous les messages d'une utilisatrice."""
    messages = (
        db.query(Message)
        .filter(Message.user_id == user_id)
        .order_by(Message.created_at.asc())
        .all()
    )
    for msg in messages:
        try:
            msg.content = decrypt_data(msg.content)
        except Exception:
            pass
    return messages
