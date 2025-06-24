const URL = "https://visualmusic-backend-1.onrender.com/api/upload";

const fileIn = document.getElementById("file"),
      btnSel = document.getElementById("btnSel"),
      fname = document.getElementById("fname"),
      btnGen = document.getElementById("btnGen"),
      cv = document.getElementById("canvas"),
      ctx = cv.getContext("2d");
cv.width=window.innerWidth*0.9; cv.height=window.innerHeight*0.6;

btnSel.onclick = ()=> fileIn.click();
fileIn.onchange = ()=> fname.textContent = fileIn.files[0]?.name||"Ningún archivo seleccionado";

let notes=[], active=[], t0=null;
const cols={ drums:"#FF0055", bass:"#66FF00", piano:"#00D1FF", vocals:"#FFD700", other:"#AAAAAA" };

function mapY(p){const m=[40,90];return cv.height-( (p-m[0])/(m[1]-m[0]) * cv.height );}
function draw(){
  if(!t0) return;
  const now=(performance.now()/1e3)-t0;
  ctx.fillStyle="rgba(248,247,242,0.2)"; ctx.fillRect(0,0,cv.width,cv.height);
  notes.forEach(n=>{ if(!n.on && n.start<=now){ n.on=true; n.x=Math.random()*cv.width; n.y=mapY(n.pitch); n.s=10+Math.random()*10; active.push(n);} });
  for(let i=active.length-1;i>=0;i--){
    const n=active[i], d=n.end-n.start, p=(now-n.start)/d;
    if(p>1){ active.splice(i,1); continue; }
    ctx.globalAlpha=1-p;
    ctx.beginPath(); ctx.fillStyle=cols[n.instrument]||"#000"; ctx.arc(n.x,n.y,n.s,0,2*Math.PI); ctx.fill();
    ctx.globalAlpha=1;
  }
  requestAnimationFrame(draw);
}

btnGen.onclick = async ()=>{
  if(!fileIn.files.length){ alert("Selecciona un archivo."); return; }
  btnGen.disabled=true; btnGen.textContent="Procesando...";
  const fd=new FormData(); fd.append("audio", fileIn.files[0]);
  try {
    const r=await fetch(URL,{method:"POST",body:fd});
    const j=await r.json();
    if(!r.ok) alert("Error backend: "+j.error);
    else { notes=j.map(n=>({...n,on:false})); t0=performance.now()/1e3; draw(); }
  } catch(e){ alert("No se pudo conectar."); console.error(e); }
  finally{ btnGen.disabled=false; btnGen.textContent="Generar Visualización"; }
};
