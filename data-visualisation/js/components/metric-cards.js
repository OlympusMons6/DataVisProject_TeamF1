import { FORMAT } from "../config.js";
export function updateMetrics(data){
  if(!data.length)return;
  const first=data[0],last=data.at(-1);
  const peak=data.reduce((best,row)=>row.hospitalisations>best.hospitalisations?row:best,data[0]);
  const change=last.hospitalisations-first.hospitalisations;
  const pct=first.hospitalisations?(change/first.hospitalisations)*100:0;
  document.querySelector("#metric-latest").textContent=FORMAT.format(last.hospitalisations);
  document.querySelector("#metric-latest-label").textContent=`HOSPITALISATIONS · ${last.year}`;
  document.querySelector("#metric-latest-foot").textContent=`Latest year in selected period`;
  document.querySelector("#metric-peak-year").textContent=peak.year;
  document.querySelector("#metric-peak-value").textContent=`${FORMAT.format(peak.hospitalisations)} hospitalisations`;
  document.querySelector("#metric-change").textContent=`${change>=0?"+":""}${FORMAT.format(change)}`;
  document.querySelector("#metric-change-foot").textContent=`${pct>=0?"+":""}${pct.toFixed(1)}% · ${first.year} to ${last.year}`;
  document.querySelector("#metric-years").textContent=data.length;
  document.querySelector("#metric-years-foot").textContent=`${first.year}–${last.year}`;
}
