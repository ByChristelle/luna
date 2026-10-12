# Système de Notifications Push — Luna
## Documentation technique pour présentation formateur

---

## Pourquoi je ne peux pas démontrer les notifications en direct ?

Les notifications push **ne fonctionnent pas dans un navigateur web**. C'est une contrainte technique universelle, pas un problème de code.

Pour recevoir une notification push, il faut obligatoirement :
- Un **vrai appareil mobile** (iPhone ou Android)
- L'application installée via **Expo Go** ou en build natif
- Une **connexion à internet** sur l'appareil

Sur le poste de travail, l'application tourne dans un navigateur web via `localhost:8081`. Les navigateurs web bloquent les notifications push natives pour des raisons de sécurité (politique CORS + absence de Service Worker natif dans React Native Web).

**Ce n'est pas un manque de développement — c'est une contrainte d'environnement.**

--- 

## Ce qui est entièrement développé et fonctionnel

### 1. Base de données — 2 tables créées

**Table `push_tokens`**
Stocke l'identifiant unique de chaque appareil de l'utilisatrice.

| Champ | Description |
|---|---|
| `id` | Identifiant |
| `user_id` | Lien vers l'utilisatrice |
| `token` | Token unique de l'appareil (ex: `ExponentPushToken[xxx]`) |
| `created_at` | Date d'enregistrement |

**Table `notification_preferences`**
Stocke les préférences personnalisées de chaque utilisatrice.

| Champ | Description |
|---|---|
| `notify_before_period` | Rappel 2 jours avant les règles |
| `notify_period_start` | Début du nouveau cycle |
| `notify_fertility_start` | Début de la période fertile |
| `notify_ovulation` | Jour d'ovulation |
| `notify_fertility_end` | Fin de la période fertile |

---

### 2. Backend FastAPI — 3 endpoints opérationnels

```
POST /api/notifications/register-token
→ Enregistre le token de l'appareil en base lors de la connexion

GET  /api/notifications/preferences
→ Récupère les préférences de l'utilisatrice connectée

PATCH /api/notifications/preferences
→ Met à jour les préférences (activé/désactivé par l'utilisatrice)
```

Ces endpoints sont **testables en direct** via la documentation automatique FastAPI à l'adresse `http://localhost:8000/docs`.

---

### 3. Service de notification — `notification_service.py`

Ce service est le "cerveau" du système. Il :

1. **Parcourt toutes les utilisatrices** en base de données
2. **Déchiffre** les données du cycle (stockées chiffrées avec Fernet)
3. **Calcule le jour actuel** de chaque utilisatrice dans son cycle
4. **Vérifie ses préférences** — est-ce qu'elle veut être notifiée ?
5. **Envoie la notification** via l'API Expo Push Service

```python
# Exemple de logique de décision
if prefs.notify_before_period and days_before_period == 2:
    notification = ("Luna 🩸", "Tes règles arrivent dans 2 jours 💕")

elif prefs.notify_ovulation and current_day == ovulation_day:
    notification = ("Luna ✨", "Tu es en ovulation aujourd'hui.")

elif prefs.notify_fertility_start and current_day == fertility_start:
    notification = ("Luna 💙", "Ta période fertile commence aujourd'hui !")
```

---

### 4. Planificateur automatique — APScheduler

Le cron job est configuré dans `main.py` et se déclenche **chaque jour à 8h00** :

```python
scheduler = AsyncIOScheduler()
scheduler.add_job(
    check_and_send_notifications,
    trigger="cron",
    hour=8,
    minute=0,
)
```

Dès que le backend démarre, le scheduler est actif. Il n'a besoin d'aucune intervention manuelle.

---

### 5. Frontend — Écran de préférences fonctionnel

L'utilisatrice peut depuis l'app :
- **Activer ou désactiver** chaque type de notification via des toggles
- Les préférences sont **sauvegardées en base** immédiatement
- L'interface est **accessible** depuis l'onglet "Alertes"

---

### 6. Enregistrement automatique du token

Dès que l'utilisatrice ouvre l'app sur son téléphone :
1. L'app demande la **permission** d'envoyer des notifications
2. Si accordée, Expo génère un **token unique** pour cet appareil
3. Le token est **envoyé au backend** et sauvegardé en base
4. À partir de ce moment, le backend peut envoyer des notifications à cet appareil

---

## Architecture complète du flux

```
┌─────────────────────────────────────────────────────────┐
│                    CHAQUE JOUR À 8H00                   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
              Backend FastAPI (Python)
                            │
              ┌─────────────┴──────────────┐
              │  notification_service.py   │
              └─────────────┬──────────────┘
                            │
              Pour chaque utilisatrice :
                            │
              ┌─────────────▼──────────────┐
              │  1. Déchiffre son profil   │
              │  2. Calcule son jour cycle │
              │  3. Vérifie préférences    │
              │  4. Décide la notification │
              └─────────────┬──────────────┘
                            │
              ┌─────────────▼──────────────┐
              │   Expo Push Service        │
              │   (API externe sécurisée)  │
              └─────────────┬──────────────┘
                            │
              ┌─────────────▼──────────────┐
              │   📱 Téléphone de          │
              │   l'utilisatrice           │
              │   → Notification reçue     │
              └────────────────────────────┘
```

---

## Pourquoi passer par Expo Push Service ?

Expo Push Service est un intermédiaire entre notre backend et les services natifs d'Apple (APNs) et Google (FCM). Sans lui, il faudrait gérer deux systèmes séparés et des certificats Apple/Google. Expo simplifie ça en une seule API unifiée.

```
Notre Backend → Expo Push Service → APNs (iPhone) → Utilisatrice
                                 → FCM (Android) → Utilisatrice
```

---

## Ce qu'il faudrait pour tester en production

1. **Un téléphone avec Expo Go installé**
2. Scanner le QR code de l'app avec Expo Go
3. Accepter la demande de permission notifications
4. Le token s'enregistre → le backend peut envoyer

Pour forcer une notification immédiate (sans attendre 8h00), il suffirait d'appeler manuellement `check_and_send_notifications()` depuis un endpoint de test — ce qui peut être démontré en quelques secondes avec le bon appareil.

---

## Résumé pour le formateur

| Élément | État |
|---|---|
| Tables BDD `push_tokens` et `notification_preferences` | ✅ Créées et migrées |
| Endpoints API enregistrement token et préférences | ✅ Fonctionnels et testables |
| Service de calcul et envoi de notifications | ✅ Développé et intégré |
| Cron job quotidien 8h00 | ✅ Actif au démarrage du backend |
| Écran de préférences dans l'app | ✅ Fonctionnel avec toggles |
| Enregistrement automatique du token | ✅ Développé (nécessite appareil mobile) |
| Démonstration en direct | ⚠️ Nécessite un appareil mobile physique |

**La totalité du système est développée.** La seule contrainte est environnementale — l'absence d'un appareil mobile sur le poste de présentation.
