/* ===== Datos de empresas ===== */
const empresas = {
  "20601438462": { razon:"OFICINA TOTAL S.A.",
                   rep:"PAREDES ZEBALLOS,\nPAOLA ESTHER",
                   correo:"pparedes@oficinatotal.pe" },
  "20102188293": { razon:"INGENIERIA DE LA INFORMATICA S.A.\nINFORDATA S.A.",
                   rep:"VICENTE HUAPAYA\nJUAN CARLOS",
                   correo:"jvicente@infordata.com.pe" },
  "20602334237": { razon:"VASTEC S.A.",
                   rep:"VICENTE HUAPAYA,\nJUAN CARLOS",
                   correo:"jvicente@vastec.com.pe" }
};

/* ===== Utilidades ===== */
const autoResize = ta => { ta.style.height="auto"; ta.style.height=ta.scrollHeight+"px"; };

const timeStamp = () => {
  const d=new Date();
  return d.getFullYear()+
         String(d.getMonth()+1).padStart(2,"0")+
         String(d.getDate()).padStart(2,"0")+
         String(d.getHours()).padStart(2,"0")+
         String(d.getMinutes()).padStart(2,"0");
};

/* ===== Rellenar datos ===== */
function rellenar(){
  const ruc = document.getElementById("ruc").value,
        d   = empresas[ruc] || {};
  document.getElementById("razon_social").value = d.razon || "";
  document.getElementById("representante").value = d.rep || "";
  document.getElementById("correo").value = d.correo || "";
  document.querySelectorAll("textarea").forEach(autoResize);

  const img=document.getElementById("firma-img");
  if(ruc){ img.src=`${ruc}.png`; img.style.display="block"; }
  else   { img.removeAttribute("src"); img.style.display="none"; }
}

/* ===== Fecha DD/MM/YYYY ===== */
function setFecha(){
  const d=new Date();
  const dd=String(d.getDate()).padStart(2,"0");
  const mm=String(d.getMonth()+1).padStart(2,"0");
  const yyyy=d.getFullYear();
  document.getElementById("fecha-actual").textContent=`${dd}/${mm}/${yyyy}`;
}

/* ===== Enviar datos a Formspree ===== */
function sendFormspree(){
  const correo = document.getElementById("correo").value || "sin-correo@ejemplo.com";
  const payload = {
    email: correo,
    ruc: document.getElementById("ruc").value,
    razon_social: document.getElementById("razon_social").value,
    representante: document.getElementById("representante").value,
    acuerdo_marco: document.getElementById("acuerdo").value.replace(/\\n/g,"\n"),
    fecha: document.getElementById("fecha-actual").textContent,
    timestamp: timeStamp()
  };

  fetch("https://formspree.io/f/xdkddyrg",{
    method:"POST",
    headers:{ "Content-Type":"application/json", "Accept":"application/json" },
    body: JSON.stringify(payload)
  }).catch(err=>console.error("Formspree error:",err));
}

/* ===== Generar PDF y enviar formulario ===== */
async function generarPDF(){
  /* espera firma */
  const img=document.getElementById("firma-img");
  if(img.style.display!=="none" && !img.complete){
    await new Promise(res=>{img.onload=res;img.onerror=res;});
  }

  /* clonar y remplazar */
  const base=document.getElementById("doc"), clone=base.cloneNode(true);
  const srcCtrls=base.querySelectorAll("input,textarea,select");
  clone.querySelectorAll("input,textarea,select").forEach((el,i)=>{
    const s=srcCtrls[i], span=document.createElement("span");
    span.style.cssText="white-space:pre-wrap;display:block;text-align:left";
    if(s.type==="checkbox") span.textContent=s.checked?"☑":"☐";
    else if(s.tagName==="SELECT") span.textContent=(s.value||"").replace(/\\n/g,"\n");
    else span.textContent=(s.value||"").trimStart();
    el.replaceWith(span);
  });

  /* PDF */
  await html2pdf()
    .set({
      margin:5,
      filename:`SolDevGar(${timeStamp()}).pdf`,
      image:{type:"jpeg",quality:0.98},
      html2canvas:{scale:2,useCORS:true},
      jsPDF:{unit:"mm",format:"a4",orientation:"portrait"}
    })
    .from(clone).save();

  /* Formspree */
  sendFormspree();
}

/* ===== Inicio ===== */
window.addEventListener("DOMContentLoaded",()=>{
  document.getElementById("ruc").addEventListener("change",rellenar);
  document.querySelectorAll("textarea").forEach(t=>{autoResize(t);t.addEventListener("input",()=>autoResize(t));});
  document.getElementById("btn-pdf").addEventListener("click",generarPDF);

  setFecha();
  document.getElementById("version-info").textContent =
    "Versión: b.07.31.1." + timeStamp();
});

window.addEventListener("beforeprint",setFecha);
