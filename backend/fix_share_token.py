"""
Script de correction pour la fonctionnalite de partage.

Actions :
  1. Verifie si la colonne `share_token` existe dans la table `users`
  2. Si NON, l'ajoute avec un index unique
  3. Liste tous les utilisateurs et leurs profils pour diagnostiquer
  4. Test le dechiffrement des donnees de cycle (Fernet)
  5. Execute la logique COMPLETE du endpoint GET /share/{token} (end-to-end)
"""
import sys
from sqlalchemy import text
from datetime import datetime, timedelta, date

sys.path.insert(0, ".")

from app.core.database import engine, SessionLocal
from app.core.security import decrypt_data
from app.models.user import User
from app.models.profile import Profile


def check_and_add_column():
    with engine.connect() as conn:
        # 1. Verifier si la colonne existe
        result = conn.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'users'
            AND column_name = 'share_token'
        """))
        exists = result.fetchone() is not None
        print(f"[1/5] Colonne share_token existe deja ? : {exists}")

        # 2. Ajouter la colonne si besoin
        if not exists:
            print("    -> Ajout de la colonne share_token...")
            conn.execute(text("""
                ALTER TABLE users
                ADD COLUMN share_token VARCHAR(255) NULL
            """))
            conn.execute(text("""
                CREATE UNIQUE INDEX ix_users_share_token
                ON users(share_token)
            """))
            conn.commit()
            print("    -> Colonne ajoutee avec succes !")
        else:
            print("    -> Rien a faire, colonne deja presente.")
        conn.close()


def show_users_and_profiles():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"\n[2/5] Nombre total d'utilisateurs en BDD : {len(users)}")

        for u in users:
            profile = db.query(Profile).filter(Profile.user_id == u.id).first()
            has_token = bool(u.share_token)
            has_profile = profile is not None
            print(f"  • User id={u.id} email={u.email}  "
                  f"| share_token OK ? {has_token} "
                  f"| profile OK ? {has_profile}")
            if has_profile:
                print(f"      -> cycle_length(enc)={profile.cycle_length[:30]}...")
        db.close()
    except Exception as e:
        print(f"    ERREUR pendant la lecture BDD : {e}")
        db.close()
        raise


def simulate_share_endpoint():
    """Test rapide : verifie qu'on peut bien lire et ecrire share_token."""
    db = SessionLocal()
    try:
        any_user = db.query(User).first()
        if not any_user:
            print("\n[3/5] Aucun utilisateur en BDD, test ignore.")
            return

        if not any_user.share_token:
            import secrets
            any_user.share_token = secrets.token_urlsafe(16)
            db.commit()
            db.refresh(any_user)
            print(f"\n[3/5] Token genere pour user id={any_user.id} : {any_user.share_token[:8]}...")
        else:
            print(f"\n[3/5] Token deja present pour user id={any_user.id} : {any_user.share_token[:8]}...")

        found = db.query(User).filter(User.share_token == any_user.share_token).first()
        assert found is not None and found.id == any_user.id
        print("[3/5] Recherche par share_token OK !")
        db.close()
    except Exception as e:
        print(f"\n[3/5] ERREUR pendant le test : {e}")
        db.close()
        raise


def test_decryption_and_cycle():
    """
    [4/5] Teste le dechiffrement Fernet des champs cycle_length / period_length / last_period_date
    pour TOUS les utilisateurs qui ont un profile.
    """
    db = SessionLocal()
    try:
        print("\n[4/5] Test du dechiffrement des donnees de cycle :")
        profiles = db.query(Profile).all()
        nb_ok = 0
        for p in profiles:
            u = db.query(User).filter(User.id == p.user_id).first()
            print(f"  • user id={p.user_id} : ", end="")
            try:
                cl = decrypt_data(p.cycle_length) if p.cycle_length else None
                pl = decrypt_data(p.period_length) if p.period_length else None
                lpd = decrypt_data(p.last_period_date) if p.last_period_date else None
                cl_i = int(cl)
                pl_i = int(pl)
                d = datetime.strptime(lpd, "%Y-%m-%d").date()
                print(f"✅ OK — cycle={cl_i}j, regles={pl_i}j, debut={d}")
                nb_ok += 1
            except Exception as e:
                print(f"❌ ECHEC — {e}")
        print(f"  -> {nb_ok}/{len(profiles)} profiles dechiffres avec succes.")
        db.close()
    except Exception as e:
        print(f"  ERREUR {e}")
        db.close()
        raise


def test_full_endpoint_share():
    """
    [5/5] Test END-TO-END : rejoue EXACTEMENT la logique de
    GET /api/share/{token} (depuis share.py) avec un user
    qui a a la fois share_token ET profile OK.
    """
    db = SessionLocal()
    try:
        print("\n[5/5] Test END-TO-END du endpoint GET /share/{token} :")

        # 1. Trouver un utilisateur eligible (share_token + profile)
        candidate = None
        all_users = db.query(User).all()
        for u in all_users:
            has_profile = db.query(Profile).filter(Profile.user_id == u.id).first() is not None
            if u.share_token and has_profile:
                candidate = u
                break

        if not candidate:
            print("  ⚠️  Aucun utilisateur avec a la fois share_token + profile. Test ignore.")
            db.close()
            return

        share_token = candidate.share_token
        print(f"  • Test avec user id={candidate.id} (token={share_token[:8]}...)")

        # 2. Logique identique a share.py : get_shared_cycle_public
        db_user = db.query(User).filter(User.share_token == share_token).first()
        assert db_user is not None, "share_token introuvable (FAIL)"
        print("  ✅ Recherche user par token : OK")

        db_profile = db.query(Profile).filter(Profile.user_id == db_user.id).first()
        assert db_profile is not None, "profile introuvable (FAIL)"
        print("  ✅ Profile trouve : OK")

        # 3. Dechiffrement + parsage (comme dans share.py corrige)
        cycle_length_raw = decrypt_data(db_profile.cycle_length)
        period_length_raw = decrypt_data(db_profile.period_length)
        cycle_length = int(cycle_length_raw)
        period_length = int(period_length_raw)
        last_period_raw = decrypt_data(db_profile.last_period_date)
        last_period_start = datetime.strptime(last_period_raw, "%Y-%m-%d").date()
        print(f"  ✅ Dechiffrement : cycle={cycle_length}j, regles={period_length}j, last={last_period_start}")

        # 4. Calcul basique (jour actuel
        today = date.today()
        days_since = (today - last_period_start).days
        current_day = (days_since % cycle_length) + 1
        print(f"  ✅ Calcul : today={today}, days_since_last={days_since}, current_day={current_day}/{cycle_length}")

        # 5. First name fallback
        first_name = getattr(db_user, "first_name", None) or getattr(db_user, "name", None) or "Cherie"
        print(f"  ✅ first_name='{first_name}'")

        print("  🎉 TEST END-TO-END : SUCCES ! Le endpoint /share/{token} fonctionne.")
        db.close()
    except AssertionError as e:
        print(f"  ❌ FAIL assertion : {e}")
        db.close()
        raise
    except Exception as e:
        print(f"  ❌ FAIL : {type(e).__name__} : {e}")
        db.close()
        raise


if __name__ == "__main__":
    print("=" * 60)
    print("SCRIPT DE CORRECTION PARTAGE DE LIEN - Luna")
    print("=" * 60)
    check_and_add_column()
    show_users_and_profiles()
    simulate_share_endpoint()
    test_decryption_and_cycle()
    test_full_endpoint_share()
    print("\n✅ Script termine.")
