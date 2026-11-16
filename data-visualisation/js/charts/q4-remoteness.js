import { FORMAT } from "../config.js";

const order=["Major Cities","Regional","Remote","Other or unknown"];
export function renderQ4Charts(rows){
  renderBurden(rows);
  renderBedDays(rows);
  renderStay(rows);
  const city=rows.find(d=>d.remoteness==="Major Cities");
  const remote=rows.find(d=>d.remoteness==="Remote");
  const regional=rows.find(d=>d.remoteness==="Regional");
  const highest=rows.reduce((a,b)=>b.bedDaysPerHospitalisation>a.bedDaysPerHospitalisation?b:a);
  document.querySelector("#q4-insight-title").textContent=`${highest.remoteness} recorded the highest average bed days per hospitalisation.`;
  document.querySelector("#q4-insight-copy").textContent=`In 2021, the average was ${highest.bedDaysPerHospitalisation.toFixed(2)} bed days per hospitalisation in ${highest.remoteness}, compared with ${city.bedDaysPerHospitalisation.toFixed(2)} in Major Cities. Regional and Remote areas recorded ${regional.bedDaysPerHospitalisation.toFixed(2)} and ${remote.bedDaysPerHospitalisation.toFixed(2)} respectively.`;
}
function renderBurden(rows){
  const host=d3.select("#q4-burden-chart");host.selectAll("*").remove();
  const data=order.map(k=>rows.find(d=>d.remoteness===k)).filter(Boolean);
  const width=Math.max(320,host.node().getBoundingClientRect().width),margin={top:12,right:75,bottom:35,left:120},rh=48,height=margin.top+margin.bottom+rh*data.length;
  const iw=width-margin.left-margin.right,ih=rh*data.length;
  const x=d3.scaleLinear().domain([0,d3.max(data,d=>d.hospitalisations)*1.16]).nice().range([0,iw]);
  const y=d3.scaleBand().domain(data.map(d=>d.remoteness)).range([0,ih]).padding(.28);
  const svg=host.append("svg").attr("viewBox",`0 0 ${width} ${height}`);
  svg.append("title").text("2021 hospitalisations by remoteness area");
  const plot=svg.append("g").attr("transform",`translate(${margin.left},${margin.top})`);
  plot.append("g").attr("class","q2-grid").call(d3.axisBottom(x).ticks(4).tickSize(ih).tickFormat(""));
  plot.append("g").attr("class","q2-axis").call(d3.axisLeft(y).tickSize(0));
  plot.selectAll("rect").data(data).join("rect").attr("x",0).attr("y",d=>y(d.remoteness)).attr("width",d=>x(d.hospitalisations)).attr("height",y.bandwidth()).attr("rx",3).attr("fill","#3182BD")
    .on("pointerenter",(event,d)=>tip(event,d.remoteness,`${FORMAT.format(d.hospitalisations)} hospitalisations`)).on("pointermove",moveTip).on("pointerleave",hideTip);
  plot.selectAll("text.value").data(data).join("text").attr("class","q2-value-label").attr("x",d=>x(d.hospitalisations)+6).attr("y",d=>y(d.remoteness)+y.bandwidth()/2+3).text(d=>FORMAT.format(d.hospitalisations));
  svg.append("text").attr("class","q2-axis-title").attr("x",margin.left+iw/2).attr("y",height-5).attr("text-anchor","middle").text("Hospitalisations · 2021");
}

