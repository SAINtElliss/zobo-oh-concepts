// Confirmed names and ingredients supplied by the brand, October 2026.
flavours.splice(0,flavours.length,
 {name:'Plain and',ending:'Simple',label:'Plain and Simple',eyebrow:'THE ORIGINAL ONE',description:'Hibiscus, rose loose leaf and pineapple, with cinnamon and cloves.',ingredients:['Hibiscus leaves','Rose loose leaf','Cinnamon','Pineapple','Cloves'],color:'#f1d2ed',image:'assets/plain-simple.webp'},
 {name:'Ginger and',ending:'Pineapple',label:'Ginger and Pineapple',eyebrow:'THE GINGER ONE',description:'Hibiscus with cold-pressed pineapple and ginger juice, cinnamon, cloves and white sugar.',ingredients:['Hibiscus leaves','Cinnamon','Cold-pressed pineapple','Cloves','Cold-pressed ginger juice','White sugar'],color:'#e6ae26',image:'assets/ginger-pineapple.webp'},
 {name:'Pineapple',ending:'',label:'Pineapple',eyebrow:'THE PINEAPPLE ONE',description:'Hibiscus and cold-pressed pineapple, with cinnamon, cloves and white sugar.',ingredients:['Hibiscus leaves','Cinnamon','Cold-pressed pineapple','Cloves','White sugar'],color:'#ed99b6',image:'assets/pineapple.webp'}
);
document.querySelectorAll('[data-flavour]').forEach((tab,index)=>tab.textContent=String(index+1).padStart(2,'0')+' '+flavours[index].label);
document.querySelector('.concept-note').textContent='Choose your bottle size and sweetness level.';
document.querySelector('.ingredient-editorial').innerHTML=[['Hibiscus leaves','The base of all three flavours.'],['Pineapple','In every flavour; cold-pressed in Pineapple and Ginger and Pineapple.'],['Ginger','Cold-pressed ginger juice in Ginger and Pineapple.'],['Cinnamon & cloves','In all three flavours.'],['Rose loose leaf','In Plain and Simple.'],['White sugar','Listed in Pineapple and Ginger and Pineapple.']].map(([name,detail],index)=>`<div class="ingredient-line"><span>${String(index+1).padStart(2,'0')}</span><h3>${name}</h3><p>${detail}</p><span class="ingredient-symbol" aria-hidden="true">✳</span></div>`).join('');

document.querySelectorAll('.hero-trio img').forEach((image,index)=>{image.src=flavours[index].image;image.alt=index===0?'Zobo Oh! Plain and Simple, Ginger and Pineapple, and Pineapple bottles':''});
