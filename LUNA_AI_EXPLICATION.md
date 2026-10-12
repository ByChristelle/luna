# Intégration de l'IA dans Luna — Documentation technique

## Vue d'ensemble

Luna intègre une intelligence artificielle conversationnelle qui permet à l'utilisatrice de poser des questions sur sa santé féminine et son cycle menstruel. L'IA répond de manière contextualisée en tenant compte de la phase et du jour du cycle de l'utilisatrice.

---

## Architecture de l'intégration

```
Utilisatrice (Frontend)
        ↓
   pose une question
        ↓
  AIScreen.tsx (React Native)
        ↓
  aiService.ts (appel HTTP)
        ↓
  Backend FastAPI (/api/ai/ask)
        ↓
  API Groq (Intelligence Artificielle)
        ↓
  Modèle groq/compound-mini
        ↓
  Réponse retournée à l'utilisatrice
```

---

## Pourquoi passer par le backend ?

Au départ, l'appel à l'API Groq était fait directement depuis le frontend (le navigateur). Cela posait deux problèmes majeurs :

1. **Problème de sécurité** : la clé API était visible dans le code source du navigateur — n'importe qui pouvait la récupérer et l'utiliser.

2. **Problème CORS** : les navigateurs web bloquent par défaut les requêtes vers des API externes pour des raisons de sécurité. Groq ne permettait pas les appels directs depuis un navigateur.

La solution adoptée : faire passer l'appel par le **backend FastAPI**, qui lui n'a pas ces restrictions. Le frontend parle uniquement à notre propre backend, et c'est le backend qui parle à Groq.

---

## Les composants techniques

### 1. Frontend — `AIScreen.tsx`
L'écran de chat de l'application. Il :
- Affiche la conversation entre l'utilisatrice et Luna
- Récupère la phase et le jour du cycle depuis le store Zustand (`useCycleStore`)
- Envoie la question via `aiService.ts`

### 2. Frontend — `aiService.ts`
Le service qui fait le pont entre l'écran et le backend. Il :
- Récupère le token JWT de l'utilisatrice connectée
- Envoie une requête `POST` à `/api/ai/ask` avec la question, la phase et le jour du cycle
- Retourne la réponse de Luna à l'écran

### 3. Backend — `ai_router.py`
Le endpoint FastAPI qui reçoit la requête du frontend. Il :
- Vérifie que l'utilisatrice est bien connectée (token JWT)
- Lit la clé API Groq depuis le fichier `.env` (sécurisé, jamais exposé)
- Construit un message système qui contextualise Luna (phase du cycle, jour)
- Appelle l'API Groq via `httpx` (client HTTP asynchrone)
- Retourne la réponse à l'utilisatrice

---

## Le fichier `.env` — Gestion des secrets

Les secrets de l'application sont stockés dans des fichiers `.env` qui ne sont **jamais committés sur Git** (protégés par `.gitignore`).

```
backend/.env          ← contient GROQ_API_KEY (clé API Groq)
frontend/.env         ← variables publiques Expo uniquement
```

La clé Groq est lue dans le backend via `pydantic-settings` :

```python
# config.py
class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
```

---

## Le modèle d'IA — `groq/compound-mini`

Groq est une plateforme qui héberge plusieurs modèles d'intelligence artificielle. Un modèle c'est le "cerveau" de l'IA — c'est lui qui comprend la question et génère la réponse.

Le modèle choisi est `groq/compound-mini` :
- Léger et rapide
- Adapté aux conversations simples
- Disponible sur le compte Groq du projet

---

## La contextualisation de Luna

Ce qui distingue Luna d'un simple chatbot générique, c'est qu'elle connaît le contexte médical de l'utilisatrice. À chaque message, le backend envoie à Groq un **message système** qui dit :

```
Tu es Luna, une assistante experte en santé féminine.
Contexte utilisateur : Jour 14 du cycle, Phase actuelle : ovulation.
Réponds toujours en français. Sois brève, claire et bienveillante.
```

Ainsi Luna adapte ses réponses selon où en est l'utilisatrice dans son cycle.

---

## Flux complet d'une conversation

1. L'utilisatrice tape "J'ai des crampes, c'est normal ?" et appuie sur Envoyer
2. `AIScreen.tsx` appelle `askLuna("J'ai des crampes, c'est normal ?", "menstruelle", 2)`
3. `aiService.ts` envoie `POST /api/ai/ask` avec le token JWT
4. `ai_router.py` vérifie le token → valide
5. Le backend lit `GROQ_API_KEY` depuis `.env`
6. Le backend appelle Groq avec le contexte : "Jour 2, Phase menstruelle"
7. Groq génère une réponse adaptée : "Oui, les crampes au jour 2 des règles sont normales..."
8. La réponse remonte jusqu'à l'écran de l'utilisatrice

---

## Sécurité

| Élément | Protection |
|---|---|
| Clé API Groq | Stockée dans `backend/.env`, jamais exposée au navigateur |
| Endpoint `/api/ai/ask` | Protégé par JWT — seules les utilisatrices connectées peuvent l'appeler |
| Données du cycle | Chiffrées en base avec Fernet avant stockage |

---

## Technologies utilisées

| Technologie | Rôle |
|---|---|
| **Groq** | Plateforme d'hébergement des modèles d'IA |
| **groq/compound-mini** | Modèle de langage qui génère les réponses |
| **httpx** | Client HTTP asynchrone Python pour appeler Groq depuis FastAPI |
| **pydantic-settings** | Lecture sécurisée des variables d'environnement |
| **JWT** | Authentification des requêtes vers le backend |
| **Zustand** | Store frontend pour récupérer les données du cycle |
