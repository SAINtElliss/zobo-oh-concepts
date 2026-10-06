// Navigation and ordering refinements for the expressive concept.
const menuToggle=document.createElement('button');
menuToggle.className='menu-toggle';menuToggle.setAttribute('aria-label','Open menu');menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-controls','mobile-menu');
menuToggle.innerHTML='<span></span><span></span>';
$('open-bag').before(menuToggle);
const menu=document.createElement('dialog');menu.id='mobile-menu';menu.setAttribute('aria-label','Main menu');
menu.innerHTML='<button class="menu-close" aria-label="Close menu">×</button><nav><a href="#story">Our roots</a><a href="#flavours">The flavours</a><a href="#ingredients">The good stuff</a><button id="menu-cart">Cart <span id="menu-cart-count">(0)</span><img src="assets/bag-01.png" alt=""></button></nav>';
document.body.append(menu);
menuToggle.onclick=()=>{menu.showModal();menuToggle.setAttribute('aria-expanded','true')};
menu.querySelector('.menu-close').onclick=()=>menu.close();
menu.addEventListener('close',()=>menuToggle.setAttribute('aria-expanded','false'));
menu.querySelectorAll('a').forEach(link=>link.onclick=()=>menu.close());
$('menu-cart').onclick=()=>{menu.close();openBag()};
addEventListener('resize',()=>{if(innerWidth>700&&menu.open)menu.close()});

// Store only catalogue selections, never contact or payment information.
const cartKey='zobo-concept-cart-v1';
try{const saved=JSON.parse(localStorage.getItem(cartKey)||'[]');if(Array.isArray(saved))saved.forEach(line=>{const size=sizes.find(s=>s.ml===line.ml);if(size&&Number.isInteger(line.flavour)&&line.flavour>=0&&line.flavour<flavours.length&&Number.isInteger(line.quantity)&&line.quantity>0&&line.quantity<=50&&Number.isInteger(line.sweetness)&&line.sweetness>=1&&line.sweetness<=5)lines.push({...line,price:size.price})})}catch{}
const originalRenderBag=renderBag;
renderBag=function(){originalRenderBag();try{localStorage.setItem(cartKey,JSON.stringify(lines))}catch{}$('menu-cart-count').textContent='('+lines.reduce((sum,line)=>sum+line.quantity,0)+')';const explore=$('bag-items').querySelector('.button');if(explore)explore.textContent='EXPLORE THE FLAVOURS'};
renderBag();
optionCheckout.replaceChildren(document.createTextNode('View cart '));const cartArrow=document.createElement('span');cartArrow.className='action-arrow';cartArrow.setAttribute('aria-hidden','true');optionCheckout.append(cartArrow);

// Clearly marked checkout preview: no submission or payment connection.
const preview=document.createElement('dialog');preview.id='checkout-preview';preview.setAttribute('aria-labelledby','checkout-heading');
preview.innerHTML='<button class="menu-close" aria-label="Close checkout preview">×</button><span class="section-kicker">DEMO CHECKOUT · NO PAYMENT</span><h2 id="checkout-heading">Your next OH!</h2><div id="checkout-summary"></div><form><label>Email<input type="email" autocomplete="email" placeholder="you@example.com" required></label><label>Name<input autocomplete="name" required></label><label>Delivery address<input autocomplete="street-address" required></label><p class="option-note">Illustrative prices. Delivery and taxes will be confirmed before the real checkout launches.</p><details class="terms-row"><summary>Terms &amp; conditions</summary><p>This is a visual demo. Nothing is submitted, ordered or charged. Delivery, refunds and final pricing are awaiting brand confirmation.</p></details><button class="button" type="submit">PREVIEW CONFIRMATION <span class="action-arrow" aria-hidden="true"></span></button></form><p id="checkout-result" role="status"></p>';
document.body.append(preview);
preview.querySelector('.menu-close').onclick=()=>preview.close();
checkout.onclick=async()=>{if(!reduced)await $('bag-dialog').animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:'translateX(-35px)'}],{duration:180}).finished;$('bag-dialog').close();$('checkout-summary').replaceChildren(...lines.map(line=>{const p=document.createElement('p');p.textContent=`${line.quantity} × ${flavours[line.flavour].label} · ${line.ml} · sweetness ${line.sweetness}/5 · ${cash(line.quantity*line.price)}`;return p}));const total=document.createElement('strong');total.textContent='Estimated subtotal: '+cash(lines.reduce((sum,line)=>sum+line.quantity*line.price,0));$('checkout-summary').append(total);$('checkout-result').textContent='';preview.showModal();if(!reduced)preview.animate([{opacity:0,transform:'translateX(35px)'},{opacity:1,transform:'translateX(0)'}],{duration:250})};
preview.querySelector('form').onsubmit=e=>{e.preventDefault();$('checkout-result').textContent='Preview complete. No order was placed and no payment was taken.'};

