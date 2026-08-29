import { create } from 'zustand';
import api from '../services/api';

// ============================================================
//  FONCTIONS DE CALCUL (pur JavaScript — réutilisables partout)
// ============================================================

/**
 * Calcule le nombre de JOURS entre 2 dates (exclut l'heure).
 * @param {Date} d1
 * @param {Date} d2
 * @returns {number} différence en jours (positif si d2 > d1)
 */
const diffDays = (d1, d2) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  const date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.round((date2 - date1) / msPerDay);
};

/**
 * Calcule TOUT ce dont on a besoin pour afficher le cycle.
 * @param {string | Date} lastPeriodDate - date des dernières règles (ISO string ex: "2026-08-15")
 * @param {number} cycleLength - durée d'un cycle (ex: 28)
 * @param {number} periodLength - durée des règles (ex: 5)
 */
export const computeCycleData = (lastPeriodDate, cycleLength, periodLength) => {
  const today = new Date();
  const start = new Date(lastPeriodDate);

  // 1) Jours écoulés depuis le début des dernières règles
  const daysSinceLast = diffDays(start, today);

  // 2) Jour actuel du cycle (de 1 à cycleLength)
  //    Si on est avant le début → 0
  let currentDay = 0;
  if (daysSinceLast >= 0) {
    currentDay = (daysSinceLast % cycleLength) + 1;
  }

  // 3) Phase actuelle
  let phase = 'menstruelle';
  const ovuStart = Math.round(cycleLength * 0.46); // ~jour 13
  const ovuEnd = Math.round(cycleLength * 0.57);   // ~jour 16
  if (currentDay <= periodLength) phase = 'menstruelle';
  else if (currentDay < ovuStart) phase = 'folliculaire';
  else if (currentDay <= ovuEnd) phase = 'ovulation';
  else phase = 'luteale';

  // 4) Prochaines règles dans X jours
  let nextPeriodIn = cycleLength - currentDay + 1;
  if (nextPeriodIn < 1) nextPeriodIn = 1;

  // 5) Ovulation dans X jours
  //    L'ovulation a lieu ~14 jours avant la FIN du cycle
  const ovulationDay = cycleLength - 14;
  let ovulationIn = 0;
  if (currentDay < ovulationDay) ovulationIn = ovulationDay - currentDay;
  else if (currentDay <= ovuEnd) ovulationIn = 0; // en cours
  else ovulationIn = cycleLength - currentDay + ovulationDay; // prochain cycle

  // Nombre de cycles COMPLETS déjà écoulés depuis la date de début
  const cyclesElapsed = Math.floor(daysSinceLast / cycleLength);

  // 6) Date estimée des prochaines règles : cycle SUIVANT (cyclesElapsed + 1)
  const nextPeriodDate = new Date(start);
  nextPeriodDate.setDate(start.getDate() + (cyclesElapsed + 1) * cycleLength);

  // 7) PÉRIODE DE FÉCONDITÉ : 5 jours avant ovulation + 1 jour après
  const fertilityStartDay = Math.max(1, ovulationDay - 5);
  const fertilityEndDay = Math.min(cycleLength, ovulationDay + 1);

  const fertilityStartDate = new Date(start);
  fertilityStartDate.setDate(start.getDate() + fertilityStartDay - 1 + cyclesElapsed * cycleLength);

  const fertilityEndDate = new Date(start);
  fertilityEndDate.setDate(start.getDate() + fertilityEndDay - 1 + cyclesElapsed * cycleLength);

  // Date exacte de l'ovulation (cycle en cours)
  const ovulationDate = new Date(start);
  ovulationDate.setDate(start.getDate() + ovulationDay - 1 + cyclesElapsed * cycleLength);

  // 9) Calcul : dans combien de jours la fenêtre fertile commence / si on est dedans
  const isFertilityWindow = currentDay >= fertilityStartDay && currentDay <= fertilityEndDay;
  let fertilityIn = 0;
  if (isFertilityWindow) {
    fertilityIn = 0;
  } else if (currentDay < fertilityStartDay) {
    fertilityIn = fertilityStartDay - currentDay;
  } else {
    // On a dépassé la fenêtre, c'est au prochain cycle
    fertilityIn = cycleLength - currentDay + fertilityStartDay;
  }

  // 10) Helper : formater une date en "21 sept." (format court français)
  const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const formatShortDate = (date) => {
    return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
  };
  const formatLongDate = (date) => {
    return `${date.getDate()}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  return {
    cycleLength: Number(cycleLength),
    periodLength: Number(periodLength),
    lastPeriodDate: start.toISOString().slice(0, 10),
    currentDay: Math.max(1, currentDay),
    phase,
    nextPeriodIn,
    ovulationIn,
    ovulationDay,
    ovulationDate: ovulationDate.toISOString().slice(0, 10),
    ovulationDateShort: formatShortDate(ovulationDate),
    nextPeriodDate: nextPeriodDate.toISOString().slice(0, 10),
    nextPeriodDateShort: formatShortDate(nextPeriodDate),
    nextPeriodDateLong: formatLongDate(nextPeriodDate),
    fertilityStartDay,
    fertilityEndDay,
    fertilityStartDate: fertilityStartDate.toISOString().slice(0, 10),
    fertilityStartDateShort: formatShortDate(fertilityStartDate),
    fertilityEndDate: fertilityEndDate.toISOString().slice(0, 10),
    fertilityEndDateShort: formatShortDate(fertilityEndDate),
    fertilityIn,
    isFertilityWindow,
  };
};

// ============================================================
//  STORE ZUSTAND (à importer dans n'importe quel composant)
// ============================================================
export const useCycleStore = create((set, get) => ({
  profile: null,        // données brutes du backend
  data: null,           // données calculées prêtes à l'emploi
  loading: false,
  error: null,

  /**
   * Charge le profil depuis le backend ET calcule le cycle.
   * À appeler au chargement des pages home/dashboard.
   */
  fetchCycle: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/profiles/me');
      const profile = response.data;

      const cycleLength = parseInt(profile.cycle_length, 10) || 28;
      const periodLength = parseInt(profile.period_length, 10) || 5;
      const lastPeriodDate = profile.last_period_date;

      if (!lastPeriodDate || isNaN(cycleLength) || isNaN(periodLength)) {
        throw new Error('Données de cycle incomplètes dans le profil');
      }

      const computed = computeCycleData(lastPeriodDate, cycleLength, periodLength);

      set({ profile, data: computed, loading: false });
      return { success: true, data: computed };
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.message ||
        'Impossible de récupérer le cycle';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  /**
   * Recalcule le cycle depuis un profil déjà en mémoire.
   * Utile si l'utilisateur vient de mettre à jour son profil.
   */
  recompute: () => {
    const { profile } = get();
    if (!profile) return null;
    const cycleLength = parseInt(profile.cycle_length, 10) || 28;
    const periodLength = parseInt(profile.period_length, 10) || 5;
    const lastPeriodDate = profile.last_period_date;
    if (!lastPeriodDate) return null;
    const computed = computeCycleData(lastPeriodDate, cycleLength, periodLength);
    set({ data: computed });
    return computed;
  },

  /**
   * Réinitialise le store (appelé au logout par exemple).
   */
  reset: () => {
    set({ profile: null, data: null, loading: false, error: null });
  },
}));
