import { DATA_PATHS } from "../config.js";

export async function loadNationalData() {
  const rows = await d3.csv(DATA_PATHS.q1, d => ({
    year:+d.year,
    hospitalisations:+d.hospitalisations,
    previousYearHospitalisations:d.previous_year_hospitalisations===""?null:+d.previous_year_hospitalisations,
    annualChange:d.annual_change===""?null:+d.annual_change,
    annualChangePct:d.annual_change_pct===""?null:+d.annual_change_pct,
    reportingNote:d.reporting_note?.trim()||null
  }));
  if(!rows.length || rows.some(d=>!Number.isFinite(d.year)||!Number.isFinite(d.hospitalisations))) throw new Error("Q1 data is empty or invalid.");
  return rows.sort((a,b)=>a.year-b.year);
}

export async function loadQ2Data() {
  const [absolute, percentage] = await Promise.all([
    d3.csv(DATA_PATHS.q2Absolute, d=>({
      roadUser:d.road_user,
      count2011:+d.count_2011,
      count2021:+d.count_2021,
      absoluteChange:+d.absolute_change,
      percentageChange:+d.percentage_change
    })),
    d3.csv(DATA_PATHS.q2Percentage, d=>({
      roadUser:d.road_user,
      count2011:+d.count_2011,
      count2021:+d.count_2021,
      absoluteChange:+d.absolute_change,
      percentageChange:+d.percentage_change
    }))
  ]);
  for(const rows of [absolute,percentage]){
    if(!rows.length || rows.some(d=>!d.roadUser || !Number.isFinite(d.absoluteChange) || !Number.isFinite(d.percentageChange))) {
      throw new Error("Q2 data is empty or contains invalid values.");
    }
  }
  return {absolute,percentage};
}


export async function loadQ3Data() {
  const rows = await d3.csv("data/q3_state_annual_trends_2018_2021.csv", d => ({
    year: Number(d.year),
    state: d.state,
    hospitalisations: Number(d.hospitalisations)
  }));
  if (!rows.length || rows.some(d => !Number.isFinite(d.year) || !Number.isFinite(d.hospitalisations) || !d.state)) {
    throw new Error("Q3 state dataset is empty or invalid.");
  }
  return rows;
}


export async function loadQ4Data() {
  const rows = await d3.csv("data/q4_remoteness_hospitalisation_burden_2021.csv", d => ({
    remoteness: d.remoteness,
    bedDays: Number(d.bed_days),
    hospitalisations: Number(d.hospitalisations),
    bedDaysPerHospitalisation: Number(d.bed_days_per_hospitalisation)
  }));
  if (!rows.length || rows.some(d => !d.remoteness || !Number.isFinite(d.bedDays) || !Number.isFinite(d.hospitalisations) || !Number.isFinite(d.bedDaysPerHospitalisation))) {
    throw new Error("Q4 remoteness dataset is empty or invalid.");
  }
  return rows;
}


export async function loadQ5Data() {
  const rows = await d3.csv("data/q5_first_nations_road_user_outcomes_2021.csv", d => ({
    roadUser: d.road_user,
    hospitalisations: Number(d.hospitalisations),
    bedDays: Number(d.bed_days),
    bedDaysPerHospitalisation: Number(d.bed_days_per_hospitalisation)
  }));
  if (!rows.length || rows.some(d => !d.roadUser || !Number.isFinite(d.hospitalisations) || !Number.isFinite(d.bedDays) || !Number.isFinite(d.bedDaysPerHospitalisation))) {
    throw new Error("Q5 First Nations dataset is empty or invalid.");
  }
  return rows;
}
