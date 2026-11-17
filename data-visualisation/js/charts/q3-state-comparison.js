import { FORMAT } from "../config.js";

const COLORS=["var(--chart-blue-light)","var(--chart-blue)","var(--chart-mid)","var(--chart-deep)"];

export function renderQ3Charts(rows,startYear,endYear){
  const selected=rows.filter(d=>d.year>=startYear&&d.year<=endYear);
  renderGroupedChart(selected,startYear,endYear);
  renderChangeChart(rows,startYear,endYear);
  updateQ3Insight(rows,startYear,endYear);
  renderQ3Map(rows,endYear);
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
    .attr("fill",d=>d.change>=0?"var(--chart-positive)":"var(--chart-negative)").attr("tabindex",0)
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


const STATE_NAME_TO_ABBR = {
  "New South Wales":"NSW",
  "Victoria":"Vic",
  "Queensland":"Qld",
  "South Australia":"SA",
  "Western Australia":"WA",
  "Tasmania":"Tas",
  "Northern Territory":"NT",
  "Australian Capital Territory":"ACT"
};
let q3BoundaryPromise;
let latestQ3MapRows=[];
let latestQ3MapYear=2021;
document.addEventListener("colourmodechange",()=>{
  if(latestQ3MapRows.length) renderQ3Map(latestQ3MapRows,latestQ3MapYear);
});
function loadQ3Boundaries(){
  if(!q3BoundaryPromise){
    q3BoundaryPromise=fetch("data/australia-states.geojson")
      .then(response=>{
        if(!response.ok) throw new Error(`Local ABS boundary file returned ${response.status}`);
        return response.json();
      });
  }
  return q3BoundaryPromise;
}
function cssColour(name,fallback){
  return getComputedStyle(document.body).getPropertyValue(name).trim()||fallback;
}
async function renderQ3Map(rows,year){
  latestQ3MapRows=rows;
  latestQ3MapYear=year;
  const host=d3.select("#q3-map-chart");
  host.selectAll("*").remove();
  const yearSelect=document.querySelector("#q3-map-year");
  if(yearSelect&&!yearSelect.dataset.bound){
    yearSelect.dataset.bound="true";
    yearSelect.addEventListener("change",()=>renderQ3Map(rows,Number(yearSelect.value)));
  }
  if(yearSelect)yearSelect.value=String(year);
  const data=rows.filter(d=>d.year===year);
  if(!data.length){
    host.html('<p class="map-error">No state-level observations are available for this year.</p>');
    return;
  }
  try{
    const geo=await loadQ3Boundaries();
    const features=geo.features.filter(f=>STATE_NAME_TO_ABBR[f.properties.name]);
    if(features.length!==8) throw new Error(`Expected 8 state and territory boundaries, received ${features.length}`);
    const width=Math.max(320,host.node().getBoundingClientRect().width);
    const height=440;
    const values=new Map(data.map(d=>[d.state,d.hospitalisations]));
    const max=d3.max(data,d=>d.hospitalisations)||1;
    const low=cssColour("--surface-raised","#2B3036");
    const high=cssColour("--chart-blue","#3182BD");
    const colour=d3.scaleSequential().domain([0,max])
      .interpolator(d3.interpolateRgb(low,high));
    // ABS geometry is pre-projected to GDA2020 / Australian Albers (EPSG:3577).
    // Use a planar identity projection so D3 does not reinterpret polygon rings
    // as spherical complements or introduce a globe-shaped clipping artefact.
    const projection=d3.geoIdentity()
      .reflectY(true)
      .fitExtent([[24,28],[width-24,height-66]],{
        type:"FeatureCollection",features
      });
    // Keep the fitted projection's scale and translation together.
    // Multiplying the scale alone moves the map away from the fitted centre.
    const path=d3.geoPath(projection);
    const svg=host.append("svg")
      .attr("viewBox",`0 0 ${width} ${height}`)
      .attr("role","group")
      .attr("aria-label",`Map of Australian states and territories showing recorded hospitalisations in ${year}`);
    svg.append("text").attr("class","q3-tile-map-caption")
      .attr("x",width/2).attr("y",15).attr("text-anchor","middle")
      .text(`Recorded hospitalisations · ${year}`);
    const tip=d3.select("body").selectAll(".q3-map-tooltip").data([null]).join("div")
      .attr("class","q2-tooltip q3-map-tooltip");
    const regions=svg.append("g").selectAll("path").data(features).join("path")
      .attr("class","q3-map-region")
      .attr("d",path)
      .attr("fill",f=>colour(values.get(STATE_NAME_TO_ABBR[f.properties.name])??0))
      .attr("tabindex",0).attr("role","button")
      .attr("aria-label",f=>{
        const abbr=STATE_NAME_TO_ABBR[f.properties.name];
        return `${f.properties.name}: ${FORMAT.format(values.get(abbr)??0)} hospitalisations in ${year}`;
      })
      .on("pointerenter focus",(event,f)=>{
        const abbr=STATE_NAME_TO_ABBR[f.properties.name];
        tip.html(`<strong>${f.properties.name}</strong><span>${FORMAT.format(values.get(abbr)??0)} hospitalisations · ${year}</span>`)
          .style("display","block");
        moveMapTip(event,tip);
      })
      .on("pointermove",event=>moveMapTip(event,tip))
      .on("pointerleave blur",()=>tip.style("display","none"));
    // Label major regions with small offsets to avoid crowding in the southeast.
    const labelOffsets={
      "Northern Territory":[0,-9],
      "Queensland":[12,-9],
      "New South Wales":[18,0],
      "Victoria":[18,15],
      "South Australia":[-12,10],
      "Tasmania":[12,20],
      "Western Australia":[0,0]
    };
    const labelFeatures=features.filter(f=>STATE_NAME_TO_ABBR[f.properties.name]!=="ACT");
    svg.append("g").selectAll("text").data(labelFeatures).join("text")
      .attr("class","q3-map-label")
      .attr("x",f=>path.centroid(f)[0]+(labelOffsets[f.properties.name]?.[0]||0))
      .attr("y",f=>path.centroid(f)[1]+(labelOffsets[f.properties.name]?.[1]||0))
      .attr("text-anchor","middle")
      .text(f=>STATE_NAME_TO_ABBR[f.properties.name]);
    const act=features.find(f=>STATE_NAME_TO_ABBR[f.properties.name]==="ACT");
    if(act){
      const [ax,ay]=path.centroid(act);
      svg.append("circle").attr("class","q3-map-act-marker").attr("cx",ax).attr("cy",ay)
        .attr("r",4).attr("tabindex",0).attr("role","button")
        .attr("aria-label",`Australian Capital Territory: ${FORMAT.format(values.get("ACT")??0)} hospitalisations in ${year}`)
        .on("pointerenter focus",event=>{
          tip.html(`<strong>Australian Capital Territory</strong><span>${FORMAT.format(values.get("ACT")??0)} hospitalisations · ${year}</span>`).style("display","block");
          moveMapTip(event,tip);
        }).on("pointermove",event=>moveMapTip(event,tip))
        .on("pointerleave blur",()=>tip.style("display","none"));
      svg.append("text").attr("class","q3-map-label q3-map-act-label")
        .attr("x",ax+9).attr("y",ay+4).text("ACT");
    }
    const legendWidth=190;
    const legend=svg.append("g")
      .attr("transform",`translate(${Math.max(18,(width-legendWidth)/2)},${height-20})`);
    const defs=svg.append("defs");
    const gradient=defs.append("linearGradient").attr("id","q3-abs-map-gradient");
    gradient.append("stop").attr("offset","0%").attr("stop-color",colour(0));
    gradient.append("stop").attr("offset","100%").attr("stop-color",colour(max));
    legend.append("rect").attr("width",legendWidth).attr("height",8).attr("rx",4)
      .attr("fill","url(#q3-abs-map-gradient)");
    legend.append("text").attr("class","q3-map-legend").attr("y",-5).text("Fewer");
    legend.append("text").attr("class","q3-map-legend").attr("x",legendWidth).attr("y",-5)
      .attr("text-anchor","end").text("More");
  }catch(error){
    console.error("Q3 ABS boundary map failed:",error);
    host.html('<p class="map-error">The local ABS boundary file could not be loaded. Check that data/australia-states.geojson is present and run the site through Live Server.</p>');
  }
}
function moveMapTip(event,tip){
  tip.style("left",`${Math.min(event.clientX+14,window.innerWidth-230)}px`)
    .style("top",`${Math.min(event.clientY+14,window.innerHeight-90)}px`);
}
