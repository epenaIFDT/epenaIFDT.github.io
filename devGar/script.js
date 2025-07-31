const empresas = {
  "20601438462": {
    razon: "OFICINA TOTAL S.A.",
    rep: "PAREDES ZEBALLOS,\nPAOLA ESTHER",
    correo: "pparedes@oficinatotal.pe"
  },
  "20102188293": {
    razon: "INGENIERIA DE LA INFORMATICA S.A.\nINFORDATA S.A.",
    rep: "VICENTE HUAPAYA\nJUAN CARLOS",
    correo: "jvicente@infordata.com.pe"
  },
  "20602334237": {
    razon: "VASTEC S.A.",
    rep: "VICENTE HUAPAYA,\nJUAN CARLOS",
    correo: "jvicente@vastec.com.pe"
  }
};

const autoResize = (ta) => {
  ta.style.height = "auto";
  ta.style.height = ta.scrollHeight + "px";
};

const timeStamp = () => {
  const d = new Date();
  return (
    d.getFullYear() +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0") +
    String(d.getHours()).padStart(2, "0") +
    String(d.getMinutes()).padStart(2, "0")
  );
};

function rellenarDatos() {
  const ruc = document.getElementById("ruc").value;
  const d = empresas[ruc] || {};
  document.getElementById("razon_social").value = d.razon || "";
  document.getElementById("representante").value = d.rep || "";
  document.getElementById("correo").value = d.correo || "";
  document.querySelectorAll("textarea").forEach(autoResize);

  const img = document.getElementById("firma-img");
  if (ruc) {
    img.src = `${ruc}.png`;
    img.style.display = "block";
  } else {
    img.removeAttribute("src");
    img.style.display = "none";
  }
}

function setFecha() {
  const f = new Date();
  const dd = String(f.getDate()).padStart(2, "0");
  const mm = String(f.getMonth() + 1).padStart(2, "0");
  const yyyy = f.getFullYear();
  document.getElementById("fecha-actual").textContent = `${dd}/${mm}/${yyyy}`;
}

async function generarPDF() {
  const img = document.getElementById("firma-img");
  if (img.style.display !== "none" && !img.complete)
    await new Promise((r) => {
      img.onload = r;
      img.onerror = r;
    });

  const original = document.getElementById("doc");
  const clone = original.cloneNode(true);
  const srcCtrls = original.querySelectorAll("input,textarea,select");
  clone.querySelectorAll("input,textarea,select").forEach((el, i) => {
    const s = srcCtrls[i],
      span = document.createElement("span");
    span.style.cssText = "white-space:pre-wrap;display:block;text-align:left";
    if (s.type === "checkbox") span.textContent = s.checked ? "☑" : "☐";
    else if (s.tagName === "SELECT") span.textContent = s.value.split("\\n").join("\n");
    else span.textContent = (s.value || "").trimStart();
    el.replaceWith(span);
  });

  await html2pdf()
    .set({
      margin: 5,
      filename: `SolDevGar(${timeStamp()}).pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    })
    .from(clone)
    .save();
}

function enviarFormulario() {
  const form = document.getElementById("send-form");
  form.innerHTML = "";

  const hidden = (name, value) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };

  const ruc = document.getElementById("ruc").value;
  const razon = document.getElementById("razon_social").value.trim();
  const rep = document.getElementById("representante").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const acuerdo = document.getElementById("acuerdo").value.split("\\n").join("\n");
  const importe = document.getElementById("importe").value.trim();
  const motivos = Array.from(document.querySelectorAll(".checkbox-group input"))
    .filter((cb) => cb.checked)
    .map((cb) => cb.parentElement.innerText.trim())
    .join(" | ");

  hidden("RUC", ruc);
  hidden("Razón social", razon);
  hidden("Representante", rep);
  hidden("Correo", correo);
  hidden("Acuerdo Marco", acuerdo);
  hidden("Importe garantía", importe);
  hidden("Motivos", motivos || "Ninguno");
  hidden("Fecha", document.getElementById("fecha-actual").textContent);
  hidden("_subject", "Nueva Solicitud de Devolución de Garantía");
  hidden("_template", "table");
  hidden("_cc", "epena@infordata.com.pe");

  form.submit();
}

async function imprimirYEnviar() {
  await generarPDF();
  enviarFormulario();
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("ruc").addEventListener("change", rellenarDatos);
  document.querySelectorAll("textarea").forEach((t) => {
    autoResize(t);
    t.addEventListener("input", () => autoResize(t));
  });
  document.getElementById("btn-pdf").addEventListener("click", imprimirYEnviar);
  setFecha();
  document.getElementById("version-info").textContent =
    "Versión: b.07.31.2" + timeStamp();
});
window.addEventListener("beforeprint", setFecha);
