
import { FORMAT } from "../config.js";

const order = [
  "Major Cities",
  "Regional",
  "Remote",
  "Other or unknown"
];

// Consistent colours for each remoteness category
const categoryColors = {
  "Major Cities": "#3182BD",
  "Regional": "#20A39E",
  "Remote": "#E6863B",
  "Other or unknown": "#9B72CF"
};

export function renderQ4Charts(rows) {
  renderBurden(rows);
  renderBedDays(rows);
  renderStay(rows);

  const city = rows.find(d => d.remoteness === "Major Cities");
  const remote = rows.find(d => d.remoteness === "Remote");
  const regional = rows.find(d => d.remoteness === "Regional");

  const highest = rows.reduce((a, b) =>
    b.bedDaysPerHospitalisation > a.bedDaysPerHospitalisation ? b : a
  );

  document.querySelector("#q4-insight-title").textContent =
    `${highest.remoteness} recorded the highest average bed days per hospitalisation.`;

  document.querySelector("#q4-insight-copy").textContent =
    `In 2021, the average was ${highest.bedDaysPerHospitalisation.toFixed(2)} bed days per hospitalisation in ${highest.remoteness}, compared with ${city.bedDaysPerHospitalisation.toFixed(2)} in Major Cities. Regional and Remote areas recorded ${regional.bedDaysPerHospitalisation.toFixed(2)} and ${remote.bedDaysPerHospitalisation.toFixed(2)} respectively.`;
}

// Chart 1: Hospitalisations
function renderBurden(rows) {
  renderLollipop("#q4-burden-chart", rows, {
    value: d => d.hospitalisations,
    title: "2021 hospitalisations by remoteness area",
    axisTitle: "Hospitalisations · 2021",
    format: d => FORMAT.format(d.hospitalisations),
    tooltip: d => `${FORMAT.format(d.hospitalisations)} hospitalisations`,
    domainPadding: 1.16,
    right: 85
  });
}

// Chart 2: Total bed days
function renderBedDays(rows) {
  renderLollipop("#q4-bed-days-chart", rows, {
    value: d => d.bedDays,
    title: "Total hospital bed days by remoteness area in 2021",
    axisTitle: "Total bed days · 2021",
    format: d => FORMAT.format(d.bedDays),
    tooltip: d => `${FORMAT.format(d.bedDays)} total bed days`,
    domainPadding: 1.16,
    right: 90
  });
}

// Chart 3: Average bed days per hospitalisation
function renderStay(rows) {
  renderLollipop("#q4-stay-chart", rows, {
    value: d => d.bedDaysPerHospitalisation,
    title: "Average bed days per hospitalisation by remoteness area in 2021",
    axisTitle: "Average bed days per hospitalisation · 2021",
    format: d => d.bedDaysPerHospitalisation.toFixed(2),
    tooltip: d =>
      `${d.bedDaysPerHospitalisation.toFixed(2)} bed days per hospitalisation · ${FORMAT.format(d.bedDays)} total bed days`,
    domainPadding: 1.2,
    right: 75
  });
}

// Reusable lollipop chart function
function renderLollipop(selector, rows, config) {
  const host = d3.select(selector);
  host.selectAll("*").remove();

  const data = order
    .map(k => rows.find(d => d.remoteness === k))
    .filter(Boolean);

  if (!data.length) return;

  const width = Math.max(
    320,
    host.node().getBoundingClientRect().width
  );

  const margin = {
    top: 16,
    right: config.right,
    bottom: 38,
    left: 120
  };

  const rowHeight = 48;
  const height = margin.top + margin.bottom + rowHeight * data.length;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = rowHeight * data.length;

  const x = d3.scaleLinear()
    .domain([
      0,
      d3.max(data, config.value) * config.domainPadding
    ])
    .nice()
    .range([0, innerWidth]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.remoteness))
    .range([0, innerHeight])
    .padding(0.28);

  const svg = host.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("aria-label", config.title);

  svg.append("title").text(config.title);

  const plot = svg.append("g")
    .attr(
      "transform",
      `translate(${margin.left},${margin.top})`
    );

  // Background grid
  plot.append("g")
    .attr("class", "q2-grid")
    .call(
      d3.axisBottom(x)
        .ticks(4)
        .tickSize(innerHeight)
        .tickFormat("")
    );

  // Category labels
  plot.append("g")
    .attr("class", "q2-axis")
    .call(d3.axisLeft(y).tickSize(0));

  // Lollipop stems
  plot.selectAll("line.q4-lollipop-stem")
    .data(data)
    .join("line")
    .attr("class", "q4-lollipop-stem")
    .attr("x1", 0)
    .attr("x2", d => x(config.value(d)))
    .attr(
      "y1",
      d => y(d.remoteness) + y.bandwidth() / 2
    )
    .attr(
      "y2",
      d => y(d.remoteness) + y.bandwidth() / 2
    )
    .attr("stroke", d => categoryColors[d.remoteness] || "#3182BD")
    .attr("stroke-width", 4)
    .attr("stroke-linecap", "round")
    .attr("opacity", 0.8);

  // Circular markers
  const dots = plot.selectAll("circle.q4-lollipop-dot")
    .data(data)
    .join("circle")
    .attr("class", "q4-lollipop-dot")
    .attr("cx", d => x(config.value(d)))
    .attr(
      "cy",
      d => y(d.remoteness) + y.bandwidth() / 2
    )
    .attr("r", 7)
    .attr("fill", d => categoryColors[d.remoteness] || "#3182BD")
    .attr("stroke", "var(--card-bg, #24282C)")
    .attr("stroke-width", 2)
    .style("cursor", "pointer")
    .on("pointerenter", (event, d) =>
      tip(event, d.remoteness, config.tooltip(d))
    )
    .on("pointermove", moveTip)
    .on("pointerleave", hideTip);

  dots.append("title")
    .text(d => `${d.remoteness}: ${config.tooltip(d)}`);

  // Numerical labels
  plot.selectAll("text.q4-value-label")
    .data(data)
    .join("text")
    .attr("class", "q2-value-label q4-value-label")
    .attr("x", d => x(config.value(d)) + 12)
    .attr(
      "y",
      d => y(d.remoteness) + y.bandwidth() / 2 + 4
    )
    .text(config.format);

  // Axis title
  svg.append("text")
    .attr("class", "q2-axis-title")
    .attr("x", margin.left + innerWidth / 2)
    .attr("y", height - 5)
    .attr("text-anchor", "middle")
    .text(config.axisTitle);
}

// Tooltip functions
function tip(event, title, detail) {
  d3.select("body")
    .selectAll(".q4-tooltip")
    .data([null])
    .join("div")
    .attr("class", "q2-tooltip q4-tooltip")
    .style("display", "block")
    .html(`<strong>${title}</strong><span>${detail}</span>`);

  moveTip(event);
}

function moveTip(event) {
  d3.select(".q4-tooltip")
    .style(
      "left",
      `${Math.min(event.clientX + 14, window.innerWidth - 240)}px`
    )
    .style(
      "top",
      `${Math.min(event.clientY + 14, window.innerHeight - 90)}px`
    );
}

function hideTip() {
  d3.select(".q4-tooltip").style("display", "none");
}
