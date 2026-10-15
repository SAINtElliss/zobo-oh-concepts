// Small, purposeful interactions. All motion honours the visitor's preference.
const motionAllowed=()=>!matchMedia('(prefers-reduced-motion: reduce)').matches;
const animateOnce=(element,frames,options={})=>{if(element&&motionAllowed())return element.animate(frames,{duration:280,easing:'cubic-bezier(.2,.8,.2,1)',...options})};

// Keep the mobile checkout focused on the next decision.
const orderDetails=document.createElement('details');orderDetails.className='compact-order terms-row';orderDetails.open=innerWidth>600;
const orderDetailsSummary=document.createElement('summary');orderDetailsSummary.append(iconLabel('bag','Your order'),document.createElement('strong'));
$('checkout-summary').before(orderDetails);orderDetails.append(orderDetailsSummary,$('checkout-summary'));
function updateCompactSummary(){const count=lines.reduce((sum,line)=>sum+line.quantity,0);orderDetailsSummary.querySelector('strong').textContent=count+' bottle'+(count===1?'':'s');}
const compactSummaryLines=summaryLines;summaryLines=function(items){compactSummaryLines(items);updateCompactSummary()};
const compactCheckout=checkout.onclick;checkout.onclick=async()=>{orderDetails.open=innerWidth>600;await compactCheckout();updateCompactSummary()};

// Separate client demo tools from customer-facing order information.
const demoTools=document.createElement('details');demoTools.className='terms-row demo-tools';
const demoToolsSummary=document.createElement('summary');demoToolsSummary.textContent='Try the demo';demoTools.append(demoToolsSummary);
$('order-actions').before(demoTools);demoTools.append($('order-actions'));
const journeyDetails=document.createElement('details');journeyDetails.className='journey-details';journeyDetails.open=true;
const journeySummary=document.createElement('summary');journeySummary.textContent='View your journey';$('order-timeline').before(journeyDetails);journeyDetails.append(journeySummary,$('order-timeline'));
let lastRoadmapState=null;
const animatedRenderOrder=renderOrder;renderOrder=function(){
 const was=lastRoadmapState;animatedRenderOrder();lastRoadmapState=demoOrder.status;
 demoTools.hidden=!$('order-actions').children.length;
 const finished=demoOrder.status==='completed';journeyDetails.classList.toggle('journey-complete',finished);journeyDetails.open=!finished;
 if(was!==demoOrder.status){
  const marker=$('order-timeline').querySelector('[aria-current=step] .roadmap-marker');
  if(motionAllowed())marker?.closest('.roadmap-step').classList.add('connector-arrived');
  animateOnce(marker,[{transform:'scale(.88)'},{transform:'scale(1.08)',offset:.65},{transform:'scale(1)'}],{duration:400});
  const badges=$('order-timeline').querySelectorAll('.roadmap-check');animateOnce(badges[badges.length-1],[{transform:'scale(0)'},{transform:'scale(1.15)',offset:.7},{transform:'scale(1)'}],{delay:160});
  if(finished)animateOnce($('order-status'),[{transform:'scale(.98)',opacity:.5},{transform:'scale(1)',opacity:1}]);
 }
};
const editJourney=$('edit-preview-order').onclick;$('edit-preview-order').onclick=()=>{lastRoadmapState=null;demoTools.open=false;editJourney()};
const journeySubmit=$('fulfilment-form').onsubmit;$('fulfilment-form').onsubmit=event=>{demoTools.open=false;lastRoadmapState=null;journeySubmit(event)};

// Make flavour descriptions about taste; ingredient tags remain the recipe reference.
const tasteCopy=['Floral hibiscus with a soft rose note and a warm spice finish.','Bright pineapple with a warming ginger kick and a spiced hibiscus finish.','Juicy pineapple and rich hibiscus, rounded out with warm spice.'];
flavours.forEach((flavour,index)=>flavour.description=tasteCopy[index]);$('flavour-description').textContent=flavours[current].description;

