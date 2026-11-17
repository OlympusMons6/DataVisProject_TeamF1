export function hideTooltip(selector="#chart-tooltip"){
  const node=document.querySelector(selector);
  if(node)node.style.display="none";
}
