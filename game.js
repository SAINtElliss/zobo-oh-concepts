// Expressive concept: keep matched nutrients in their category.
const originalResetGame=resetGame;
resetGame=function(){
 document.querySelectorAll('.matched-nutrient').forEach(item=>item.remove());
 originalResetGame();
};
match=function(category){
 if(chosen===null){$('game-message').textContent='Pick a nutrient first.';return}
 const nutrient=nutrients[chosen],source=document.querySelector(`[data-nutrient="${chosen}"]`),zone=document.querySelector(`[data-category="${category}"]`);
 if(nutrient.category!==category){
  $('game-message').textContent='Not quite — try another category.';
  if(!reduced){
   zone.animate([{transform:'translateX(0)'},{transform:'translateX(-9px)'},{transform:'translateX(9px)'},{transform:'translateX(-5px)'},{transform:'translateX(0)'}],{duration:420});
   const from=zone.getBoundingClientRect(),to=source.getBoundingClientRect(),ghost=document.createElement('span');
   ghost.className='nutrient-return';ghost.textContent=nutrient.name;
   Object.assign(ghost.style,{left:from.left+from.width/2-to.width/2+'px',top:from.top+from.height/2-to.height/2+'px',width:to.width+'px'});
   document.body.append(ghost);source.style.opacity='0';
   ghost.animate([{transform:'translate(0,0)'},{transform:`translate(${to.left-(from.left+from.width/2-to.width/2)}px,${to.top-(from.top+from.height/2-to.height/2)}px)`}],{duration:500,easing:'ease-in-out'}).finished.finally(()=>{ghost.remove();source.style.opacity=''});
  }
  return;
 }
 solved.add(chosen);
 const token=document.createElement('span');token.className='matched-nutrient';token.textContent=nutrient.name+' ✓';zone.append(token);source.remove();
 if(!reduced)token.animate([{opacity:0,transform:'scale(.8)'},{opacity:1,transform:'scale(1)'}],{duration:280});
 $('score').textContent=`${solved.size} / 5`;
 $('game-message').textContent=solved.size===5?'Five out of five. You know your good stuff!':`Nice! ${nutrient.detail}`;
 chosen=null;
};
$('reset-game').onclick=resetGame;
