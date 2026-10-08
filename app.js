// Reemplaza con tus datos de Supabase (Project Settings -> API)
const SUPABASE_URL = "https://nmyzeltaswivxpbwxnhi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teXplbHRhc3dpdnhwYnd4bmhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMTA0MzUsImV4cCI6MjEwNjg4NjQzNX0.NQNCTnIQPC3AYB6mGRUyHEWh2zILUA8FgLPC0mPzAww";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const claveInput = document.getElementById("clave");
const nombreInput = document.getElementById("nombre");
const edadInput = document.getElementById("edad");
const fechaNacimientoInput = document.getElementById("fecha_nacimiento");
const clienteForm = document.getElementById("clienteForm");

const btnNuevo = document.getElementById("btnNuevo");
const btnEliminar = document.getElementById("btnEliminar");
const tablaClientes = document.getElementById("tablaClientes");

document.addEventListener("DOMContentLoaded", cargarClientes);

// 1. Cargar datos
async function cargarClientes() {
  const { data, error } = await supabaseClient.from("clientes").select("*").order("clave");
  
  if (error) {
    console.error("Error al cargar clientes:", error);
    alert("Error al conectar con Supabase: " + error.message);
    return;
  }

  tablaClientes.innerHTML = "";
  data.forEach((cliente) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${cliente.clave}</td><td>${cliente.nombre}</td>`;
    tr.addEventListener("click", () => seleccionarCliente(cliente));
    tablaClientes.appendChild(tr);
  });
}

function seleccionarCliente(cliente) {
  claveInput.value = cliente.clave;
  nombreInput.value = cliente.nombre || "";
  edadInput.value = cliente.edad || "";
  fechaNacimientoInput.value = cliente.fecha_nacimiento || "";
}

btnNuevo.addEventListener("click", () => {
  clienteForm.reset();
});

// Búsqueda automática al perder el foco en "clave"
claveInput.addEventListener("blur", async () => {
  const clave = claveInput.value.trim();
  if (!clave) return;

  const { data } = await supabaseClient
    .from("clientes")
    .select("*")
    .eq("clave", clave)
    .maybeSingle();

  if (data) {
    nombreInput.value = data.nombre || "";
    edadInput.value = data.edad || "";
    fechaNacimientoInput.value = data.fecha_nacimiento || "";
  }
});

// Guardar / Actualizar
clienteForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const cliente = {
    clave: claveInput.value.trim(),
    nombre: nombreInput.value.trim(),
    edad: edadInput.value ? parseInt(edadInput.value) : null,
    fecha_nacimiento: fechaNacimientoInput.value || null,
  };

  const { error } = await supabaseClient
    .from("clientes")
    .upsert(cliente, { onConflict: "clave" });

  if (error) {
    alert("Error al guardar: " + error.message);
  } else {
    alert("¡Cliente guardado correctamente!");
    clienteForm.reset();
    cargarClientes();
  }
});

// Eliminar
btnEliminar.addEventListener("click", async () => {
  const clave = claveInput.value.trim();
  if (!clave) {
    alert("Ingresa o selecciona la clave del cliente a eliminar.");
    return;
  }

  if (!confirm(`¿Deseas eliminar al cliente con clave ${clave}?`)) return;

  const { error } = await supabaseClient.from("clientes").delete().eq("clave", clave);

  if (error) {
    alert("Error al eliminar: " + error.message);
  } else {
    alert("Cliente eliminado.");
    clienteForm.reset();
    cargarClientes();
  }
});