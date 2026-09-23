
let S={w:['',''],rows:[0,1,2,3].map(i=>({n:'ABCD'[i],x:['',''],y:0})),solved:false},AS=false;
const $=s=>document.querySelector(s);
function num(s){s=String(s).trim();if(s==='')return NaN;if(s.includes('/')){const[a,b]=s.split('/');const v=Number(a)/Number(b);return isFinite(v)?v:NaN}const v=Number(s);return isFinite(v)?v:NaN}
function fmt(v){if(!isFinite(v))return'—';if(Math.abs(v)<1e-9)return'0';return String(+v.toFixed(4))}
const sub=n=>String(n).split('').map(c=>'₀₁₂₃₄₅₆₇₈₉'[c]).join('');
function render(){
 const d=S.w.length;
 $('#wbox').innerHTML=S.w.map((v,j)=>`<label>w${sub(j+1)}<input data-w="${j}" value="${v}" placeholder="–"></label>`).join('');
 let h=`<thead><tr><th>Point</th>${S.w.map((_,j)=>`<th>x${sub(j+1)}${d>1?` <button class="x" data-dc="${j}" title="Remove column">×</button>`:''}</th>`).join('')}<th>y</th><th class="res">w·x+b</th><th class="res">y(w·x+b)</th><th class="res">Sign</th><th class="res">ξ</th><th class="res">Status</th><th></th></tr></thead><tbody>`;
 S.rows.forEach((r,i)=>{h+=`<tr data-i="${i}"><td><input class="nm" data-n="${i}" value="${r.n}"></td>${r.x.map((v,j)=>`<td><input data-r="${i}" data-c="${j}" value="${v}" placeholder="–"></td>`).join('')}<td><select data-y="${i}"><option value="0"${r.y===0?" selected":""}>–</option><option value="1"${r.y===1?" selected":""}>+1</option><option value="-1"${r.y===-1?" selected":""}>−1</option></select></td><td class="n res" data-k="f"></td><td class="n res" data-k="m"></td><td class="res" data-k="s"></td><td class="n res" data-k="xi"></td><td class="res" data-k="st"></td><td><button class="x" data-dr="${i}" title="Remove row">×</button></td></tr>`});
 $('#tbl').innerHTML=h+'</tbody>';$('#tbl').classList.toggle('hide-res',!S.solved);if(S.solved)run(false)}
function calc(){
 const w=S.w.map(num),b=num($('#b').value),C=num($('#C').value),nw=Math.hypot(...w);
 let sxi=0,wrong=0,svs=[],vio=[],allOk=true,right=0;
 S.rows.forEach((r,i)=>{
  const f=r.x.reduce((s,v,j)=>s+num(v)*w[j],b),m=r.y*f,xi=Math.max(0,1-m);sxi+=xi;
  const sign=Math.abs(f)<1e-9?['On boundary','t-w']:m>0?['Right sign ✓','t-ok']:['Wrong sign ✗','t-bad'];
  let st;if(m<-1e-9){wrong++;st=['Misclassified','t-bad'];vio.push(r.n)}else if(Math.abs(f)<1e-9){wrong++;st=['On boundary','t-w'];vio.push(r.n)}else{right++;
   if(Math.abs(m-1)<1e-6){st=['Support vector','t-ok'];svs.push(r.n)}else if(m>1)st=['Outside margin','t-n'];else{st=['Inside margin','t-w'];vio.push(r.n)}}
  if(m<1-1e-9)allOk=false;
  const tr=document.querySelector(`tr[data-i="${i}"]`);if(!tr)return;
  const set=(k,v)=>tr.querySelector(`[data-k="${k}"]`).innerHTML=v;
  set('f',fmt(f));set('m',fmt(m));set('s',`<span class="tag ${sign[1]}">${sign[0]}</span>`);set('xi',fmt(xi));set('st',`<span class="tag ${st[1]}">${st[0]}</span>`)});
 const n=S.rows.length,margin=nw>1e-12?2/nw:NaN;
 const v=$('#verdict');
 if(!n){v.className='';v.textContent='Add some points.'}
 else if(wrong===n&&n>0&&nw>0){v.className='t-bad';v.style.background='var(--badb)';v.style.color='var(--bad)';v.textContent='Every point has the wrong sign. w and b are probably flipped: try “Flip sign”.'}
 else if(wrong>0){v.style.background='var(--badb)';v.style.color='var(--bad)';v.textContent=`${wrong} of ${n} points have the wrong sign or lie on the boundary.`}
 else if(allOk){v.style.background='var(--okb)';v.style.color='var(--ok)';v.textContent='Valid hard-margin solution: every y(w·x+b) ≥ 1.'}
 else{v.style.background='var(--warnb)';v.style.color='var(--warn)';v.textContent='All signs are right, but some points are inside the margin (soft-margin case, ξ > 0).'}
 const K=[['‖w‖',fmt(nw)],['Margin 2/‖w‖',fmt(margin)],['½‖w‖²',fmt(nw*nw/2)],['Σξ',fmt(sxi)],[`J = ½‖w‖² + C·Σξ`,(isNaN(C)?'—':fmt(nw*nw/2+C*sxi))],['Accuracy',`${right}/${n}`],['Support vectors',svs.join(', ')||'none']];
 $('#kpi').innerHTML=K.map(([a,c])=>`<div class="k"><span>${a}</span><b>${c}</b></div>`).join('');
 const term=(c,j)=>`${c<0?'−':'+'} ${fmt(Math.abs(c))}·x${sub(j+1)}`;
 const lhs=w.map(term).join(' ').replace(/^\+ /,'')+` ${b<0?'−':'+'} ${fmt(Math.abs(b))}`;
 $('#eq').innerHTML=`Boundary: ${lhs} = 0<br>Margin planes: ${lhs} = +1 and = −1<br>Classifier: ŷ = sign(w·x + b)`;
 plot(w,b);S.solved=true;$('#out').style.display='grid';$('#tbl').classList.remove('hide-res')}
