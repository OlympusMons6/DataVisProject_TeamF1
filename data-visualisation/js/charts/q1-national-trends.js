import { POLICY_EVENTS, FORMAT } from "../config.js";

export function renderQ1Chart(data){
  const host=d3.select("#q1-chart");host.selectAll("*").remove();
  const tooltip=document.querySelector("#chart-tooltip");
  const width=Math.max(320,host.node().getBoundingClientRect().width);
  const height=width<520?285:355;
  const margin={top:42,right:25,bottom:45,left:65};
  const iw=width-margin.left-margin.right,ih=height-margin.top-margin.bottom;
  const svg=host.append("svg").attr("viewBox",`0 0 ${width} ${height}`).attr("role","img");
  const chartTitle=`Annual hospitalised road traffic injuries in Australia, ${data[0].year} to ${data.at(-1).year}`;
  host.attr("aria-label",chartTitle);
  svg.append("title").text(chartTitle);
  const defs=svg.append("defs");
  const grad=defs.append("linearGradient").attr("id","q1-area-gradient").attr("x1","0").attr("x2","0").attr("y1","0").attr("y2","1");
  grad.append("stop").attr("offset","0%").attr("stop-color","var(--chart-blue)").attr("stop-opacity",.28);
  grad.append("stop").attr("offset","100%").attr("stop-color","var(--chart-blue)").attr("stop-opacity",0);
  const x=d3.scaleLinear().domain(d3.extent(data,d=>d.year)).range([0,iw]);
  const ext=d3.extent(data,d=>d.hospitalisations);
  const y=d3.scaleLinear().domain([Math.floor((ext[0]-1200)/2000)*2000,Math.ceil((ext[1]+1200)/2000)*2000]).nice().range([ih,0]);
  const plot=svg.append("g").attr("transform",`translate(${margin.left},${margin.top})`);
  plot.append("g").attr("class","grid-line").call(d3.axisLeft(y).ticks(5).tickSize(-iw).tickFormat(""));
  plot.append("g").attr("class","axis").attr("transform",`translate(0,${ih})`).call(d3.axisBottom(x).ticks(Math.min(data.length,11)).tickFormat(d3.format("d")).tickSizeOuter(0));
  plot.append("g").attr("class","axis").call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(",")));
  POLICY_EVENTS.forEach(e=>{
    if(e.year<data[0].year||e.year>data.at(-1).year)return;
    const bw=Math.max(13,iw/45);
    plot.append("rect").attr("class","policy-band").attr("x",x(e.year)-bw/2).attr("y",0).attr("width",bw).attr("height",ih);
    plot.append("text").attr("class","policy-label").attr("transform",`translate(${x(e.year)+4},${ih-8}) rotate(-90)`).attr("text-anchor","start").text(e.label);
  });
  const area=d3.area().x(d=>x(d.year)).y0(ih).y1(d=>y(d.hospitalisations)).curve(d3.curveMonotoneX);
  const line=d3.line().x(d=>x(d.year)).y(d=>y(d.hospitalisations)).curve(d3.curveMonotoneX);
  plot.append("path").datum(data).attr("class","area-path").attr("d",area);
  plot.append("path").datum(data).attr("class","line-path").attr("d",line);
  plot.selectAll(".data-point").data(data).join("circle").attr("class","data-point")
    .attr("cx",d=>x(d.year)).attr("cy",d=>y(d.hospitalisations)).attr("r",width<520?4:5)
    .attr("tabindex",0).attr("aria-label",d=>`${d.year}: ${FORMAT.format(d.hospitalisations)} hospitalisations`)
    .on("pointerenter focus",(event,d)=>showTooltip(event,d,tooltip))
    .on("pointermove",(event,d)=>showTooltip(event,d,tooltip))
    .on("pointerleave blur",()=>tooltip.style.display="none");
  svg.append("text").attr("x",margin.left).attr("y",16).attr("fill","#9AA8B8").attr("font-size",9).text("HOSPITALISATIONS");
  svg.append("text").attr("x",width-margin.right).attr("y",height-6).attr("fill","#9AA8B8").attr("font-size",9).attr("text-anchor","end").text("YEAR");
}
function showTooltip(event,d,tooltip){
  const delta=d.annualChangePct==null?"—":`${d.annualChangePct>=0?"+":""}${d.annualChangePct.toFixed(2)}%`;
  tooltip.innerHTML=`<strong>${d.year}</strong><span>${FORMAT.format(d.hospitalisations)} hospitalisations</span><span>Annual change: ${delta}</span>${d.reportingNote?`<span>${d.reportingNote}</span>`:""}`;
  tooltip.style.display="block";
  const rect=document.querySelector(".chart-wrap").getBoundingClientRect();
  const px=event.clientX-rect.left,py=event.clientY-rect.top;
  tooltip.style.left=`${Math.max(8,Math.min(px+14,rect.width-185))}px`;
  tooltip.style.top=`${Math.max(8,py-20)}px`;
}
