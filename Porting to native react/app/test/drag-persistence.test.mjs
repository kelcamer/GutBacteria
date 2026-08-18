// Regression test: a node you drag must STAY where you put it.
//
// Reported as "if I move Bacteroides and then move Clostringium, it moves
// Bacteroides back". Dropping a node left it in the simulation, and the next
// drag tops alpha back up, springing every un-pinned node toward its computed
// position again.
//
//   1. npx vite build && npx vite preview --port 4180
//   2. "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
//        --remote-debugging-port=9223 --user-data-dir=/tmp/cdp about:blank
//   3. node test/drag-persistence.test.mjs
//
// Verified to FAIL on the old code (91px of drift) and PASS on the fix (0.0px),
// which is the only reason to trust it.
//
// TRAP, and it cost real time: the layout runs on requestAnimationFrame, which
// headless Chrome SUSPENDS for an unfocused page. Without Page.bringToFront and
// setFocusEmulationEnabled, step() never runs, every node reports position 0,0,
// and the measurements are silently meaningless.
const t=await (await fetch('http://localhost:9223/json/list')).json()
const page=t.find(x=>x.type==='page'); const ws=new WebSocket(page.webSocketDebuggerUrl)
let id=0; const p=new Map(); ws.onmessage=m=>{const j=JSON.parse(m.data); if(j.id&&p.has(j.id)){p.get(j.id)(j);p.delete(j.id)}}
await new Promise(r=>ws.onopen=r)
const send=(m,q={})=>new Promise(r=>{const i=++id;p.set(i,r);ws.send(JSON.stringify({id:i,method:m,params:q}))})
const ev=async e=>(await send('Runtime.evaluate',{expression:e,returnByValue:true})).result?.result?.value
const sleep=ms=>new Promise(r=>setTimeout(r,ms))
// The layout runs on requestAnimationFrame, which headless Chrome SUSPENDS for
// an unfocused/backgrounded page - so step() never runs, every node stays at
// 0,0, and any measurement taken here is a lie. Force the page active first.
await send('Page.enable')
await send('Page.bringToFront')
await send('Emulation.setFocusEmulationEnabled',{enabled:true})
await send('Emulation.setTouchEmulationEnabled',{enabled:false})
await send('Emulation.setDeviceMetricsOverride',{width:1400,height:1000,deviceScaleFactor:1,mobile:false})
await send('Page.navigate',{url:'http://localhost:4180/'}); await sleep(4000)
await ev(`[...document.querySelectorAll('button')].find(b=>/symptom to bacteria/i.test(b.textContent||''))?.click()`); await sleep(3000)
await ev(`[...document.querySelectorAll('button')].find(b=>(b.textContent||'').trim()==='Anxiety')?.click()`); await sleep(5000)

// Position helper: this codebase places nodes with a translate() on the <g>.
// Assert that rather than silently reading zeros - a missing transform means
// the map has not laid out yet and every measurement below would be a lie.
const POS = i => `(()=>{const g=[...document.querySelectorAll('[data-i]')].find(n=>n.dataset.i==='${i}');
  const tr=g&&g.getAttribute('transform'); if(!tr) return null;
  const q=tr.slice(tr.indexOf('(')+1,tr.indexOf(')')).split(/[ ,]+/);
  return {x:+q[0],y:+q[1]}})()`
const svgXY = async i => ev(POS(i))
const client = async i => ev(`(()=>{const g=[...document.querySelectorAll('[data-i]')].find(n=>n.dataset.i==='${i}');
  const c=g.querySelector('circle')||g; const r=c.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}})()`)

const two = await ev(`(()=>{const svg=[...document.querySelectorAll('svg')].find(s=>s.querySelector('[data-i]'));
  if(!svg) return null;
  const ns=[...svg.querySelectorAll('[data-i]')].filter(n=>n.getAttribute('transform') && getComputedStyle(n).display!=='none');
  return ns.length>8 ? [ns[3].dataset.i, ns[7].dataset.i] : null})()`)
if(!two){ console.log('FAIL: map has not laid out (no positioned nodes)'); ws.close(); process.exit(1) }
const [A,B]=two
await ev(`[...document.querySelectorAll('svg')].find(s=>s.querySelector('[data-i]')).scrollIntoView({block:'center'})`); await sleep(1000)

async function drag(i,dx,dy){
  const p0=await client(i)
  await send('Input.dispatchMouseEvent',{type:'mousePressed',x:p0.x,y:p0.y,button:'left',clickCount:1,buttons:1})
  for(let s=1;s<=10;s++){await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p0.x+dx*s/10,y:p0.y+dy*s/10,button:'left',buttons:1}); await sleep(25)}
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:p0.x+dx,y:p0.y+dy,button:'left',clickCount:1,buttons:0})
  await sleep(600)
}
await drag(A,-130,-80)
const afterA=await svgXY(A)
await drag(B,120,90)
await sleep(2000)   // the old code snapped A back while the simulation re-ran
const finalA=await svgXY(A)
const drift=Math.hypot(finalA.x-afterA.x, finalA.y-afterA.y)
console.log(`A dropped at ${JSON.stringify(afterA)} -> after dragging B: ${JSON.stringify(finalA)}`)
console.log(`drift ${drift.toFixed(1)}px ->`, drift < 8 ? 'PASS - stayed put' : 'FAIL - moved back')
ws.close()
