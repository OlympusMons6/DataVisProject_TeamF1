import { loadNationalData, loadQ2Data, loadQ3Data, loadQ4Data, loadQ5Data } from "./data/load-data.js";
import { setupYearFilters } from "./components/filters.js";
import { updateMetrics } from "./components/metric-cards.js";
import { renderQ1Chart } from "./charts/q1-national-trends.js";
import { renderQ2Charts } from "./charts/q2-road-users.js";
import { renderQ3Charts } from "./charts/q3-state-comparison.js";
import { renderQ4Charts } from "./charts/q4-remoteness.js";
import { renderQ5Charts } from "./charts/q5-first-nations.js";
import { subscribeToYearRange } from "./state.js";
import { setupNavigation } from "./components/navigation.js";

async function init() {
  try {
    const [nationalData, q2Data, q3Data, q4Data, q5Data] = await Promise.all([
      loadNationalData(), loadQ2Data(), loadQ3Data(), loadQ4Data(), loadQ5Data()
    ]);

    function renderQ1({ startYear, endYear }) {
      const filtered=nationalData.filter(d=>d.year>=startYear&&d.year<=endYear);
      if(!filtered.length)return;
      updateMetrics(filtered);
      renderQ1Chart(filtered);
      updateInsight(filtered);
    }

    function renderQ3({ start, end }) {
      // Q3 only contains 2018–2021. Intersect the global range with that period.
      const first=Math.max(start,2018);
      const last=Math.min(end,2021);
      if(first>last){
        document.querySelector("#q3-map-year").disabled=true;
        document.querySelector("#q3-map-chart").innerHTML='<p class="q2-empty">The selected global year range does not overlap Q3 data. Q3 is available for 2018–2021.</p>';
        document.querySelector("#q3-grouped-chart").innerHTML='<p class="q2-empty">The selected global year range does not overlap Q3 data. Q3 is available for 2018–2021.</p>';
        document.querySelector("#q3-change-chart").innerHTML="";
        document.querySelector("#q3-insight-title").textContent="No overlapping years selected.";
        document.querySelector("#q3-insight-copy").textContent="Select a year range that includes at least one year from 2018 to 2021.";
        return;
      }
      document.querySelector("#q3-map-year").disabled=false;
      renderQ3Charts(q3Data,first,last);
    }

    setupYearFilters(nationalData,renderQ1);
    renderQ1({startYear:nationalData[0].year,endYear:nationalData.at(-1).year});
    renderQ2Charts(q2Data);
    renderQ4Charts(q4Data);
    renderQ5Charts(q5Data);
    renderQ3(q3Data.length?{start:2011,end:2021}:{start:2018,end:2021});
    subscribeToYearRange(renderQ3);
    setupNavigation();
    setupColourMode();
    setupRevealAnimations();

    let resizeTimer;
    window.addEventListener("resize",()=>{
      clearTimeout(resizeTimer);
      resizeTimer=setTimeout(()=>{
        const start=Number(document.querySelector("#year-start").value);
        const end=Number(document.querySelector("#year-end").value);
        renderQ1({startYear:start,endYear:end});
        renderQ2Charts(q2Data);
        renderQ3({start,end});
        renderQ4Charts(q4Data);
        renderQ5Charts(q5Data);
      },140);
    });
  } catch(error) {
    console.error(error);
    for(const selector of ["#q1-chart","#q2-absolute-chart","#q3-grouped-chart","#q4-burden-chart","#q5-hospitalisations-chart"]){
      const node=document.querySelector(selector);
      if(node)node.innerHTML='<p class="q2-empty">Unable to load this visualisation. Check the CSV paths and run the site through Live Server.</p>';
    }
  }
}

function updateInsight(data){
  const title=document.querySelector("#insight-title"),copy=document.querySelector("#insight-copy");
  if(data.length<2){title.textContent="Select at least two years.";copy.textContent="Choose a wider year range to compare the national trend.";return;}
  const first=data[0],last=data.at(-1),change=last.hospitalisations-first.hospitalisations;
  title.textContent=change>=0?"Hospitalisations increased across the selected period.":"Hospitalisations decreased across the selected period.";
  copy.textContent=`Recorded hospitalisations changed from ${first.hospitalisations.toLocaleString("en-AU")} in ${first.year} to ${last.hospitalisations.toLocaleString("en-AU")} in ${last.year}. Interpret this alongside the 2012 Victoria and 2017 NSW admission-policy annotations.`;
}
init();

function setupColourMode(){
  const button=document.querySelector("#colour-mode-toggle");
  if(!button)return;
  button.addEventListener("click",()=>{
    const enabled=document.body.classList.toggle("colourblind-mode");
    button.setAttribute("aria-pressed",String(enabled));
    button.textContent=`Colour-blind mode: ${enabled?"On":"Off"}`;
    document.dispatchEvent(new Event("colourmodechange"));
  });
}
function setupRevealAnimations(){
  const elements=document.querySelectorAll(
    ".content-section,.metric-card,.chart-card,.insight-card,.context-card,.integrity-section"
  );
  if(!("IntersectionObserver" in window)){
    elements.forEach(element=>element.classList.add("is-visible"));
    return;
  }
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      // Toggle visibility in both directions so the reveal repeats while scrolling.
      entry.target.classList.toggle("is-visible",entry.isIntersecting);
    });
  },{threshold:.12,rootMargin:"0px 0px -45px 0px"});
  elements.forEach((element,index)=>{
    element.classList.add("reveal-on-scroll");
    if(element.classList.contains("chart-card")){
      element.classList.add(`reveal-delay-${(index%3)+1}`);
    }
    observer.observe(element);
  });
}
