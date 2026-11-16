import { setYearRange } from "../state.js";

export function setupYearFilters(data, onChange) {
  const start = document.querySelector("#year-start");
  const end = document.querySelector("#year-end");
  const reset = document.querySelector("#reset-filters");
  const years = data.map(d => d.year);

  // Populate both controls from the available Q1 years.
  years.forEach(year => {
    start.add(new Option(year, year));
    end.add(new Option(year, year));
  });

  start.value = years[0];
  end.value = years.at(-1);

  function emitChange() {
    let first = Number(start.value);
    let last = Number(end.value);

    // Keep the selected range valid if the user crosses the endpoints.
    if (first > last) {
      if (document.activeElement === start) {
        end.value = first;
      } else {
        start.value = last;
      }
      first = Number(start.value);
      last = Number(end.value);
    }

    setYearRange(first, last);
    onChange({ startYear: first, endYear: last });
  }

  start.addEventListener("change", emitChange);
  end.addEventListener("change", emitChange);

  reset.addEventListener("click", () => {
    start.value = years[0];
    end.value = years.at(-1);
    emitChange();
  });

  setYearRange(years[0], years.at(-1));
  return { startYear: years[0], endYear: years.at(-1) };
}