// Give terms a consistent, unmistakable disclosure row.
popup.querySelector('details').classList.add('terms-row');
const allergyLink=document.createElement('button');allergyLink.className='allergy-link';allergyLink.textContent='Read the allergy information';allergyLink.onclick=()=>{popup.close();document.querySelector('.allergens details').open=true;document.querySelector('.allergens').scrollIntoView({behavior:reduced?'auto':'smooth'})};popup.querySelector('details').after(allergyLink);
const actions=document.createElement('div');actions.className='option-actions';actions.append(popup.querySelector('.option-total'),$('option-add'),optionCheckout);popup.append(actions);
document.querySelectorAll('.button').forEach(button=>button.style.textTransform='uppercase');
document.querySelector('.bag-label').firstChild.textContent='CART (';
document.querySelector('footer>div').insertAdjacentHTML('afterbegin','<a href="#story">Our roots</a><a href="#ingredients">The good stuff</a>');
const startingPrice=document.createElement('p');startingPrice.className='starting-price';startingPrice.textContent='From CAD $5 · 8OZ bottle · demo pricing';$('expressive-add').before(startingPrice);
const previousMatch=match;match=function(category){previousMatch(category);document.querySelectorAll('[data-category]').forEach(zone=>zone.classList.toggle('has-matches',Boolean(zone.querySelector('.matched-nutrient'))))};
const previousReset=resetGame;resetGame=function(){previousReset();document.querySelectorAll('[data-category]').forEach(zone=>zone.classList.remove('has-matches'))};$('reset-game').onclick=resetGame;
$('expressive-add').firstChild.textContent='Add to cart ';
$('bag-dialog').querySelector('.section-kicker').textContent='YOUR CART';
const cartRenderWithStorage=renderBag;renderBag=function(){cartRenderWithStorage();$('open-bag').setAttribute('aria-label','Open cart, '+lines.reduce((sum,line)=>sum+line.quantity,0)+' bottles')};renderBag();
document.querySelector('.story-bottom p').textContent='Zobo is a much-loved West African hibiscus drink. Zobo Oh! brings that familiar refreshment together with fruit and spice, made for everyday moments and good company.';
document.querySelector('.ending .button').firstChild.textContent='Explore the flavours ';

// Keep the page stationary behind every modal, including dialog transitions.
let modalScroll=null;
function lockModalPage(){
 if(modalScroll!==null)return;
 modalScroll={x:scrollX,y:scrollY};
 document.body.style.setProperty('--modal-scroll-top',-modalScroll.y+'px');
 document.documentElement.classList.add('modal-page-locked');
}
function unlockModalPage(){
 if(document.querySelector('dialog[open]')||modalScroll===null)return;
 const position=modalScroll;modalScroll=null;
 document.documentElement.classList.add('modal-scroll-restoring');
 document.documentElement.classList.remove('modal-page-locked');
 document.body.style.removeProperty('--modal-scroll-top');
 scrollTo({left:position.x,top:position.y,behavior:'instant'});
 requestAnimationFrame(()=>document.documentElement.classList.remove('modal-scroll-restoring'));
}
document.querySelectorAll('dialog').forEach(dialog=>{
 const show=dialog.showModal.bind(dialog);
 const close=dialog.close.bind(dialog);
 dialog.showModal=function(){lockModalPage();try{show();dialog.querySelector('button')?.focus({preventScroll:true})}catch(error){unlockModalPage();throw error}};
 dialog.close=function(...args){close(...args);unlockModalPage()};
 dialog.addEventListener('close',unlockModalPage);
});