function renderBedDays(rows){
  const host=d3.select("#q4-bed-days-chart");host.selectAll("*").remove();
  const data=order.map(k=>rows.find(d=>d.remoteness===k)).filter(Boolean);
  const width=Math.max(320,host.node().getBoundingClientRect().width),margin={top:12,right:80,bottom:35,left:120},rh=48,height=margin.top+margin.bottom+rh*data.length;
  const iw=width-margin.left-margin.right,ih=rh*data.length;
  const x=d3.scaleLinear().domain([0,d3.max(data,d=>d.bedDays)*1.16]).nice().range([0,iw]);
  const y=d3.scaleBand().domain(data.map(d=>d.remoteness)).range([0,ih]).padding(.28);
  const svg=host.append("svg").attr("viewBox",`0 0 ${width} ${height}`);
  svg.append("title").text("Total hospital bed days by remoteness area in 2021");
  const plot=svg.append("g").attr("transform",`translate(${margin.left},${margin.top})`);
  plot.append("g").attr("class","q2-grid").call(d3.axisBottom(x).ticks(4).tickSize(ih).tickFormat(""));
  plot.append("g").attr("class","q2-axis").call(d3.axisLeft(y).tickSize(0));
  plot.selectAll("rect").data(data).join("rect").attr("x",0).attr("y",d=>y(d.remoteness)).attr("width",d=>x(d.bedDays)).attr("height",y.bandwidth()).attr("rx",3).attr("fill","#6BAED6")
    .on("pointerenter",(event,d)=>tip(event,d.remoteness,`${FORMAT.format(d.bedDays)} total bed days`)).on("pointermove",moveTip).on("pointerleave",hideTip);
  plot.selectAll("text.value").data(data).join("text").attr("class","q2-value-label").attr("x",d=>x(d.bedDays)+6).attr("y",d=>y(d.remoteness)+y.bandwidth()/2+3).text(d=>FORMAT.format(d.bedDays));
  svg.append("text").attr("class","q2-axis-title").attr("x",margin.left+iw/2).attr("y",height-5).attr("text-anchor","middle").text("Total bed days · 2021");
}

function renderStay(rows){
  const host=d3.select("#q4-stay-chart");host.selectAll("*").remove();
  const data=order.map(k=>rows.find(d=>d.remoteness===k)).filter(Boolean);
  const width=Math.max(320,host.node().getBoundingClientRect().width),margin={top:12,right:75,bottom:35,left:120},rh=48,height=margin.top+margin.bottom+rh*data.length;
  const iw=width-margin.left-margin.right,ih=rh*data.length;
  const x=d3.scaleLinear().domain([0,d3.max(data,d=>d.bedDaysPerHospitalisation)*1.2]).nice().range([0,iw]);
  const y=d3.scaleBand().domain(data.map(d=>d.remoteness)).range([0,ih]).padding(.28);
  const svg=host.append("svg").attr("viewBox",`0 0 ${width} ${height}`);
  svg.append("title").text("Average bed days per hospitalisation by remoteness area in 2021");
  const plot=svg.append("g").attr("transform",`translate(${margin.left},${margin.top})`);
  plot.append("g").attr("class","q2-grid").call(d3.axisBottom(x).ticks(4).tickSize(ih).tickFormat(""));
  plot.append("g").attr("class","q2-axis").call(d3.axisLeft(y).tickSize(0));
  plot.selectAll("rect").data(data).join("rect").attr("x",0).attr("y",d=>y(d.remoteness)).attr("width",d=>x(d.bedDaysPerHospitalisation)).attr("height",y.bandwidth()).attr("rx",3).attr("fill","#9ECAE1")
    .on("pointerenter",(event,d)=>tip(event,d.remoteness,`${d.bedDaysPerHospitalisation.toFixed(2)} bed days per hospitalisation · ${FORMAT.format(d.bedDays)} total bed days`)).on("pointermove",moveTip).on("pointerleave",hideTip);
  plot.selectAll("text.value").data(data).join("text").attr("class","q2-value-label").attr("x",d=>x(d.bedDaysPerHospitalisation)+6).attr("y",d=>y(d.remoteness)+y.bandwidth()/2+3).text(d=>d.bedDaysPerHospitalisation.toFixed(2));
  svg.append("text").attr("class","q2-axis-title").attr("x",margin.left+iw/2).attr("y",height-5).attr("text-anchor","middle").text("Average bed days per hospitalisation · 2021");
}
function tip(event,title,detail){d3.select("body").selectAll(".q4-tooltip").data([null]).join("div").attr("class","q2-tooltip q4-tooltip").style("display","block").html(`<strong>${title}</strong><span>${detail}</span>`);moveTip(event);}
function moveTip(event){d3.select(".q4-tooltip").style("left",`${Math.min(event.clientX+14,window.innerWidth-240)}px`).style("top",`${Math.min(event.clientY+14,window.innerHeight-90)}px`);}
function hideTip(){d3.select(".q4-tooltip").style("display","none");}
