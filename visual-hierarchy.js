// Scan-friendly visuals with text labels retained for clarity and accessibility.
Object.assign(iconPaths,{
 wallet:'M3 6h17v14H3zM3 6V3h14v3M15 11h6v5h-6z',
 paid:'M3 5h18v14H3zM3 9h18M8 14l3 3 5-5',
 bottle:'M9 2h6v4l2 3v12H7V9l2-3zM9 5h6M7 12h10',
 truck:'M2 5h12v12H2zM14 10h4l4 4v3h-8M5 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4M18 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4',
 bag:'M4 8h16l-2 13H6zM8 8V6a4 4 0 0 1 8 0v2',
 flag:'M5 22V3M5 3h13l-3 4 3 4H5M2 22h6',
 pin:'M12 22s8-8 8-14A8 8 0 0 0 4 8c0 6 8 14 8 14zM9 8a3 3 0 1 0 6 0 3 3 0 0 0-6 0',
 clock:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M12 6v6l4 2',
 drop:'M12 2S5 11 5 15a7 7 0 0 0 14 0c0-4-7-13-7-13z',
 leaf:'M3 21l15-15M4 17C0 4 11 2 21 3c1 11-4 19-13 16M9 15v-5M13 11h5',
 pineapple:'M8 8l-3-5 6 3 1-5 2 5 5-3-3 5M8 8h8l3 8-3 6H8l-3-6zM7 11l10 8M6 16l8 6M17 11L7 19M18 16l-8 6',
 ginger:'M5 18c-3-1-3-5 0-6l3-1-1-4c0-3 4-4 5-1l1 3 3-3c2-2 5 1 3 3l-3 4 4 1c3 1 2 5-1 5l-5-1-3 4c-2 2-6 0-4-3zM8 12l3 2M13 9l2 3M14 17l-3 1',
 spice:'M5 21L17 3l4 3L9 23M5 21l4 2M4 8h6M7 5v6',
 flower:'M12 8C2-2 0 12 8 12c-8 3 1 13 4 4 3 9 12-1 4-4 8 0 6-14-4-4zM12 9v6M9 12h6',
 cubes:'M3 8l6-4 6 4-6 4zM3 8v7l6 4 6-4V8M9 12v7M15 12l6 3v6l-6 2-4-3',
 refund:'M5 7a8 8 0 1 1-1 9M5 2v5h5M12 7v10M15 9h-4a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H9',
 info:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M12 10v7M12 6v1',
 mail:'M2 5h20v14H2zM2 5l10 8L22 5',
 person:'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M4 22v-3a8 8 0 0 1 16 0v3'
});
function iconLabel(kind,text,className='visual-label'){const span=document.createElement('span');span.className=className;span.append(graphicIcon(kind),document.createTextNode(text));return span}

// Compact product rows, replacing the single long line of dotted text.
summaryLines=function(items){$('checkout-summary').replaceChildren(...items.map(line=>{
 const row=document.createElement('article');row.className='checkout-product';
 const image=document.createElement('img');image.src=flavours[line.flavour].image;image.alt='';
 const content=document.createElement('div'),name=document.createElement('strong');name.textContent=flavours[line.flavour].label;
 const meta=document.createElement('div');meta.className='product-meta';meta.append(iconLabel('bottle',line.ml),iconLabel('drop',line.sweetness+'/5 sweetness'),iconLabel('bag','Qty '+line.quantity));
 const total=document.createElement('strong');total.className='product-price';total.textContent=money(line.unitCents*line.quantity);
 content.append(name,meta);row.append(image,content,total);return row;
}))};
const referenceRender=renderOrder;
renderOrder=function(){
 referenceRender();
 const state=demoOrder.status,pickup=demoOrder.method==='pickup';
 $('checkout-heading').hidden=true;$('order-preview-heading').textContent=state==='completed'?'Sip. Smile. Repeat.':['cancelled','refund_pending','refunded'].includes(state)?'Your order update.':'Your order, on its way.';
 $('order-reference').replaceChildren(iconLabel(pickup?'pin':'truck',pickup?'Pickup':'Delivery'),iconLabel('bag',money(demoOrder.quote.totalCents)));
 const stepKeys=['awaiting_payment','paid','preparing',pickup?'ready':'dispatched','completed'];
 const stepNames=['Awaiting payment','Paid','Preparing',pickup?'Ready for pickup':'Dispatched','Completed'];
 const stepIcons=['wallet','paid','bottle',pickup?'pin':'truck','flag'];
 const visited=new Set(demoOrder.history.map(event=>event.status)),active=stepKeys.indexOf(state),timeline=$('order-timeline');timeline.classList.add('order-roadmap');
 timeline.replaceChildren(...stepKeys.map((key,index)=>{
  const step=document.createElement('li');step.className='roadmap-step';
  const reached=visited.has(key),current=active===index;
  step.classList.toggle('is-done',reached&&!current);step.classList.toggle('is-current',current);if(current)step.setAttribute('aria-current','step');
  const marker=document.createElement('span');marker.className='roadmap-marker';marker.append(graphicIcon(stepIcons[index]));
  if(reached&&!current){const check=graphicIcon('check');check.classList.add('roadmap-check');marker.append(check)}
  const caption=document.createElement('span');caption.className='roadmap-caption';caption.textContent=stepNames[index];step.append(marker,caption);return step;
 }));
 const exception=['payment_failed','cancelled','refund_pending','refunded'].includes(state);
 $('order-status').classList.toggle('order-exception',exception);
 const statusIcon=state==='payment_failed'?'info':state==='cancelled'?'close':state.includes('refund')?'refund':stepIcons[Math.max(0,active)];
 $('order-status').replaceChildren(graphicIcon(statusIcon),document.createTextNode(statusLabels[state]));
 if(exception){const help=document.createElement('span');help.className='status-help';help.textContent=state==='payment_failed'?'No payment taken. You can try again.':state==='cancelled'?'This order will not be prepared.':state==='refund_pending'?'Waiting for refund confirmation.':'Refund preview complete.';$('order-status').append(help)}
 const note=document.createElement('p');note.className='order-id';note.textContent=demoOrder.id+' · Demo only';$('order-preview').append(note);
 // Avoid stacking references after each status change.
 $('order-preview').querySelectorAll('.order-id').forEach((id,index,list)=>{if(index<list.length-1)id.remove()});
};

