/**
 * Utilidades astronómicas para cálculo preciso del ciclo lunar
 * Adaptado a la zona horaria y coordenadas de Islas Canarias (WET/WEST, Lat ~28.2°N)
 *
 * En la tradición agrícola de Canarias, el injerto se realiza exclusivamente
 * durante la fase de LUNA MENGUANTE (desde después de luna llena hasta luna nueva),
 * cuando la savia desciende a las raíces facilitando el agarre de la púa/yema.
 */

// Ciclo sinódico medio de la luna (días)
const SYNODIC_MONTH = 29.530588853;
// Fecha base de luna nueva conocida: 6 de enero de 2000 a las 18:14 UTC
const KNOWN_NEW_MOON_JD = 2451549.26;

/**
 * Convierte un objeto Date a Día Juliano (Julian Date)
 */
export function getJulianDate(date) {
  const time = date.getTime();
  return time / 86400000 + 2440587.5;
}

/**
 * Obtiene la edad de la luna en días (0 a 29.53)
 */
export function getMoonAge(date) {
  const jd = getJulianDate(date);
  const daysSinceKnownNewMoon = jd - KNOWN_NEW_MOON_JD;
  const newMoons = daysSinceKnownNewMoon / SYNODIC_MONTH;
  const currentCycleFraction = newMoons - Math.floor(newMoons);
  return currentCycleFraction * SYNODIC_MONTH;
}

/**
 * Retorna la fase normalizada (0.0 a 1.0)
 * 0.0 = Luna Nueva
 * 0.25 = Cuarto Creciente
 * 0.50 = Luna Llena
 * 0.75 = Cuarto Menguante
 * 1.0 = Siguiente Luna Nueva
 */
export function getMoonPhaseFraction(date) {
  const age = getMoonAge(date);
  return age / SYNODIC_MONTH;
}

/**
 * Determina si una fecha está en LUNA MENGUANTE
 * La luna menguante comprende desde después de Luna Llena (~0.50) hasta Luna Nueva (~1.0 / 0.0)
 * En este periodo la savia desciende y es el momento óptimo tradicional para injertar.
 */
export function isWaningMoon(date) {
  const fraction = getMoonPhaseFraction(date);
  // Desde 0.505 (justo pasada la luna llena) hasta 0.995 (justo antes de luna nueva)
  return fraction >= 0.50 && fraction < 0.985;
}

/**
 * Obtiene información detallada de la fase lunar para una fecha
 */
export function getMoonPhaseInfo(date) {
  const fraction = getMoonPhaseFraction(date);
  const age = getMoonAge(date);
  const isWaning = isWaningMoon(date);

  // Iluminación aproximada (0% a 100%)
  const illumination = Math.round((1 - Math.cos(fraction * 2 * Math.PI)) / 2 * 100);

  let name = '';
  let icon = '🌑';
  let phaseKey = '';

  if (fraction < 0.03 || fraction >= 0.97) {
    name = 'Luna Nueva';
    icon = '🌑';
    phaseKey = 'new';
  } else if (fraction < 0.22) {
    name = 'Luna Creciente';
    icon = '🌒';
    phaseKey = 'waxing_crescent';
  } else if (fraction < 0.28) {
    name = 'Cuarto Creciente';
    icon = '🌓';
    phaseKey = 'first_quarter';
  } else if (fraction < 0.47) {
    name = 'Gibosa Creciente';
    icon = '🌔';
    phaseKey = 'waxing_gibbous';
  } else if (fraction < 0.53) {
    name = 'Luna Llena';
    icon = '🌕';
    phaseKey = 'full';
  } else if (fraction < 0.72) {
    name = 'Gibosa Menguante';
    icon = '🌖';
    phaseKey = 'waning_gibbous';
  } else if (fraction < 0.78) {
    name = 'Cuarto Menguante';
    icon = '🌗';
    phaseKey = 'last_quarter';
  } else {
    name = 'Luna Menguante (Balsámica)';
    icon = '🌘';
    phaseKey = 'waning_crescent';
  }

  return {
    phaseKey,
    name,
    icon,
    age: Math.round(age * 10) / 10,
    illumination,
    fraction,
    isWaning,
    recommendation: isWaning
      ? '¡Día óptimo para injertar! (Luna Menguante - Savia baja)'
      : 'No propicio para injertar (Esperar a Luna Menguante)'
  };
}

/**
 * Devuelve los días de un mes con información lunar para calendario
 */
export function getMonthCalendarData(year, monthIndex) {
  // Primer día del mes
  const firstDay = new Date(year, monthIndex, 1);
  // Último día del mes
  const lastDay = new Date(year, monthIndex + 1, 0);
  const totalDays = lastDay.getDate();

  // Día de la semana en que inicia el mes (0 domingo, 1 lunes... ajustamos a lunes = 0)
  let startingDayOfWeek = firstDay.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6; // Domingo al final

  const days = [];

  // Días vacíos previos para alinear con el lunes
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push({ empty: true, key: `empty-prev-${i}` });
  }

  // Días reales del mes
  for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
    const date = new Date(year, monthIndex, dayNum, 12, 0, 0);
    const moonInfo = getMoonPhaseInfo(date);
    const dateString = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

    days.push({
      empty: false,
      dayNum,
      date,
      dateString,
      moonInfo,
      isWaning: moonInfo.isWaning,
      key: `day-${dateString}`
    });
  }

  return {
    year,
    monthIndex,
    monthName: firstDay.toLocaleString('es-ES', { month: 'long' }),
    days
  };
}
