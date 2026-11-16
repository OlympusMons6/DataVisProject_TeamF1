import { FORMAT } from "../config.js";

const COLORS=["#3182BD","#6BAED6","#9ECAE1","#2171B5"];
export function renderQ5Charts(rows){
  renderQ5MetricBars(rows,"#q5-hospitalisations-chart","hospitalisations","Hospitalisations · 2021",COLORS[0],d=>FORMAT.format(d.hospitalisations));
  renderQ5MetricBars(rows,"#q5-bed-days-chart","bedDays","Total bed days · 2021",COLORS[1],d=>FORMAT.format(d.bedDays));
  renderQ5MetricBars(rows,"#q5-average-chart","bedDaysPerHospitalisation","Average bed days per hospitalisation · 2021",COLORS[2],d=>d.bedDaysPerHospitalisation.toFixed(2));
  const highest=rows.reduce((a,b)=>b.bedDaysPerHospitalisation>a.bedDaysPerHospitalisation?b:a);
  const most=rows.reduce((a,b)=>b.hospitalisations>a.hospitalisations?b:a);
  document.querySelector("#q5-insight-title").textContent=`${highest.roadUser} had the highest average bed days per hospitalisation.`;
  document.querySelector("#q5-insight-copy").textContent=`In the supplied 2021 First Nations dataset, ${most.roadUser} recorded the largest number of hospitalisations (${FORMAT.format(most.hospitalisations)}), while ${highest.roadUser} had the highest average bed days per hospitalisation (${highest.bedDaysPerHospitalisation.toFixed(2)}).`;
}
function renderQ5MetricBars(rows,selector,key,axisTitle,fill,label){
  const host=d3.select(selector);host.selectAll("*").remove();
  const data=[...rows].sort((a,b)=>b[key]-a[key]);
  const width=Math.max(320,host.node().getBoundingClientRect().width),margin={top:12,right:78,bottom:38,left:230},rh=48,height=margin.top+margin.bottom+rh*data.length;
  const iw=width-margin.left-margin.right,ih=rh*data.length;
  const x=d3.scaleLinear().domain([0,d3.max(data,d=>d[key])*1.16]).nice().range([0,iw]);
  const y=d3.scaleBand().domain(data.map(d=>d.roadUser)).range([0,ih]).padding(.28);
  const svg=host.append("svg").attr("viewBox",`0 0 ${width} ${height}`);
  svg.append("title").text(axisTitle+" by road-user category");
  const plot=svg.append("g").attr("transform",`translate(${margin.left},${margin.top})`);
  plot.append("g").attr("class","q2-grid").call(d3.axisBottom(x).ticks(4).tickSize(ih).tickFormat(""));
  plot.append("g").attr("class","q2-axis").call(d3.axisLeft(y).tickSize(0));
  plot.selectAll("rect").data(data).join("rect").attr("x",0).attr("y",d=>y(d.roadUser)).attr("width",d=>x(d[key])).attr("height",y.bandwidth()).attr("rx",3).attr("fill",fill)
    .attr("tabindex",0)
    .on("pointerenter focus",(event,d)=>showTip(event,d.roadUser,label(d)))
    .on("pointermove",moveTip).on("pointerleave blur",hideTip);
  plot.selectAll("text.value").data(data).join("text").attr("class","q2-value-label").attr("x",d=>x(d[key])+6).attr("y",d=>y(d.roadUser)+y.bandwidth()/2+3).text(label);
  svg.append("text").attr("class","q2-axis-title").attr("x",margin.left+iw/2).attr("y",height-5).attr("text-anchor","middle").text(axisTitle);
}
function showTip(event,title,detail){d3.select("body").selectAll(".q5-tooltip").data([null]).join("div").attr("class","q2-tooltip q5-tooltip").style("display","block").html(`<strong>${title}</strong><span>${detail}</span>`);moveTip(event);}
function moveTip(event){d3.select(".q5-tooltip").style("left",`${Math.min(event.clientX+14,window.innerWidth-260)}px`).style("top",`${Math.min(event.clientY+14,window.innerHeight-90)}px`);}
function hideTip(){d3.select(".q5-tooltip").style("display","none");}
