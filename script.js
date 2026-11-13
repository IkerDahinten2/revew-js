/**
 * DOCUMENTACIÓN:
 * Este script maneja el estado de la aplicación, carga datos externos,
 * gestiona la paginación y la navegación entre vistas (Inmuebles/Usuarios).
 */

let db = { inmuebles: [], usuarios: [] };
let paginaActual = 1;
const limite = 5;

// Carga Inicial
async function init() {
    try {
        const res = await fetch('data.json');
        db = await res.json();
        renderVistaInmuebles();
    } catch (e) {
        console.error("Error cargando JSON. Usa un servidor local.");
    }
}

// Navegación de Pestañas
document.getElementById('tab-inmuebles').onclick = () => {
    switchTab('tab-inmuebles');
    renderVistaInmuebles();
};

document.getElementById('tab-usuarios').onclick = () => {
    switchTab('tab-usuarios');
    document.getElementById('dynamic-header').innerHTML = "";
    document.getElementById('content-area').innerHTML = "<h2>Lista de Usuarios</h2><p>Admin: John Doe</p>";
    document.getElementById('pagination-bar').style.display = 'none';
};

function switchTab(id) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('pagination-bar').style.display = 'flex';
}

// Renderizado de Inmuebles
function renderVistaInmuebles() {
    const header = document.getElementById('dynamic-header');
    const content = document.getElementById('content-area');

    header.innerHTML = `
        <div class="toolbar">
            <input type="text" class="search-input" placeholder="Buscar...">
            <button class="btn-black" onclick="renderFormulario()">Nuevo</button>
        </div>
    `;

    const inicio = (paginaActual - 1) * limite;
    const items = db.inmuebles.slice(inicio, inicio + limite);

    content.innerHTML = items.map(i => `
        <div class="inmueble-card">
            <div class="img-container"><img src="${i.imagen}"></div>
            <div class="info-tipo">${i.tipo}</div>
            <div class="info-dir">${i.direccion}</div>
            <div class="info-precio">$${i.valor.toLocaleString()}</div>
            <div class="actions">
                <span onclick="verDetalle(${i.id})">Ver</span>
                <span onclick="eliminar(${i.id})">Eliminar</span>
            </div>
        </div>
    `).join('');
    
    actualizarPaginacion();
}

// Ver Detalles (Modal)
function verDetalle(id) {
    const i = db.inmuebles.find(item => item.id === id);
    const body = document.getElementById('modal-body');
    body.innerHTML = `
        <h2>Detalles del Inmueble</h2>
        <hr>
        <p><strong>Dirección:</strong> ${i.direccion}</p>
        <p><strong>Matrícula:</strong> ${i.matricula}</p>
        <p><strong>Área:</strong> ${i.area} m²</p>
        <p><strong>Propietario:</strong> ${i.propietario} (${i.id_prop})</p>
        <p><strong>Valor:</strong> $${i.valor.toLocaleString()}</p>
        <p><strong>Comercial:</strong> ${i.comercial ? 'Sí' : 'No'}</p>
    `;
    document.getElementById('modal-detalle').style.display = 'block';
}

function cerrarModal() { document.getElementById('modal-detalle').style.display = 'none'; }

// Eliminar
function eliminar(id) {
    if(confirm("¿Eliminar este registro?")) {
        db.inmuebles = db.inmuebles.filter(i => i.id !== id);
        renderVistaInmuebles();
    }
}

// Paginación
function cambiarPagina(p) {
    const totalPaginas = Math.ceil(db.inmuebles.length / limite);
    if(p >= 1 && p <= totalPaginas) {
        paginaActual = p;
        renderVistaInmuebles();
    }
}

function actualizarPaginacion() {
    const btns = document.querySelectorAll('.page-btn');
    btns.forEach((b, index) => {
        b.classList.remove('active');
        if(index + 1 === paginaActual) b.classList.add('active');
    });
}

function renderFormulario() {
    const content = document.getElementById('content-area');
    const pagination = document.getElementById('pagination-bar');
    
    // Ocultamos la paginación mientras se llena el formulario
    if(pagination) pagination.style.display = 'none';

    content.innerHTML = `
        <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
            <h2 style="margin-bottom: 25px; border-bottom: 2px solid #eee; padding-bottom: 10px;">Registrar Nuevo Inmueble</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <input type="text" id="new-tipo" placeholder="Tipo (Casa / Apartamento)" class="search-input" style="width: 100%;">
                <input type="text" id="new-dir" placeholder="Dirección Exacta" class="search-input" style="width: 100%;">
                <input type="text" id="new-ciudad" placeholder="Ciudad" class="search-input" style="width: 100%;">
                <input type="text" id="new-depto" placeholder="Departamento" class="search-input" style="width: 100%;">
                <input type="text" id="new-mat" placeholder="Matrícula Inmobiliaria" class="search-input" style="width: 100%;">
                <input type="number" id="new-area" placeholder="Área (m²)" class="search-input" style="width: 100%;">
                <input type="text" id="new-prop" placeholder="Nombre del Propietario" class="search-input" style="width: 100%;">
                <input type="text" id="new-id-prop" placeholder="ID Propietario" class="search-input" style="width: 100%;">
                <input type="number" id="new-valor" placeholder="Valor del Inmueble ($)" class="search-input" style="width: 100%;">
                <input type="text" id="new-img" placeholder="URL de la imagen (Link)" class="search-input" style="width: 100%;">
                
                <div style="grid-column: span 2; display: flex; align-items: center; gap: 10px; background: #f9f9f9; padding: 15px; border-radius: 8px;">
                    <input type="checkbox" id="new-comercial" style="width: 20px; height: 20px;">
                    <label for="new-comercial" style="font-weight: 600;">¿Es para uso comercial?</label>
                </div>
            </div>

            <div style="margin-top: 30px; display: flex; gap: 15px;">
                <button class="btn-black" onclick="guardarNuevoInmueble()" style="background: #28a745; flex: 2;">Guardar Inmueble</button>
                <button class="btn-black" onclick="renderVistaInmuebles()" style="background: #6c757d; flex: 1;">Cancelar</button>
            </div>
        </div>
    `;
}

window.onload = init;