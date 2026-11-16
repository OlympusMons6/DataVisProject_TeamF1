import { FORMAT } from "../config.js";

const COLORS=["#9ECAE1","#3182BD","#6BAED6","#2171B5"];

export function renderQ3Charts(rows,startYear,endYear){
  const selected=rows.filter(d=>d.year>=startYear&&d.year<=endYear);
  renderGroupedChart(selected,startYear,endYear);
  renderChangeChart(rows,startYear,endYear);
  updateQ3Insight(rows,startYear,endYear);
}

function renderGroupedChart(rows,startYear,endYear){
  const host=d3.select("#q3-grouped-chart");host.selectAll("*").remove();
  if(!rows.length){host.html('<p class="q2-empty">No Q3 observations are available for this year range.</p>');return;}
  const width=Math.max(320,host.node().getBoundingClientRect().width);
  const states=["NSW","Vic","Qld","WA","SA","Tas","ACT","NT"];
  const years=[...new Set(rows.map(d=>d.year))].sort((a,b)=>a-b);
  const margin={top:22,right:18,bottom:62,left:58},height=390;
  const iw=width-margin.left-margin.right,ih=height-margin.top-margin.bottom;
  const x0=d3.scaleBand().domain(states).range([0,iw]).paddingInner(.2);
  const x1=d3.scaleBand().domain(years).range([0,x0.bandwidth()]).padding(.08);
  const ymax=d3.max(rows,d=>d.hospitalisations)*1.12;
  const y=d3.scaleLinear().domain([0,ymax]).nice().range([ih,0]);
  const svg=host.append("svg").attr("viewBox",`0 0 ${width} ${height}`);
  svg.append("title").text(`Hospitalisations by Australian jurisdiction from ${startYear} to ${endYear}`);
  const plot=svg.append("g").attr("transform",`translate(${margin.left},${margin.top})`);
  plot.append("g").attr("class","q2-grid").call(d3.axisLeft(y).ticks(5).tickSize(-iw).tickFormat(""));
  plot.append("g").attr("class","q2-axis").call(d3.axisLeft(y).ticks(5).tickFormat(d3.format("~s")));
  plot.append("g").attr("class","q2-axis").attr("transform",`translate(0,${ih})`).call(d3.axisBottom(x0).tickSizeOuter(0));
  const groups=plot.selectAll(".q3-state-group").data(states).join("g").attr("transform",s=>`translate(${x0(s)},0)`);
  groups.selectAll("rect").data(state=>years.map(year=>({state,year,row:rows.find(d=>d.state===state&&d.year===year)})).filter(d=>d.row))
    .join("rect").attr("x",d=>x1(d.year)).attr("y",d=>y(d.row.hospitalisations))
    .attr("width",x1.bandwidth()).attr("height",d=>ih-y(d.row.hospitalisations))
    .attr("rx",2).attr("fill",d=>COLORS[years.indexOf(d.year)%COLORS.length])
    .attr("tabindex",0)
    .on("pointerenter focus",(event,d)=>showQ3Tip(event,`${d.state} · ${d.year}`,`${FORMAT.format(d.row.hospitalisations)} hospitalisations`))
    .on("pointermove",(event,d)=>positionQ3Tip(event))
    .on("pointerleave blur",hideQ3Tip);
  const legend=svg.append("g").attr("transform",`translate(${margin.left},${height-13})`);
  years.forEach((year,i)=>{
    const item=legend.append("g").attr("transform",`translate(${i*90},0)`);
    item.append("rect").attr("width",9).attr("height",9).attr("y",-8).attr("rx",2).attr("fill",COLORS[i%COLORS.length]);
    item.append("text").attr("x",14).attr("y",0).attr("fill","#9AA8B8").attr("font-size",9).text(year);
  });
}