function hideRes(){S.solved=false;$('#out').style.display='none';$('#tbl').classList.add('hide-res')}
function run(click){
 const M=$('#msg');M.textContent='';
 document.querySelectorAll('select[data-y]').forEach(t=>S.rows[t.dataset.y].y=Number(t.value));
 const bad=S.rows.findIndex(r=>r.y===0||r.x.some(v=>isNaN(num(v))));
 if(S.rows.length<2||bad>=0){hideRes();M.textContent=S.rows.length<2?'Add at least 2 points.':`Fill in every x value and choose y (+1 or −1) for point ${S.rows[bad].n}.`;return}
 const bv=$('#b').value;
 if(S.w.every(v=>v.trim()==='')&&bv.trim()===''){if(!click){hideRes();return}AS=false;autoSolve();if(!AS){hideRes();return}}
 else if(S.w.some(v=>isNaN(num(v)))||isNaN(num(bv))){hideRes();M.textContent='Enter every w and b value, or leave all of them blank to solve the optimal SVM automatically.';return}
 calc()}
function plot(w,b){
 const c=$('#plotcard'),svg=$('#plot');if(S.w.length<2){c.style.display='none';return}c.style.display='';
 const W=420,H=330,p=34,xs=S.rows.map(r=>num(r.x[0])),ys=S.rows.map(r=>num(r.x[1]));
 if(!xs.length){svg.innerHTML='';return}
 let x0=Math.min(...xs)-1,x1=Math.max(...xs)+1,y0=Math.min(...ys)-1,y1=Math.max(...ys)+1;
 const X=x=>p+(x-x0)/(x1-x0)*(W-2*p),Y=y=>H-p-(y-y0)/(y1-y0)*(H-2*p);
 let o=`<rect x="${p}" y="${p/2}" width="${W-2*p}" height="${H-1.5*p}" fill="none" stroke="var(--bd)"/>`;
 for(let x=Math.ceil(x0);x<=x1;x++)o+=`<text x="${X(x)}" y="${H-p+14}" font-size="10" text-anchor="middle" fill="var(--mut)">${x}</text>`;
 for(let y=Math.ceil(y0);y<=y1;y++)o+=`<text x="${p-5}" y="${Y(y)+3}" font-size="10" text-anchor="end" fill="var(--mut)">${y}</text>`;
 o+=`<text x="${W/2}" y="${H-4}" font-size="11" text-anchor="middle" fill="var(--mut)">x₁</text><text x="10" y="${H/2}" font-size="11" fill="var(--mut)">x₂</text>`;
 const ln=(cv,st,da)=>{let a,e;if(Math.abs(w[1])>=Math.abs(w[0])&&Math.abs(w[1])>1e-12){a=[x0,(cv-b-w[0]*x0)/w[1]];e=[x1,(cv-b-w[0]*x1)/w[1]]}else if(Math.abs(w[0])>1e-12){a=[(cv-b-w[1]*y0)/w[0],y0];e=[(cv-b-w[1]*y1)/w[0],y1]}else return'';
  return`<line x1="${X(a[0])}" y1="${Y(a[1])}" x2="${X(e[0])}" y2="${Y(e[1])}" stroke="${st}" stroke-width="${da?1.3:2.2}" ${da?'stroke-dasharray="5 4"':''}/>`};
 svg.setAttribute('clip-path','');
 o+=`<clipPath id="cp"><rect x="${p}" y="${p/2}" width="${W-2*p}" height="${H-1.5*p}"/></clipPath><g clip-path="url(#cp)">${ln(1,'var(--pos)',1)}${ln(-1,'var(--neg)',1)}${ln(0,'var(--ink)',0)}</g>`;
 S.rows.forEach(r=>{const f=r.x.reduce((s,v,j)=>s+num(v)*w[j],b),m=r.y*f,cx=X(num(r.x[0])),cy=Y(num(r.x[1]));
  if(m<=1e-9)o+=`<circle cx="${cx}" cy="${cy}" r="11" fill="none" stroke="var(--bad)" stroke-width="2"/>`;
  else if(Math.abs(m-1)<1e-6)o+=`<circle cx="${cx}" cy="${cy}" r="11" fill="none" stroke="var(--ok)" stroke-width="1.5"/>`;
  o+=r.y>0?`<circle cx="${cx}" cy="${cy}" r="6" fill="var(--pos)"/>`:`<rect x="${cx-5.5}" y="${cy-5.5}" width="11" height="11" fill="var(--neg)"/>`;
  o+=`<text x="${cx+9}" y="${cy-9}" font-size="11" fill="var(--ink)">${r.n}</text>`});
 svg.innerHTML=o}
