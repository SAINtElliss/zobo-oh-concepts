// Provider-independent demo. No payment, email, order or address is transmitted.
const shopConfig=window.ZOBO_COMMERCE,commerce=window.ZoboCommerce;
const money=cents=>new Intl.NumberFormat('en-CA',{style:'currency',currency:shopConfig.currency}).format(cents/100)+' CAD';
const stockNote=document.createElement('p');stockNote.className='stock-note';stockNote.setAttribute('role','status');$('expressive-add').before(stockNote);
function syncStock(){const available=shopConfig.availability[current]===true;stockNote.textContent=available?'Available':'Sold out — try another flavour';$('expressive-add').disabled=!available;}
const updateCatalogueFlavour=updateFlavour;updateFlavour=function(...args){updateCatalogueFlavour(...args);syncStock()};syncStock();
const stockAdd=$('expressive-add').onclick;$('expressive-add').onclick=()=>{if(shopConfig.availability[current]===true)stockAdd()};
document.querySelectorAll('[data-flavour]').forEach((tab,index)=>{if(!shopConfig.availability[index])tab.append(document.createTextNode(' · Sold out'))});
const renderCommerceCart=renderBag;renderBag=function(){renderCommerceCart();const unavailable=lines.some(line=>shopConfig.availability[line.flavour]!==true);checkout.disabled=!lines.length||unavailable;notice.textContent=unavailable?'A flavour in your cart is sold out. Remove it before continuing.':'';document.querySelectorAll('.configured-line').forEach((row,index)=>{if(shopConfig.availability[lines[index].flavour]!==true){const badge=document.createElement('p');badge.className='stock-note';badge.textContent='Sold out';row.querySelector('.cart-item-content').append(badge)}})};renderBag();

