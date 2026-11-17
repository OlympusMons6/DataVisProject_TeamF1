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


## Visual polish additions

- Q3 includes an interactive choropleth map for the selected map year, alongside the grouped bar chart. The map uses simplified 2021 Australian state and territory boundaries derived from ABS ASGS Edition 3 data, hosted as GeoJSON by GeoDataViewer. An internet connection is required to load this boundary file.
- The map displays recorded hospitalisation counts, not population-adjusted rates. The map year can be changed independently from the global year filter.
- The header includes a colour-blind mode toggle with a blue/orange alternative palette. Labels and tooltips remain available so meaning is not conveyed by colour alone.
- Chart cards and visualisations use subtle entrance animations and hover highlighting. Reduced-motion preferences are respected.

Boundary data attribution: Australian Bureau of Statistics (ABS), ASGS Edition 3, 2021 state and territory boundaries, simplified and distributed as GeoJSON by GeoDataViewer under CC BY 4.0. Source: https://geodataviewer.com/datasets/boundaries/australia-states-boundaries/


## Q3 interactive state tile map

The Q3 geographic panel is implemented as a local schematic tile map of the eight states and territories represented in the supplied Q3 dataset. Each tile is shaded by the selected year's recorded hospitalisation count and supports pointer hover and keyboard focus. Tile positions are schematic rather than official geographic boundaries. The map uses the supplied Q3 CSV only and makes no external GeoJSON request, avoiding browser CORS restrictions. Counts are not population-adjusted rates.

## Interaction and motion

- Chart marks respond to hover and keyboard focus.
- Dashboard sections and chart cards reveal with a subtle fade-and-rise effect as they enter the viewport.
- Reveal animations play once per element.
- Reduced-motion preferences are respected.
- The colour-blind palette toggle updates CSS colour variables used by the charts and Q3 tile map.


## Official Q3 geographic boundaries

The Q3 map uses the Australian Bureau of Statistics (ABS) ASGS Edition 3 (2021) State and Territory boundaries, GDA2020. The eight state/territory features represented in the Q3 dataset are bundled locally at `data/australia-states.geojson`; Other Territories and Outside Australia are excluded because the Q3 dataset has no matching observations for them. The map loads this local GeoJSON file and does not call an external boundary server, avoiding the previous CORS failure. The map displays recorded hospitalisation counts, not population-adjusted rates.

Source: Australian Bureau of Statistics, ASGS Edition 3 (2021), State and Territory boundaries, GDA2020.


The local GeoJSON coordinates are projected into GDA2020 / Australian Albers (EPSG:3577). D3 renders these as planar coordinates with `geoIdentity`, preserving Australia's true relative state shapes and avoiding spherical ring-winding artefacts.
