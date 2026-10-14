// Vector icons avoid platform-dependent symbol/emoji rendering.
const iconPaths={spark:'M12 1v22M1 12h22M4 4l16 16M4 20L20 4',check:'M4 12l5 5L20 6',close:'M5 5l14 14M5 19L19 5',plus:'M12 4v16M4 12h16',minus:'M4 12h16'};
function graphicIcon(kind){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.classList.add('graphic-icon',`graphic-icon-${kind}`);const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',iconPaths[kind]);svg.append(path);return svg}
function replaceSymbolIcons(root){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(node=>{
  if(node.parentElement?.closest('script,style,svg,textarea'))return;
  const value=node.textContent,standalone=value.trim();
  if(['+','−','×'].includes(standalone)){node.replaceWith(graphicIcon({'+':'plus','−':'minus','×':'close'}[standalone]));return}
  if(!/[✳✹✴✺✓]/.test(value))return;
  const fragment=document.createDocumentFragment();value.split(/([✳✹✴✺✓])/).forEach(part=>fragment.append(/[✳✹✴✺✓]/.test(part)?graphicIcon(part==='✓'?'check':'spark'):document.createTextNode(part)));node.replaceWith(fragment);
 });
}
replaceSymbolIcons(document.body);
const iconObserver=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===Node.ELEMENT_NODE)replaceSymbolIcons(node);else if(node.nodeType===Node.TEXT_NODE&&node.parentElement)replaceSymbolIcons(node.parentElement)})));
iconObserver.observe(document.body,{childList:true,subtree:true});
