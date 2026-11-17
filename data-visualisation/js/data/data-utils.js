export function formatNumber(value){
  return new Intl.NumberFormat("en-AU").format(value);
}
export function percentageChange(start,end){
  return start===0?null:((end-start)/start)*100;
}
