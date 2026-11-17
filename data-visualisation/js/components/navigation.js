export function setupNavigation(){
  const links=[...document.querySelectorAll(".main-nav a")];
  const sections=links.map(link=>document.querySelector(link.getAttribute("href"))).filter(Boolean);
  if(!("IntersectionObserver" in window))return;
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        links.forEach(link=>link.classList.toggle("active",link.getAttribute("href")===`#${entry.target.id}`));
      }
    });
  },{rootMargin:"-25% 0px -65% 0px"});
  sections.forEach(section=>observer.observe(section));
}