preview.innerHTML=`<button class="menu-close" aria-label="Close checkout preview"><span aria-hidden="true">×</span></button><span class="section-kicker">CHECKOUT PREVIEW · NO PAYMENT</span><h2 id="checkout-heading">Your next OH!</h2><p class="preview-banner">Delivery areas, fees, minimums, preparation times, tax and policies below are example settings for review.</p><div id="checkout-summary"></div><form id="fulfilment-form"><fieldset class="fulfilment-method"><legend>How would you like your order?</legend><label><input type="radio" name="fulfilment" value="pickup" checked> Pickup</label><label><input type="radio" name="fulfilment" value="delivery"> Delivery</label></fieldset><div id="pickup-info"></div><div id="delivery-fields" hidden><label>Delivery area<select id="delivery-zone"><option value="">Choose an area</option></select></label><p id="delivery-area-note" class="option-note"></p><label>Delivery address<input id="delivery-address" autocomplete="street-address"></label><p class="option-note">Outside these areas? Delivery is unavailable in this preview. Choose pickup.</p></div><p id="preparation-note" class="option-note"></p><label>Email<input id="customer-email" type="email" autocomplete="email" placeholder="you@example.com" required></label><label>Name<input id="customer-name" autocomplete="name" required></label><details class="terms-row"><summary>Cancellation &amp; refunds</summary><p id="cancellation-policy"></p><p id="refund-policy"></p></details><p id="quote-error" class="checkout-error" role="status"></p><dl id="checkout-totals"></dl><p class="option-note">Example tax: ${shopConfig.taxBasisPoints/100}%. No card details are collected.</p><button class="button" id="place-demo-order" type="submit">Preview order <span class="action-arrow" aria-hidden="true"></span></button></form><section id="order-preview" hidden aria-labelledby="order-preview-heading"><h3 id="order-preview-heading">Your order journey</h3><p id="order-reference"></p><p id="order-status" role="status" aria-live="polite"></p><ol id="order-timeline"></ol><div id="order-actions"></div><p id="order-feedback" role="status"></p><p class="option-note">Demo controls show possible outcomes. Nothing is charged, submitted, emailed or refunded.</p><button class="text-link" id="edit-preview-order" type="button">Back to checkout</button></section>`;
preview.querySelector('.menu-close').onclick=()=>preview.close();
$('cancellation-policy').textContent=shopConfig.policies.cancellation;$('refund-policy').textContent=shopConfig.policies.refund;
shopConfig.delivery.zones.forEach(zone=>{const option=document.createElement('option');option.value=zone.id;option.textContent=zone.name+' · '+money(zone.feeCents);$('delivery-zone').append(option)});
preview.querySelectorAll('[name=fulfilment]').forEach(input=>{input.disabled=!shopConfig[input.value].enabled});
const method=()=>preview.querySelector('[name=fulfilment]:checked').value;
let activeQuote=null,demoOrder=null;
function summaryLines(items){$('checkout-summary').replaceChildren(...items.map(line=>{const row=document.createElement('p');row.textContent=`${line.quantity} × ${flavours[line.flavour].label} · ${line.ml} · sweetness ${line.sweetness}/5 · ${money(line.unitCents*line.quantity)}`;return row}))}
function refreshQuote(){
 const selection=method(),delivery=selection==='delivery';$('delivery-fields').hidden=!delivery;$('pickup-info').hidden=delivery;$('delivery-address').required=delivery;
 $('pickup-info').textContent=shopConfig.pickup.address;$('preparation-note').textContent=shopConfig[selection].preparation+' · Minimum '+money(shopConfig[selection].minimumCents)+' before tax.';
 const zone=shopConfig.delivery.zones.find(z=>z.id===$('delivery-zone').value);$('delivery-area-note').textContent=zone?.description||'';
 $('checkout-totals').replaceChildren();activeQuote=null;
 try{activeQuote=commerce.quote(lines,selection,$('delivery-zone').value,shopConfig);$('quote-error').textContent='';[['Items',activeQuote.subtotalCents],[delivery?'Delivery':'Pickup',activeQuote.feeCents],['Example tax',activeQuote.taxCents],['Total',activeQuote.totalCents]].forEach(([label,value])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=money(value);$('checkout-totals').append(dt,dd)})}catch(error){$('quote-error').textContent=error.message}
 $('place-demo-order').disabled=!activeQuote;
}
preview.querySelectorAll('[name=fulfilment],#delivery-zone').forEach(input=>input.addEventListener('change',refreshQuote));
checkout.onclick=async()=>{
 if(!lines.length||lines.some(line=>!shopConfig.availability[line.flavour]))return;
 
 await $('bag-dialog').close();summaryLines(lines.map(line=>({...line,unitCents:Math.round(sizes.find(size=>size.ml===line.ml).price*100)})));$('fulfilment-form').hidden=false;$('order-preview').hidden=true;demoOrder=null;refreshQuote();preview.showModal();if(!reduced)preview.animate([{opacity:0,transform:'translateX(35px)'},{opacity:1,transform:'translateX(0)'}],{duration:250});
};
const statusLabels={awaiting_payment:'Awaiting payment',payment_failed:'Payment failed — no payment taken',paid:'Paid',preparing:'Preparing',ready:'Ready for pickup',dispatched:'Dispatched',completed:'Completed',cancelled:'Cancelled',refund_pending:'Refund requested',refunded:'Refunded'};
function orderAction(label,next){const button=document.createElement('button');button.type='button';button.className='button';button.textContent=label;button.onclick=()=>{try{demoOrder=commerce.transition(demoOrder,next);renderOrder()}catch(error){$('order-feedback').textContent=error.message}};$('order-actions').append(button)}
function renderOrder(){
 $('order-reference').textContent=demoOrder.id+' · '+demoOrder.method+' · '+money(demoOrder.quote.totalCents)+' · Demo only';$('order-status').textContent='Preview status: '+statusLabels[demoOrder.status];$('order-feedback').textContent='';$('order-timeline').replaceChildren(...demoOrder.history.map(event=>{const li=document.createElement('li');li.textContent=statusLabels[event.status];return li}));$('order-actions').replaceChildren();
 const state=demoOrder.status;
 if(state==='awaiting_payment'){orderAction('Preview successful payment','paid');orderAction('Preview failed payment','payment_failed')}
 if(state==='payment_failed'){orderAction('Retry payment preview','awaiting_payment');orderAction('Cancel preview order','cancelled')}
 if(state==='paid'){orderAction('Preview preparation','preparing');orderAction('Cancel preview order','cancelled')}
 if(state==='preparing')orderAction(demoOrder.method==='pickup'?'Mark ready for pickup':'Mark dispatched',demoOrder.method==='pickup'?'ready':'dispatched');
 if(['ready','dispatched'].includes(state))orderAction('Mark completed','completed');
 if(state==='cancelled'&&demoOrder.paid)orderAction('Request refund preview','refund_pending');
 if(state==='refund_pending')orderAction('Preview refund completed','refunded');
 preview.scrollTop=0;$('order-status').tabIndex=-1;$('order-status').focus({preventScroll:true});
}
$('fulfilment-form').onsubmit=event=>{event.preventDefault();refreshQuote();if(!activeQuote||!event.target.reportValidity())return;demoOrder={id:'DEMO-'+Date.now().toString(36).toUpperCase(),method:activeQuote.method,status:'awaiting_payment',paid:false,quote:structuredClone(activeQuote),history:[{status:'awaiting_payment',at:new Date().toISOString()}]};$('fulfilment-form').hidden=true;$('order-preview').hidden=false;renderOrder()};
$('edit-preview-order').onclick=()=>{$('order-preview').hidden=true;$('fulfilment-form').hidden=false;refreshQuote()};