function renderChangeChart(rows,startYear,endYear){
  const host=d3.select("#q3-change-chart");host.selectAll("*").remove();
  const states=["NSW","Vic","Qld","WA","SA","Tas","ACT","NT"];
  const changes=states.map(state=>{
    const a=rows.find(d=>d.state===state&&d.year===startYear);
    const b=rows.find(d=>d.state===state&&d.year===endYear);
    return a&&b?{state,change:b.hospitalisations-a.hospitalisations,start:a.hospitalisations,end:b.hospitalisations}:null;
  }).filter(Boolean).sort((a,b)=>a.change-b.change);
  if(!changes.length){host.html('<p class="q2-empty">Select a period within 2018–2021 to compare jurisdictions.</p>');return;}
  const width=Math.max(320,host.node().getBoundingClientRect().width);
  const margin={top:12,right:58,bottom:38,left:58},rh=34,height=margin.top+margin.bottom+changes.length*rh;
  const iw=width-margin.left-margin.right,ih=changes.length*rh;
  const max=d3.max(changes,d=>Math.abs(d.change))||1;
  const x=d3.scaleLinear().domain([-max*1.2,max*1.2]).range([0,iw]);
  const y=d3.scaleBand().domain(changes.map(d=>d.state)).range([0,ih]).padding(.27);
  const svg=host.append("svg").attr("viewBox",`0 0 ${width} ${height}`);
  svg.append("title").text(`Change in hospitalisations by jurisdiction between ${startYear} and ${endYear}`);
  const plot=svg.append("g").attr("transform",`translate(${margin.left},${margin.top})`);
  plot.append("g").attr("class","q2-grid").call(d3.axisBottom(x).ticks(4).tickSize(ih).tickFormat(""));
  plot.append("line").attr("class","q2-zero-line").attr("x1",x(0)).attr("x2",x(0)).attr("y1",0).attr("y2",ih);
  plot.append("g").attr("class","q2-axis").call(d3.axisLeft(y).tickSize(0));
  plot.selectAll("rect").data(changes).join("rect").attr("x",d=>Math.min(x(0),x(d.change)))
    .attr("y",d=>y(d.state)).attr("width",d=>Math.abs(x(d.change)-x(0)))
    .attr("height",y.bandwidth()).attr("rx",3)
    .attr("fill",d=>d.change>=0?"#3182BD":"#E6550D").attr("tabindex",0)
    .on("pointerenter focus",(event,d)=>showQ3Tip(event,d.state,`${d.change>=0?"+":""}${FORMAT.format(d.change)} hospitalisations · ${startYear} to ${endYear}`))
    .on("pointermove",positionQ3Tip).on("pointerleave blur",hideQ3Tip);
  plot.selectAll("text.value").data(changes).join("text").attr("class","q2-value-label")
    .attr("x",d=>d.change>=0?x(d.change)+5:x(d.change)-5)
    .attr("y",d=>y(d.state)+y.bandwidth()/2+3)
    .attr("text-anchor",d=>d.change>=0?"start":"end")
    .text(d=>`${d.change>0?"+":""}${FORMAT.format(d.change)}`);
  svg.append("text").attr("class","q2-axis-title").attr("x",margin.left+iw/2).attr("y",height-7).attr("text-anchor","middle").text(`Change in hospitalisations · ${startYear} to ${endYear}`);
}
function showQ3Tip(event,title,detail){
  const tip=d3.select("body").selectAll(".q3-tooltip").data([null]).join("div").attr("class","q2-tooltip q3-tooltip")
    .style("display","block").html(`<strong>${title}</strong><span>${detail}</span>`);
  positionQ3Tip(event);
}
function positionQ3Tip(event){
  d3.select(".q3-tooltip").style("left",`${Math.min(event.clientX+14,window.innerWidth-220)}px`).style("top",`${Math.min(event.clientY+14,window.innerHeight-90)}px`);
}
function hideQ3Tip(){d3.select(".q3-tooltip").style("display","none");}
function updateQ3Insight(rows,startYear,endYear){
  const changes=["NSW","Vic","Qld","WA","SA","Tas","ACT","NT"].map(state=>{
    const a=rows.find(d=>d.state===state&&d.year===startYear),b=rows.find(d=>d.state===state&&d.year===endYear);
    return a&&b?{state,change:b.hospitalisations-a.hospitalisations}:null;
  }).filter(Boolean);
  if(!changes.length)return;
  const max=changes.reduce((a,b)=>b.change>a.change?b:a);
  const min=changes.reduce((a,b)=>b.change<a.change?b:a);
  document.querySelector("#q3-insight-title").textContent=`${max.state} had the largest increase; ${min.state} had the largest decrease.`;
  document.querySelector("#q3-insight-copy").textContent=`Between ${startYear} and ${endYear}, recorded hospitalisations changed by ${max.change>=0?"+":""}${FORMAT.format(max.change)} in ${max.state} and ${FORMAT.format(min.change)} in ${min.state}. These are counts, not population-adjusted rates.`;
}
