# RoadSafe Dashboard

COS30045 Data Visualisation project starter containing the complete Q1 implementation and Q2 visualisations.

## Included

- Report-aligned dark dashboard design and sticky navigation
- Q1 national trend line chart, year-range filters, summary metrics, policy annotations and tooltips
- Q2 absolute-change and percentage-change diverging bar charts
- Responsive chart layout and accessible chart labels / keyboard focus
- All seven supplied processed CSV datasets, copied without changing their values
- Q3–Q5 JavaScript file placeholders can be added as those sections are implemented

## Run in VS Code

1. Extract the ZIP.
2. Open the extracted folder in VS Code.
3. Use the Live Server extension to open `index.html`.
4. Do not open the HTML with `file://`; the browser needs a local HTTP server to fetch CSV files.

Alternative: from the project root run `python -m http.server 5500`, then visit `http://localhost:5500`.

## Q2 data limitation

The two supplied Q2 CSVs contain 2011 and 2021 endpoint counts, absolute changes and percentage changes for road-user categories. They do not contain annual observations for 2012–2020. Therefore Q2 currently uses two honest endpoint comparisons:
- absolute change in hospitalisations (2021 minus 2011)
- percentage change relative to 2011

The report's proposed stacked percentage-share-over-time chart is not fabricated from missing data. It can be implemented if a road-user-by-year dataset becomes available.

## Git branch workflow

If you already have a team-assigned branch, switch to that branch first. Otherwise:

```bash
git switch -c feature/q1-q2-visualisations
git add .
git commit -m "Implement Q1 and Q2 data visualisations"
git push -u origin feature/q1-q2-visualisations
```

## Dependencies

- D3.js v7 via jsDelivr CDN
- Inter font via Google Fonts

An internet connection is needed for these CDN-hosted dependencies.


## Shared filter behaviour

The year selector is managed through `js/state.js` as shared dashboard state.
- Q1 responds to the selected year range.
- Q3 will use the overlap between the selected range and its available 2018–2021 dataset when implemented.
- Q2 currently compares fixed 2011 and 2021 endpoints and therefore does not change with the year selector.
- Q4 and Q5 are fixed to 2021 and therefore do not change with the year selector.

This avoids presenting fixed-year datasets as though they respond to a filter they cannot support.


## Q3 jurisdiction comparisons

Q3 uses the supplied 2018–2021 state/territory annual counts. The grouped bar chart compares all eight jurisdictions by year, and the diverging horizontal chart compares the first and last years in the active global year range (restricted to the Q3 data period). These are recorded counts, not population-adjusted rates. No choropleth map is included because the supplied Q3 processed files contain state labels and counts but no geographic boundary geometry or population denominators.


## Q4 remoteness comparison

Q4 uses the fixed 2021 remoteness dataset. It displays recorded hospitalisation counts and average bed days per hospitalisation. The global year selector does not affect this fixed-year comparison. The supplied “Other or unknown” category is preserved.


## Q5 First Nations road-user outcomes

Q5 uses the supplied fixed 2021 dataset. It compares hospitalisation counts, total bed days and average bed days per hospitalisation across the four supplied road-user categories. The dataset does not include population denominators, annual trends, remoteness breakdowns or a non-Indigenous comparison group; the dashboard states these limitations explicitly.


## Final navigation

The sticky navigation links directly to all five question sections, including separate Remoteness (Q4) and First Nations (Q5) destinations. The active navigation item updates as the reader scrolls.
