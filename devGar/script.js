/* ========== Datos de empresas por RUC ========== */
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

/* ========== Utilidades ========== */
const autoResize = ta => {
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

/* ========== Rellenar datos al cambiar RUC ========== */
function rellenarDatos() {
  const ruc = document.getElementById("ruc").value;
  const data = empresas[ruc] || {};

  document.getElementById("razon_social").value = data.razon || "";
  document.getElementById("representante").value = data.rep || "";
  document.getElementById("correo").value = data.correo || "";

  document.querySelectorAll("textarea").forEach(autoResize);

  /* firma */
  const img = document.getElementById("firma-img");
  if (ruc) {
    img.src = `${ruc}.png`;
    img.style.display = "block";
  } else {
    img.removeAttribute("src");
    img.style.display = "none";
  }
}

/* ========== Fecha DD/MM/YYYY ========== */
function setFecha() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  document.getElementById("fecha-actual").textContent = `${dd}/${mm}/${yyyy}`;
}

/* ========== Generar PDF ========== */
async function generarPDF() {
  if (typeof html2pdf === "undefined") {
    alert("html2pdf no cargó");
    return;
  }

  /* espera a que cargue la firma (si aplica) */
  const img = document.getElementById("firma-img");
  if (img.style.display !== "none" && !img.complete) {
    await new Promise(res => {
      img.onload = res;
      img.onerror = res;
    });
  }

  /* clonar documento y reemplazar controles */
  const original = document.getElementById("doc");
  const clone = original.cloneNode(true);
  const srcCtrls = original.querySelectorAll("input,textarea,select");
  clone.querySelectorAll("input,textarea,select").forEach((el, i) => {
    const src = srcCtrls[i];
    const span = document.createElement("span");
    span.style.cssText = "white-space:pre-wrap;display:block;text-align:left";

    if (src.type === "checkbox") {
      span.textContent = src.checked ? "☑" : "☐";
    } else if (src.tagName === "SELECT") {
      /* Sustituir \n por saltos reales */
      span.textContent = (src.value || "").split("\\n").join("\n");
    } else {
      span.textContent = (src.value || "").trimStart();
    }
    el.replaceWith(span);
  });

  /* Exportar */
  html2pdf()
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

/* ========== Inicialización ========== */
window.addEventListener("DOMContentLoaded", () => {
  /* listeners */
  document.getElementById("ruc").addEventListener("change", rellenarDatos);
  document
    .querySelectorAll("textarea")
    .forEach(t => {
      autoResize(t);
      t.addEventListener("input", () => autoResize(t));
    });
  document.getElementById("btn-pdf").addEventListener("click", generarPDF);

  /* fecha y versión */
  setFecha();
  document.getElementById("version-info").textContent =
    "Versión: b.07.31." + timeStamp();
});

/* fecha en impresión */
window.addEventListener("beforeprint", setFecha);