// Keep one clear demo notice rather than several repeated paragraphs.
const banner=preview.querySelector('.preview-banner');banner.replaceChildren(iconLabel('info','Demo only — example tax, minimums & preparation times. No payment.'));
preview.querySelector('#order-preview>.option-note').textContent='Preview controls only. No payment or order is sent.';
document.querySelector('#bag-dialog>.demo-notice').textContent='Demo only. No payment or order is sent.';
popup.querySelector('.option-note').textContent='CAD · Delivery and tax shown at checkout.';
preview.querySelector('.section-kicker').textContent='CHECKOUT PREVIEW';
preview.querySelectorAll('.fulfilment-method label').forEach(label=>{label.insertBefore(graphicIcon(label.querySelector('input').value==='pickup'?'pin':'truck'),label.lastChild)});
[['customer-email','mail'],['customer-name','person'],['delivery-address','pin'],['delivery-zone','truck']].forEach(([id,kind])=>{const label=$(id).closest('label');label.prepend(graphicIcon(kind))});
const oldRefreshQuote=refreshQuote;refreshQuote=function(){oldRefreshQuote();const text=$('preparation-note').textContent;const [time,minimum]=text.split(' · ');$('preparation-note').replaceChildren(iconLabel('clock',time),iconLabel('bag',minimum||''));};
preview.querySelectorAll('[name=fulfilment],#delivery-zone').forEach(input=>input.addEventListener('change',()=>refreshQuote()));

// Ingredient pictograms convey the subject; names and full recipe tags stay readable.
document.querySelectorAll('.ingredient-symbol').forEach((symbol,index)=>symbol.replaceChildren(graphicIcon(['flower','pineapple','ginger','spice','leaf','cubes'][index]||'leaf')));
document.querySelector('.ingredients-heading p').textContent='Hibiscus, fruit & spice. Explore what goes into each flavour.';
document.querySelector('.nutrition>div>p').textContent='Pick a nutrient. Match it to a category.';
document.querySelector('.game>small').textContent='Just for fun — not a product nutrition label.';
const stockSync=syncStock;syncStock=function(){stockSync();stockNote.prepend(graphicIcon(shopConfig.availability[current]?'check':'info'))};syncStock();

const visualCartRender=renderBag;renderBag=function(){visualCartRender();document.querySelectorAll('.configured-line').forEach((row,index)=>{
 const detail=row.querySelector('.cart-item-content>p'),line=lines[index];if(!detail||!line)return;
 detail.className='cart-product-meta';detail.replaceChildren(iconLabel('bottle',line.ml),iconLabel('drop',line.sweetness+'/5 sweetness'));
 const unit=document.createElement('span');unit.className='cart-unit-price';unit.textContent=cash(line.price)+' each';detail.append(unit);
})};renderBag();
document.querySelectorAll('#bottle-options details summary,#checkout-preview details summary').forEach(summary=>summary.prepend(graphicIcon(summary.textContent.includes('allergy')?'leaf':'info')));

const visualCheckout=checkout.onclick;checkout.onclick=async()=>{$('checkout-heading').hidden=false;await visualCheckout()};
const visualEdit=$('edit-preview-order').onclick;$('edit-preview-order').onclick=()=>{$('checkout-heading').hidden=false;visualEdit()};
