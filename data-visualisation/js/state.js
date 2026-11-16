// Shared dashboard filter state.
// Questions with compatible time-series data can subscribe to year-range changes.
let selectedYearRange = { start: 2011, end: 2021 };
const listeners = new Set();

export function getYearRange() {
  return { ...selectedYearRange };
}

export function setYearRange(start, end) {
  selectedYearRange = { start: Number(start), end: Number(end) };
  listeners.forEach(listener => listener(getYearRange()));
}

export function subscribeToYearRange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
