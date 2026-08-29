"""
Script UTILE : assigne un share_token a UN UTILISATEUR en particulier,
affiche les donnees de cycle DECHIFFREES (pour verifier que c'est LA BONNE PERSONNE),
et retourne l'URL de partage directe a coller dans le navigateur.

Usage :
  python assign_share_token.py                 # Menu interactif
  python assign_share_token.py ali@ali.com     # Directement par email
  python assign_share_token.py --all           # Assigne un token a TOUS les users avec profile
"""
import sys
import secrets
from datetime import datetime, date

sys.path.insert(0, ".")

from app.core.database import SessionLocal
from app.core.security import decrypt_data
from app.core.config import settings
from app.models.user import User
from app.models.profile import Profile


def fmt_info_user(u: User, p: Profile | None) -> str:
    """Retourne un resume humain avec donnees dechiffrees si profile."""
    if not p:
        return f"id={u.id} email={u.email} (SANS PROFILE)"

    try:
        cl = int(decrypt_data(p.cycle_length)) if p.cycle_length else None
        pl = int(decrypt_data(p.period_length)) if p.period_length else None
        lpd_raw = decrypt_data(p.last_period_date) if p.last_period_date else None
        lpd = datetime.strptime(lpd_raw, "%Y-%m-%d").date() if lpd_raw else None

        today = date.today()
        if lpd:
            days_since = (today - lpd).days
            current_day = (days_since % cl) + 1 if cl else None
        else:
            days_since = None
            current_day = None

        token_preview = (u.share_token[:8] + "...") if u.share_token else "(aucun)"
        return (
            f"id={u.id}  email={u.email}\n"
            f"       cycle={cl}j  regles={pl}j  last_period={lpd}  "
            f"days_since={days_since}  current_day={current_day}/{cl}\n"
            f"       share_token={token_preview}"
        )
    except Exception as e:
        return f"id={u.id} email={u.email} (ERREUR DECRYPTAGE: {e})"


def assign_token_to_user_id(db, user_id: int) -> tuple[User, Profile | None, str]:
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise ValueError(f"Aucun user avec id={user_id}")

    u.share_token = secrets.token_urlsafe(16)
    db.commit()
    db.refresh(u)

    p = db.query(Profile).filter(Profile.user_id == u.id).first()
    base = settings.FRONTEND_WEB_BASE_URL.rstrip("/")
    url = f"{base}/?token={u.share_token}"
    return u, p, url


def main():
    db = SessionLocal()
    try:
        args = [a for a in sys.argv[1:] if not a.startswith("--")]
        do_all = "--all" in sys.argv

        # --- Option --all : assigne un token a TOUS les users SANS token, AVEC profile ---
        if do_all:
            print("=" * 60)
            print("ASSIGNATION D'UN TOKEN A TOUS LES USERS AVEC PROFILE")
            print("=" * 60)
            profiles = db.query(Profile).all()
            for p in profiles:
                u = db.query(User).filter(User.id == p.user_id).first()
                if u and not u.share_token:
                    _, _, url = assign_token_to_user_id(db, u.id)
                    info = fmt_info_user(u, p)
                    print(f"\n✅ {info}")
                    print(f"   URL partage : {url}")
            print("\n🎉 Termine.")
            db.close()
            return

        # --- Mode interactif / par email ---
        print("=" * 60)
        print("ASSIGNER UN SHARE_TOKEN ET OBTENIR L'URL DE PARTAGE")
        print("=" * 60)

        # Lister tous les users avec leur profile dechiffre
        all_users = db.query(User).order_by(User.id).all()
        print(f"\nUtilisateurs en base ({len(all_users)}):")
        for u in all_users:
            p = db.query(Profile).filter(Profile.user_id == u.id).first()
            print("  • " + fmt_info_user(u, p).replace("\n", "\n    "))

        # Soit on prend l'email en argument, soit on demande
        target_email = args[0] if args else None
        if not target_email:
            print("\n-----------------------------------------------")
            target_email = input("Entrez l'email du user pour qui vous voulez un token: ").strip()

        target = db.query(User).filter(User.email == target_email).first()
        if not target:
            print(f"\n❌ ERREUR : aucun user avec email '{target_email}'.")
            db.close()
            sys.exit(1)

        # Confirmation avant ecriture
        p = db.query(Profile).filter(Profile.user_id == target.id).first()
        print("\n-----------------------------------------------")
        print("UTILISATEUR CIBLE :\n  " + fmt_info_user(target, p).replace("\n", "\n  "))
        confirm = input("\n✅ Confirmer l'assignation d'un NOUVEAU token pour ce user ? [O/n] : ").strip().lower()
        if confirm and confirm not in ["o", "oui", "y", "yes", ""]:
            print("Annule.")
            db.close()
            return

        u2, p2, url = assign_token_to_user_id(db, target.id)
        info = fmt_info_user(u2, p2)

        # Test rapide : relire le user par son token pour verifier que c'est le BON
        recheck = db.query(User).filter(User.share_token == u2.share_token).first()
        assert recheck is not None and recheck.id == u2.id, "FAIL : token ne pointe pas vers le bon user !"

        print("\n" + "=" * 60)
        print("✅ SUCCES ! Token assigne :")
        print("  " + info.replace("\n", "\n  "))
        print("\n🔗 URL DE PARTAGE DIRECTE (a copier dans incognito) :")
        print(f"   {url}")
        print("=" * 60)
        db.close()
    except KeyboardInterrupt:
        print("\nAnnule.")
        db.close()
        sys.exit(130)
    except Exception as e:
        db.close()
        raise


if __name__ == "__main__":
    main()
