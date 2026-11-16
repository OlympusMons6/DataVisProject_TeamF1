import { FORMAT } from "../config.js";

export function renderQ2Charts({absolute,percentage}){
  renderDivergingBars("#q2-absolute-chart",absolute,{
    value:d=>d.absoluteChange,
    format:v=>`${v>0?"+":""}${FORMAT.format(v)}`,
    axisLabel:"Change in hospitalisations",
    label:"Absolute change"
  });
  renderDivergingBars("#q2-percentage-chart",percentage,{
    value:d=>d.percentageChange,
    format:v=>`${v>0?"+":""}${v.toFixed(1)}%`,
    axisLabel:"Percentage change",
    label:"Percentage change"
  });
  const largest=absolute.reduce((a,b)=>b.absoluteChange>a.absoluteChange?b:a,absolute[0]);
  const title=document.querySelector("#q2-insight-title");
  const copy=document.querySelector("#q2-insight-copy");
  title.textContent=`${largest.roadUser} recorded the largest absolute increase.`;
  copy.textContent=`Recorded hospitalisations for this category increased by ${FORMAT.format(largest.absoluteChange)} between 2011 and 2021 (${largest.percentageChange.toFixed(1)}%). This is a change in recorded counts, not a measure of individual road-user risk.`;
}

function renderDivergingBars(selector,rows,config){
  const host=d3.select(selector);host.selectAll("*").remove();
  const node=host.node();
  const width=Math.max(310,node.getBoundingClientRect().width);
  const margin={top:16,right:58,bottom:48,left:width<440?118:150};
  const rowHeight=31;
  const height=margin.top+margin.bottom+rows.length*rowHeight;
  const innerW=width-margin.left-margin.right;
  const innerH=rows.length*rowHeight;
  const data=[...rows].sort((a,b)=>config.value(a)-config.value(b));
  const maxAbs=d3.max(data,d=>Math.abs(config.value(d)))||1;
  const x=d3.scaleLinear().domain([-maxAbs*1.18,maxAbs*1.18]).range([0,innerW]);
  const y=d3.scaleBand().domain(data.map(d=>d.roadUser)).range([0,innerH]).padding(.28);
  const svg=host.append("svg").attr("viewBox",`0 0 ${width} ${height}`).attr("role","img");
  svg.append("title").text(`${config.label} by road-user category, 2011 to 2021`);
  const plot=svg.append("g").attr("transform",`translate(${margin.left},${margin.top})`);
  plot.append("g").attr("class","q2-grid").call(d3.axisBottom(x).ticks(4).tickSize(innerH).tickFormat(""));
  plot.append("line").attr("class","q2-zero-line").attr("x1",x(0)).attr("x2",x(0)).attr("y1",0).attr("y2",innerH);
  plot.append("g").attr("class","q2-axis").call(d3.axisLeft(y).tickSize(0).tickPadding(9));
  plot.append("g").attr("class","q2-axis").attr("transform",`translate(0,${innerH})`).call(d3.axisBottom(x).ticks(4).tickFormat(config.format));
  const tooltip=d3.select("body").selectAll(".q2-tooltip").data([null]).join("div").attr("class","q2-tooltip").attr("role","status");
  plot.selectAll(".q2-bar").data(data).join("rect").attr("class","q2-bar")
    .attr("x",d=>Math.min(x(0),x(config.value(d))))
    .attr("y",d=>y(d.roadUser))
    .attr("width",d=>Math.abs(x(config.value(d))-x(0)))
    .attr("height",y.bandwidth())
    .attr("rx",3)
    .attr("fill",d=>config.value(d)>=0?"#3182BD":"#E6550D")
    .attr("tabindex",0)
    .attr("aria-label",d=>`${d.roadUser}: ${config.format(config.value(d))}`)
    .on("pointerenter focus",(event,d)=>showTip(event,d,tooltip,config))
    .on("pointermove",(event,d)=>showTip(event,d,tooltip,config))
    .on("pointerleave blur",()=>tooltip.style("display","none"));
  plot.selectAll(".q2-value-label").data(data).join("text").attr("class","q2-value-label")
    .attr("x",d=>config.value(d)>=0?x(config.value(d))+5:x(config.value(d))-5)
    .attr("y",d=>y(d.roadUser)+y.bandwidth()/2+3)
    .attr("text-anchor",d=>config.value(d)>=0?"start":"end")
    .text(d=>config.format(config.value(d)));
  svg.append("text").attr("class","q2-axis-title").attr("x",margin.left+innerW/2).attr("y",height-7).attr("text-anchor","middle").text(config.axisLabel);
}
function showTip(event,d,tooltip,config){
  tooltip.html(`<strong>${d.roadUser}</strong><span>${config.label}: ${config.format(config.value(d))}</span><span>2011: ${FORMAT.format(d.count2011)}</span><span>2021: ${FORMAT.format(d.count2021)}</span>`)
    .style("display","block")
    .style("left",`${Math.min(event.clientX+14,window.innerWidth-215)}px`)
    .style("top",`${Math.min(event.clientY+14,window.innerHeight-130)}px`);
}