function gauss(A,B){const n=B.length;A=A.map((r,i)=>[...r,B[i]]);for(let c=0;c<n;c++){let q=c;for(let r=c+1;r<n;r++)if(Math.abs(A[r][c])>Math.abs(A[q][c]))q=r;if(Math.abs(A[q][c])<1e-9)return null;[A[c],A[q]]=[A[q],A[c]];for(let r=0;r<n;r++)if(r!=c){const k=A[r][c]/A[c][c];for(let j=c;j<=n;j++)A[r][j]-=k*A[c][j]}}return A.map((r,i)=>r[n]/r[i])}
function autoSolve(){
 const X=S.rows.map(r=>r.x.map(num)),Y=S.rows.map(r=>r.y),n=X.length,d=S.w.length,dot=(a,c)=>a.reduce((s,v,j)=>s+v*c[j],0),M=$('#msg');
 if(n<2||!Y.includes(1)||!Y.includes(-1)){M.textContent='Need at least one +1 and one −1 point.';return}
 if(n>16){M.textContent='Solver supports up to 16 points.';return}
 for(let mask=1;mask<1<<n;mask++){
  const id=[];for(let i=0;i<n;i++)if(mask>>i&1)id.push(i);
  if(id.length<2||id.length>d+1||!id.some(i=>Y[i]>0)||!id.some(i=>Y[i]<0))continue;
  const A=id.map(a=>[...id.map(j=>Y[a]*Y[j]*dot(X[a],X[j])),Y[a]]);A.push([...id.map(j=>Y[j]),0]);
  const s=gauss(A,[...id.map(()=>1),0]);if(!s)continue;
  const al=s.slice(0,id.length),bb=s[id.length];if(al.some(a=>a<-1e-9))continue;
  const w=Array(d).fill(0);id.forEach((j,t)=>{for(let q=0;q<d;q++)w[q]+=al[t]*Y[j]*X[j][q]});
  if(X.every((x,i)=>Y[i]*(dot(w,x)+bb)>=1-1e-7)){
   S.w=w.map(v=>String(+v.toFixed(6)));$('#b').value=String(+bb.toFixed(6));render();
   AS=true;M.textContent='Solved (hard margin). α: '+id.map((j,t)=>`${S.rows[j].n}=${fmt(al[t])}`).join(', ')+'.';return}}
 M.textContent='No hard-margin solution: these points are not linearly separable. Check the labels or use a soft margin (C).'}
['input','change'].forEach(ev=>document.addEventListener(ev,e=>{const t=e.target,d=t.dataset;
 if(d.w!==undefined)S.w[d.w]=t.value;else if(d.r!==undefined)S.rows[d.r].x[d.c]=t.value;else if(d.n!==undefined)S.rows[d.n].n=t.value;else if(d.y!==undefined)S.rows[d.y].y=Number(t.value);else if(t.id!=='b'&&t.id!=='C')return;if(S.solved)run(false)}));
document.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;const d=t.dataset;
 if(d.dr!==undefined){S.rows.splice(d.dr,1);render()}
 else if(d.dc!==undefined){S.w.splice(d.dc,1);S.rows.forEach(r=>r.x.splice(d.dc,1));render()}
 else if(t.id==='addr'){S.rows.push({n:String.fromCharCode(65+S.rows.length%26),x:S.w.map(()=>''),y:0});render()}
 else if(t.id==='addc'){S.w.push('');S.rows.forEach(r=>r.x.push(''));render()}
 else if(t.id==='flip'){const fl=v=>{const n=num(v);return isNaN(n)?v:String(-n||0)};S.w=S.w.map(fl);$('#b').value=fl($('#b').value);render()}
 else if(t.id==='solve')run(true)});
render();