// Group the product choices and show a filling sweetness droplet.
popup.querySelector('.size-options').classList.add('option-control-group');popup.querySelector('.bottle-quantity').classList.add('option-control-group');
const sweetnessLabel=$('option-sweetness').closest('label');sweetnessLabel.classList.add('sweetness-control','option-control-group');
const sweetnessVisual=document.createElement('span');sweetnessVisual.className='sweetness-visual';sweetnessVisual.setAttribute('aria-hidden','true');
sweetnessVisual.innerHTML='<svg viewBox="0 0 24 28"><defs><linearGradient id="sweetness-fill" x1="0" y1="1" x2="0" y2="0"><stop offset="60%" stop-color="#a5345c"/><stop offset="60%" stop-color="#fff6df"/></linearGradient></defs><path d="M12 2S4 12 4 18a8 8 0 0 0 16 0c0-6-8-16-8-16Z" fill="url(#sweetness-fill)" stroke="currentColor" stroke-width="1.5"/></svg><span>Balanced</span>';
$('option-sweetness-label').before(sweetnessVisual);
function paintSweetness(){const level=Number($('option-sweetness').value);sweetnessVisual.querySelectorAll('stop').forEach(stop=>stop.setAttribute('offset',level*20+'%'));sweetnessVisual.querySelector('span').textContent=['Light','Lightly sweet','Balanced','Sweet','Extra sweet'][level-1]}
$('option-sweetness').addEventListener('input',()=>{paintSweetness();animateOnce(sweetnessVisual.querySelector('svg'),[{transform:'translateY(0)'},{transform:'translateY(-2px)',offset:.5},{transform:'translateY(0)'}],{duration:200})});

// A single highlight moves between size options, including keyboard selections.
const sizePills=popup.querySelector('.size-pills'),sizeHighlight=document.createElement('span');sizeHighlight.className='size-highlight';sizeHighlight.setAttribute('aria-hidden','true');sizePills.prepend(sizeHighlight);
function paintSize(){const selected=sizePills.querySelector('input:checked').closest('label'),box=selected.getBoundingClientRect(),parent=sizePills.getBoundingClientRect();sizeHighlight.style.width=box.width+'px';sizeHighlight.style.height=box.height+'px';sizeHighlight.style.transform=`translate(${box.left-parent.left}px,${box.top-parent.top}px)`}
sizePills.querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>{paintSize();const index=Number(input.value),art=popup.querySelector('.option-art img');animateOnce(art,[{scale:String([.94,1,1.07][index])},{scale:'1'}],{duration:380})}));
const openOptionsForMotion=$('expressive-add').onclick;$('expressive-add').onclick=()=>{openOptionsForMotion();if(popup.open){paintSweetness();paintSize()}};
addEventListener('resize',()=>{if(popup.open)paintSize()});

// Correct game matches snap into place; drag targets and finishing feedback are clear.
function sparkleScore(){if(!motionAllowed())return;const score=$('score'),rect=score.getBoundingClientRect();for(let i=0;i<8;i++){const spark=graphicIcon('spark');spark.classList.add('score-spark');Object.assign(spark.style,{left:rect.left+rect.width/2+'px',top:rect.top+rect.height/2+'px'});document.body.append(spark);const angle=i*Math.PI/4;spark.animate([{transform:'translate(0,0) scale(.2)',opacity:1},{transform:`translate(${Math.cos(angle)*65}px,${Math.sin(angle)*55}px) scale(1)`,opacity:0}],{duration:650,easing:'ease-out'}).finished.finally(()=>spark.remove())}}
const playfulMatch=match;match=function(category){const before=solved.size;playfulMatch(category);if(solved.size>before){const zone=document.querySelector(`[data-category="${category}"]`),token=zone.querySelector('.matched-nutrient:last-child');animateOnce(token,[{transform:'translateY(-8px) scale(.9)',opacity:.3},{transform:'translateY(0) scale(1)',opacity:1}]);zone.classList.add('match-landed');setTimeout(()=>zone.classList.remove('match-landed'),450);if(solved.size===nutrients.length)sparkleScore()}};
document.querySelectorAll('[data-category]').forEach(zone=>{zone.addEventListener('dragenter',()=>zone.classList.add('drag-over'));zone.addEventListener('dragleave',event=>{if(!zone.contains(event.relatedTarget))zone.classList.remove('drag-over')});zone.addEventListener('drop',()=>zone.classList.remove('drag-over'))});
document.addEventListener('dragend',()=>document.querySelectorAll('.drag-over').forEach(zone=>zone.classList.remove('drag-over')));

