// Animate native details without losing keyboard or accessibility behavior.
document.querySelectorAll('details').forEach(details=>{
 const summary=details.querySelector(':scope > summary');if(!summary)return;
 let animation=null,expanded=details.open;
 summary.addEventListener('click',event=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  event.preventDefault();
  const start=details.getBoundingClientRect().height;
  animation?.cancel();expanded=!expanded;
  details.style.height='auto';details.open=true;
  const end=expanded?details.getBoundingClientRect().height:summary.getBoundingClientRect().height;
  details.style.overflow='hidden';
  const current=details.animate([{height:start+'px'},{height:end+'px'}],{duration:280,easing:'cubic-bezier(.4,0,.2,1)',fill:'both'});
  animation=current;
  current.finished.then(()=>{if(animation!==current)return;details.open=expanded;current.cancel();details.style.removeProperty('height');details.style.removeProperty('overflow');animation=null}).catch(()=>{});
 });
 details.addEventListener('toggle',()=>{if(!animation)expanded=details.open});
});
