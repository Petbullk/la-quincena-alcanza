// Configuración pública de Supabase (clave publicable, segura para usar en el navegador).
const SUPABASE_URL = "https://fpsxmxrsofnerxrnpxhj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_oZwgBAN3k4IKWPrUsF927w_psBwUA08";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- Calculadora de "tu número por día" ----
document.getElementById("calc-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const ingreso = parseFloat(document.getElementById("ingreso").value) || 0;
  const fijos = parseFloat(document.getElementById("fijos").value) || 0;
  const ahorro = parseFloat(document.getElementById("ahorro").value) || 0;

  const paraVivir = ingreso - fijos - ahorro;
  const porDia = Math.floor(paraVivir / 15);

  const result = document.getElementById("calc-result");
  const warning = document.getElementById("calc-warning");
  result.hidden = false;

  if (paraVivir <= 0) {
    document.getElementById("numero-dia").textContent = "$0";
    document.getElementById("para-vivir").textContent =
      "Con esos números no te queda nada para vivir la quincena. Revisa tus gastos fijos o baja el ahorro: el plan de 30 días te enseña cómo.";
    warning.hidden = true;
    return;
  }

  document.getElementById("numero-dia").textContent =
    "$" + porDia.toLocaleString("es-MX");
  document.getElementById("para-vivir").textContent =
    "Te quedan $" + paraVivir.toLocaleString("es-MX") + " para vivir la quincena, o sea $" +
    porDia.toLocaleString("es-MX") + " por día durante 15 días.";

  if (porDia < 50) {
    warning.hidden = false;
    warning.textContent =
      "Tu número está muy apretado. Con el plan de 30 días puedes subirlo cazando gastos hormiga.";
  } else {
    warning.hidden = true;
  }
});

// ---- Formulario del regalo gratis ----
document.getElementById("gift-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = document.getElementById("nombre").value.trim();
  const email = document.getElementById("correo").value.trim().toLowerCase();
  const accepts = document.getElementById("novedades").checked;
  const errorEl = document.getElementById("gift-error");
  const submitBtn = document.getElementById("gift-submit");
  errorEl.hidden = true;

  if (!name || !email) {
    errorEl.textContent = "Escribe tu nombre y tu correo para recibir la hoja.";
    errorEl.hidden = false;
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Guardando…";

  function showDownload(message) {
    document.getElementById("gift-success-msg").textContent = message;
    document.getElementById("gift-success").hidden = false;
    document.getElementById("gift-form").hidden = true;
  }

  try {
    const { error } = await supabaseClient
      .from("subscribers")
      .insert([{ name: name, email: email, accepts_marketing: accepts }]);

    if (error) {
      // Código 23505 = correo ya registrado (email único).
      if (error.code === "23505") {
        showDownload("¡Listo! Ese correo ya estaba registrado, aquí tienes tu hoja.");
      } else {
        throw error;
      }
    } else {
      showDownload("¡Listo! Ya es tuya. Aquí tienes tu hoja.");
    }
  } catch (err) {
    console.error("Error al guardar el suscriptor:", err);
    errorEl.textContent =
      "Hubo un problema de conexión y no pudimos guardar tu correo. Revisa tu internet e inténtalo de nuevo.";
    errorEl.hidden = false;
    submitBtn.disabled = false;
    submitBtn.textContent = "Quiero mi hoja gratis";
  }
});