// Connect the cart-count change to the item that was added.
let lastCartCount=lines.reduce((sum,line)=>sum+line.quantity,0),lastAddedLine=-1,cartCountsBefore=[];
const livelyRenderBag=renderBag;renderBag=function(){
 const previous=cartCountsBefore;livelyRenderBag();const nextCount=lines.reduce((sum,line)=>sum+line.quantity,0);
 if(nextCount>lastCartCount){lastAddedLine=lines.findIndex((line,index)=>line.quantity>(previous[index]||0));}
 lastCartCount=nextCount;cartCountsBefore=lines.map(line=>line.quantity);
};renderBag();
const flightWithFeedback=animateAddToBag;animateAddToBag=async function(){await flightWithFeedback();animateOnce($('bag-count'),[{transform:'translateY(-8px)',opacity:.2},{transform:'translateY(0)',opacity:1}])};
let previousOptionAmount=$('option-total').textContent;
new MutationObserver(()=>{const amount=$('option-total').textContent;if(amount!==previousOptionAmount){previousOptionAmount=amount;animateOnce($('option-total'),[{transform:'translateY(4px)',opacity:.5},{transform:'translateY(0)',opacity:1}],{duration:180})}}).observe($('option-total'),{childList:true});
const showCartWithFeedback=$('bag-dialog').showModal.bind($('bag-dialog'));$('bag-dialog').showModal=function(){showCartWithFeedback();const row=$('bag-items').querySelectorAll('.configured-line')[lastAddedLine];if(row){animateOnce(row,[{background:'#f1d2ed'},{background:'transparent'}],{duration:900});lastAddedLine=-1}};

// Ingredient motion is a response to the visitor, not an endless loop.
document.querySelectorAll('.ingredient-line').forEach(line=>{const icon=line.querySelector('.ingredient-symbol');icon.tabIndex=0;icon.setAttribute('role','img');icon.setAttribute('aria-label',line.querySelector('h3').textContent+' illustration');icon.removeAttribute('aria-hidden');const play=()=>animateOnce(icon,[{transform:'rotate(0) scale(1)'},{transform:'rotate(-9deg) scale(1.08)',offset:.4},{transform:'rotate(0) scale(1)'}],{duration:500});icon.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')play()});icon.addEventListener('click',play);icon.addEventListener('focus',play)});
const editorial=document.querySelector('.ingredient-editorial'),ingredientRows=[...editorial.querySelectorAll('.ingredient-line')];
ingredientRows[0].classList.add('ingredient-hero');
[['Fruit',[ingredientRows[1]]],['Spice & finishing notes',ingredientRows.slice(2)]].forEach(([title,rows])=>{const group=document.createElement('div');group.className='ingredient-group';const heading=document.createElement('p');heading.className='section-kicker';heading.textContent=title;group.append(heading,...rows);editorial.append(group)});

// Quick stagger on menu opening; links stay immediately interactive.
const showMenuWithMotion=menu.showModal.bind(menu);menu.showModal=function(){showMenuWithMotion();menu.querySelectorAll('nav>a,nav>button').forEach((item,index)=>animateOnce(item,[{transform:'translateY(10px)',opacity:0},{transform:'translateY(0)',opacity:1}],{duration:250,delay:50+index*40}))};
