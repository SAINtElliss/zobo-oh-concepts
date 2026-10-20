(function(root){
 'use strict';
 const prices={'8OZ':700,'12OZ':900,'1L':1800};
 const bundles={trio:{name:'Taster Trio',count:3,ml:'8OZ',price:1800,fixed:true},duo:{name:'Duo Pack',count:2,ml:'12OZ',price:1700},week:{name:'Work Week Pack',count:5,ml:'12OZ',price:4000},sixer:{name:'The Sixer',count:6,ml:'12OZ',price:4800},party:{name:'Party Pack',count:4,ml:'1L',price:7000}};
 function priceLine(line,config){
  if(!Number.isInteger(line.quantity)||line.quantity<1||line.quantity>500)throw Error('Please check the quantity in your cart.');
  if(line.bundleId){const bundle=bundles[line.bundleId];if(!bundle||!Array.isArray(line.selections)||line.selections.length!==bundle.count)throw Error('Please check the bundle in your cart.');
   line.selections.forEach((selection,index)=>{if(!Number.isInteger(selection.flavour)||selection.flavour<0||selection.flavour>2||!Number.isInteger(selection.sweetness)||selection.sweetness<1||selection.sweetness>5||bundle.fixed&&selection.flavour!==index)throw Error('Please check your bundle choices.');if(config.availability[selection.flavour]!==true)throw Error('A flavour in your bundle is sold out. Please update your choices.');});
   return {...line,flavour:line.selections[0].flavour,sweetness:line.selections[0].sweetness,ml:bundle.ml,unitCents:bundle.price,totalCents:bundle.price*line.quantity,bottleCount:bundle.count*line.quantity};
  }
  const price=prices[line.ml];
  if(!price||!Number.isInteger(line.flavour)||line.flavour<0||line.flavour>2||!Number.isInteger(line.sweetness)||line.sweetness<1||line.sweetness>5)throw Error('Please check the items in your cart.');
  if(config.availability[line.flavour]!==true)throw Error('A flavour in your cart is sold out. Remove it before continuing.');
  return {...line,unitCents:price,totalCents:price*line.quantity,bottleCount:line.quantity};
 }
 function quote(cart,method,zoneId,config){
  if(!Array.isArray(cart)||!cart.length)throw Error('Your cart is empty.');
  const items=cart.map(line=>priceLine(line,config));
  const service=config[method];if(!['pickup','delivery'].includes(method)||!service?.enabled)throw Error('Choose an available delivery or pickup option.');
  const subtotalCents=items.reduce((sum,item)=>sum+item.totalCents,0);
  if(subtotalCents<service.minimumCents)throw Error(`Minimum for ${method}: CAD $${(service.minimumCents/100).toFixed(2)} before tax.`);
  const zone=method==='delivery'?service.zones.find(z=>z.id===zoneId):null;
  if(method==='delivery'&&!zone)throw Error('Choose a supported delivery area.');
  const feeCents=method==='delivery'?zone.feeCents:service.feeCents;
  const taxable=subtotalCents+(config.taxDelivery?feeCents:0);
  const taxCents=Math.round(taxable*config.taxBasisPoints/10000);
  return {items,subtotalCents,feeCents,taxCents,totalCents:subtotalCents+feeCents+taxCents,method,zone:zone?.name||null,preparation:service.preparation};
 }
 const transitions={awaiting_payment:['paid','payment_failed'],payment_failed:['awaiting_payment','cancelled'],paid:['preparing','cancelled'],preparing:['ready','dispatched'],ready:['completed'],dispatched:['completed'],cancelled:['refund_pending'],refund_pending:['refunded'],completed:[],refunded:[]};
 function transition(order,next){
  if(!transitions[order.status]?.includes(next))throw Error('That order update is not available.');
  if(next==='refund_pending'&&!order.paid)throw Error('There is no payment to refund.');
  if(next==='ready'&&order.method!=='pickup'||next==='dispatched'&&order.method!=='delivery')throw Error('Status does not match the collection method.');
  return {...order,status:next,paid:order.paid||next==='paid',history:[...order.history,{status:next,at:new Date().toISOString()}]};
 }
 const api={quote,transition,priceLine,bundles};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ZoboCommerce=api;
})(typeof window==='undefined'?globalThis:window);
