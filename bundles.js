// Bundles are explicit cart products; single bottles never receive silent discounts.
const bundleCatalogue=commerce.bundles,bundleStorage='zobo-bundles-v1';
function bundleBottleCount(){return lines.reduce((sum,line)=>sum+line.quantity*(bundleCatalogue[line.bundleId]?.count||1),0)}
try{const saved=JSON.parse(localStorage.getItem(bundleStorage)||'[]');if(Array.isArray(saved))saved.forEach(line=>{try{const priced=commerce.priceLine(line,{...shopConfig,availability:[true,true,true]});lines.push({...priced,price:priced.unitCents/100})}catch{}})}catch{}
function bundleDescription(line){return line.selections.map((selection,index)=>`${index+1}. ${flavours[selection.flavour].label} · ${bundleCatalogue[line.bundleId].ml} · sweetness ${selection.sweetness}/5`).join('\n')}
const bundleRenderBag=renderBag;renderBag=function(){
 bundleRenderBag();document.querySelectorAll('.configured-line').forEach((row,index)=>{const line=lines[index],bundle=bundleCatalogue[line.bundleId];if(!bundle)return;
 const content=row.querySelector('.cart-item-content');content.querySelector('strong').textContent=bundle.name;const detail=content.querySelector('p');detail.className='bundle-cart-description';detail.textContent=bundleDescription(line);row.querySelector('img').src=flavours[line.selections[0].flavour].image;content.querySelectorAll('.quantity-controls button').forEach((button,i)=>button.setAttribute('aria-label',`${i?'Add':'Remove'} one ${bundle.name}`));
 });
 const count=bundleBottleCount();$('bag-count').textContent=count;$('menu-cart-count').textContent='('+count+')';$('open-bag').setAttribute('aria-label',`Open cart, ${count} bottles`);
 const unavailable=lines.some(line=>line.bundleId?line.selections.some(selection=>!shopConfig.availability[selection.flavour]):!shopConfig.availability[line.flavour]);checkout.disabled=!lines.length||unavailable;notice.textContent=unavailable?'A selected flavour is sold out. Remove the affected item or bundle before checkout.':'';
 try{localStorage.setItem(bundleStorage,JSON.stringify(lines.filter(line=>line.bundleId)));localStorage.setItem(cartKey,JSON.stringify(lines.filter(line=>!line.bundleId)))}catch{}
};renderBag();
const singleSummaryLines=summaryLines;summaryLines=function(items){singleSummaryLines(items);$('checkout-summary').querySelectorAll('.checkout-product').forEach((row,index)=>{const line=items[index],bundle=bundleCatalogue[line.bundleId];if(!bundle)return;row.querySelector('strong').textContent=bundle.name;row.querySelector('.product-meta').textContent=`${line.quantity} pack${line.quantity===1?'':'s'} · ${bundle.count*line.quantity} bottles`;const details=document.createElement('p');details.className='bundle-cart-description';details.textContent=bundleDescription(line);row.querySelector('div').append(details);row.querySelector('img').src=flavours[line.selections[0].flavour].image;row.querySelector('.product-price').textContent=money(bundle.price*line.quantity)});orderDetailsSummary.querySelector('strong').textContent=bundleBottleCount()+' bottles'};

const bundleSection=document.createElement('section');bundleSection.id='bundles';bundleSection.className='bundles';bundleSection.setAttribute('aria-labelledby','bundles-heading');
bundleSection.innerHTML='<div class="section-kicker">MORE SIPS. MORE TO SHARE.</div><h2 id="bundles-heading">Better together.</h2><p>One of each, or mix your favourites.</p><div class="bundle-offers"></div>';
document.querySelector('#flavours').after(bundleSection);
Object.entries(bundleCatalogue).forEach(([id,bundle])=>{const regular=sizes.find(size=>size.ml===bundle.ml).price*bundle.count,offer=document.createElement('article');offer.className='bundle-offer';const title=document.createElement('h3');title.textContent=bundle.name;const meta=document.createElement('p');meta.textContent=`${bundle.count} × ${bundle.ml} · ${bundle.fixed?'one of each flavour':'mix & match'}`;const price=document.createElement('strong');price.textContent=cash(bundle.price/100);const savings=document.createElement('span');savings.className='bundle-saving';savings.textContent=`Save ${cash(regular-bundle.price/100)} · Regular ${cash(regular)}`;const button=document.createElement('button');button.className='button';button.dataset.bundle=id;button.textContent='Build your bundle';button.onclick=()=>showBundle(id);offer.append(title,meta,price,savings,button);bundleSection.querySelector('.bundle-offers').append(offer)});

