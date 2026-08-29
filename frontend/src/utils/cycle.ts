export interface CycleMetrics {
  currentDay: number;
  phase: 'Règles' | 'Folliculaire' | 'Féconde' | 'Lutéale';
  nextPeriodIn: number;
  ovulationIn: number;
  fertileWindow: { startDay: number; endDay: number };
  daysInCurrentMonth: number;
  currentDateFormatted: string;
}

export function calculateCycleMetrics(
  lastPeriodDateStr: string,
  cycleLength: number = 28,
  periodLength: number = 5
): CycleMetrics {
  const today = new Date();
  const lastPeriod = new Date(lastPeriodDateStr);

  // Nombre de jours dans le mois en cours (28, 29, 30 ou 31)
  const daysInCurrentMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();

  // Différence en jours entre aujourd'hui et les dernières règles
  const diffTime = today.getTime() - lastPeriod.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Jour actuel dans le cycle (modulo la durée du cycle)
  const currentDay = (diffDays % cycleLength) + 1;

  // Calcul du jour d'ovulation et de la fenêtre féconde (ovulation ~ J-14)
  const ovulationDay = Math.max(1, cycleLength - 14);
  const fertileStartDay = Math.max(1, ovulationDay - 4);
  const fertileEndDay = Math.min(cycleLength, ovulationDay + 1);

  // Détermination de la phase actuelle
  let phase: CycleMetrics['phase'] = 'Folliculaire';
  if (currentDay <= periodLength) {
    phase = 'Règles';
  } else if (currentDay >= fertileStartDay && currentDay <= fertileEndDay) {
    phase = 'Féconde';
  } else if (currentDay > fertileEndDay) {
    phase = 'Lutéale';
  }

  // Décomptes
  const nextPeriodIn = cycleLength - currentDay + 1;
  const ovulationIn =
    ovulationDay >= currentDay
      ? ovulationDay - currentDay
      : cycleLength - currentDay + ovulationDay;

  // Formate la date réelle (ex: "Mercredi 26 Août")
  const currentDateFormatted = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return {
    currentDay,
    phase,
    nextPeriodIn,
    ovulationIn,
    fertileWindow: { startDay: fertileStartDay, endDay: fertileEndDay },
    daysInCurrentMonth,
    currentDateFormatted:
      currentDateFormatted.charAt(0).toUpperCase() + currentDateFormatted.slice(1),
  };
}