const bundleDialog=document.createElement('dialog');bundleDialog.id='bundle-options';bundleDialog.setAttribute('aria-labelledby','bundle-title');bundleDialog.innerHTML='<button class="menu-close" aria-label="Close bundle options">×</button><h2 id="bundle-title"></h2><p id="bundle-intro"></p><form id="bundle-form"><p id="bundle-progress" role="status" aria-live="polite"></p><div id="bundle-selections"></div><p id="bundle-error" role="status"></p><div class="bundle-bottom"><strong id="bundle-total"></strong><button class="button" type="submit">Add bundle to cart <span class="action-arrow" aria-hidden="true"></span></button></div></form>';document.body.append(bundleDialog);
const nativeBundleShow=bundleDialog.showModal.bind(bundleDialog),nativeBundleClose=bundleDialog.close.bind(bundleDialog);bundleDialog.showModal=function(){lockModalPage();nativeBundleShow();bundleDialog.querySelector('button').focus({preventScroll:true})};let bundleClosing=false;bundleDialog.close=async function(){if(bundleClosing||!bundleDialog.open)return;bundleClosing=true;if(!reduced)await bundleDialog.animate([{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(18px) scale(.97)'}],{duration:180,easing:'ease-in',fill:'forwards'}).finished;nativeBundleClose();bundleDialog.getAnimations().forEach(animation=>animation.cancel());bundleClosing=false;unlockModalPage()};bundleDialog.addEventListener('close',unlockModalPage);bundleDialog.addEventListener('cancel',event=>{event.preventDefault();bundleDialog.close()});bundleDialog.querySelector('.menu-close').onclick=()=>bundleDialog.close();
let selectedBundle=null,bundleChoices=[];
function syncBundleChoices(changedIndex){
 const bundle=bundleCatalogue[selectedBundle],count=bundleChoices.reduce((sum,choice)=>sum+choice.quantity,0);
 $('bundle-progress').textContent=count+' / '+bundle.count+' bottles selected';
 $('bundle-form').querySelector('[type=submit]').disabled=count!==bundle.count||bundleChoices.some((choice,i)=>choice.quantity&&!shopConfig.availability[i]);
 document.querySelectorAll('.bundle-flavour-card').forEach((card,i)=>{const choice=bundleChoices[i],available=shopConfig.availability[i];card.classList.toggle('is-selected',choice.quantity>0);card.querySelector('output.bundle-count').textContent=choice.quantity;card.querySelector('.bundle-remove').disabled=bundle.fixed||choice.quantity===0;card.querySelector('.bundle-increase').disabled=bundle.fixed||count>=bundle.count||!available;card.querySelector('input[type=range]').disabled=!available||!choice.quantity;card.querySelector('.bundle-sweetness-value').textContent=choice.sweetness+' / 5';});
 if(Number.isInteger(changedIndex)&&!reduced){const image=document.querySelectorAll('.bundle-flavour-card img')[changedIndex];image.animate([{transform:'translateY(0) scale(1)'},{transform:'translateY(-5px) scale(1.06)',offset:.45},{transform:'translateY(0) scale(1)'}],{duration:320,easing:'ease-out'});}
}
function showBundle(id){
 selectedBundle=id;const bundle=bundleCatalogue[id];bundleChoices=flavours.map(()=>({quantity:bundle.fixed?1:0,sweetness:3}));
 $('bundle-title').textContent=bundle.name;$('bundle-intro').textContent=bundle.count+' × '+bundle.ml+'. '+(bundle.fixed?'One of each flavour.':'Choose how many of each flavour.')+' Set sweetness for each flavour.';$('bundle-total').textContent=cash(bundle.price/100);$('bundle-error').textContent='';
 $('bundle-selections').replaceChildren(...flavours.map((flavour,index)=>{
 const card=document.createElement('article');card.className='bundle-flavour-card';card.style.setProperty('--bottle-color',flavour.color);card.style.setProperty('--bottle-delay',index*65+'ms');
 const art=document.createElement('div');art.className='bundle-grid-art';const image=document.createElement('img');image.src=flavour.image;image.alt=flavour.label+' bottle';art.append(image);
 const title=document.createElement('h3');title.id='bundle-flavour-'+index;title.textContent=flavour.label;card.setAttribute('aria-labelledby',title.id);
 const stepper=document.createElement('div');stepper.className='bundle-grid-stepper';stepper.setAttribute('role','group');stepper.setAttribute('aria-label',flavour.label+' bottle quantity');
 const minus=document.createElement('button');minus.type='button';minus.className='bundle-remove';minus.textContent='−';minus.setAttribute('aria-label','Remove '+flavour.label+' bottle');
 const count=document.createElement('output');count.className='bundle-count';count.setAttribute('aria-label',flavour.label+' bottle count');
 const plus=document.createElement('button');plus.type='button';plus.className='bundle-increase';plus.textContent='+';plus.setAttribute('aria-label','Add '+flavour.label+' bottle');
 minus.onclick=()=>{if(!bundle.fixed&&bundleChoices[index].quantity>0){bundleChoices[index].quantity--;syncBundleChoices(index)}};
 plus.onclick=()=>{if(!bundle.fixed&&shopConfig.availability[index]&&bundleChoices.reduce((sum,c)=>sum+c.quantity,0)<bundle.count){bundleChoices[index].quantity++;syncBundleChoices(index)}};
 stepper.append(minus,count,plus);
 const label=document.createElement('label');label.className='bundle-grid-sweetness';label.htmlFor='bundle-sweetness-'+index;label.append(document.createTextNode('Sweetness '));const value=document.createElement('output');value.className='bundle-sweetness-value';value.htmlFor=label.htmlFor;label.append(value);
 const slider=document.createElement('input');slider.type='range';slider.min='1';slider.max='5';slider.value='3';slider.id=label.htmlFor;slider.setAttribute('aria-label',flavour.label+' sweetness');slider.oninput=()=>{bundleChoices[index].sweetness=Number(slider.value);syncBundleChoices()};
 const note=document.createElement('small');note.textContent=!shopConfig.availability[index]?'Sold out':bundle.fixed?'1 bottle included':'Bottles';
 card.append(art,title,stepper,note,label,slider);return card;
 }));syncBundleChoices();bundleDialog.showModal();bundleDialog.scrollTop=0;
}
$('bundle-form').onsubmit=event=>{event.preventDefault();if(bundleClosing)return;const bundle=bundleCatalogue[selectedBundle],selections=bundleChoices.flatMap((choice,flavour)=>Array.from({length:choice.quantity},()=>({flavour,sweetness:choice.sweetness})));
 const line={bundleId:selectedBundle,flavour:selections[0]?.flavour,ml:bundle.ml,sweetness:selections[0]?.sweetness,quantity:1,price:bundle.price/100,selections};try{commerce.priceLine(line,shopConfig);const existing=lines.find(item=>item.bundleId===line.bundleId&&JSON.stringify(item.selections)===JSON.stringify(selections));if(existing)existing.quantity++;else lines.push(line);renderBag();bundleDialog.close();addFeedback.textContent=bundle.name+' added to your cart.';animateOnce($('open-bag'),[{transform:'scale(1)'},{transform:'scale(1.12)',offset:.5},{transform:'scale(1)'}]);setTimeout(()=>addFeedback.textContent='',3200)}catch(error){$('bundle-error').textContent=error.message}};

// Anchor the brand sticker to the lettering, not the viewport or bottle area.
const heroTitle=$('hero-title');heroTitle.append(document.querySelector('.hero-brand-sticker'));
document.querySelector('.allergens summary').firstChild.textContent='A LITTLE ALLERGY NOTE ';
document.querySelector('footer>div').insertAdjacentHTML('afterbegin','<a href="#bundles">Bundles</a>');

updateCompactSummary=function(){const count=bundleBottleCount();orderDetailsSummary.querySelector('strong').textContent=count+' bottle'+(count===1?'':'s')};

