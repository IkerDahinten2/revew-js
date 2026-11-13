/**
 * Panel de gestión de inmuebles (ACME Inmobiliaria).
 *
 * - Carga los datos iniciales de data.json y los persiste en localStorage,
 *   así las altas y bajas se conservan al recargar.
 * - Listado con búsqueda y paginación dinámica.
 * - Detalle en modal, eliminación y registro de nuevos inmuebles.
 */

const STORAGE_KEY = 'acme_db';
const POR_PAGINA = 5;
const IMAGEN_RESPALDO = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150"><rect width="200" height="150" fill="#e9ecef"/>' +
    '<text x="50%" y="50%" fill="#6c757d" font-family="sans-serif" font-size="14" text-anchor="middle" dominant-baseline="middle">Sin imagen</text></svg>'
);

let db = { inmuebles: [], usuarios: [] };
let paginaActual = 1;
let busqueda = '';

// ==========================================
// Utilidades
// ==========================================
/** Escapa texto antes de insertarlo con innerHTML (evita XSS). */
function escapeHtml(valor) {
    return String(valor ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const formatoValor = new Intl.NumberFormat('es-GT', { maximumFractionDigits: 0 });
const formatearValor = valor => `$${formatoValor.format(valor)}`;

function mostrarAviso(mensaje) {
    const aviso = document.getElementById('aviso');
    aviso.textContent = mensaje;
    aviso.classList.remove('hidden');
    clearTimeout(mostrarAviso.timer);
    mostrarAviso.timer = setTimeout(() => aviso.classList.add('hidden'), 3000);
}

// ==========================================
// Persistencia
// ==========================================
function guardar() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

async function cargarDatos() {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado) {
        db = JSON.parse(guardado);
        return;
    }
    const res = await fetch('data.json');
    if (!res.ok) throw new Error(`No se pudo cargar data.json (${res.status})`);
    db = await res.json();
    guardar();
}

// ==========================================
// Navegación entre vistas
// ==========================================
const vistas = ['vista-inmuebles', 'vista-formulario', 'vista-usuarios'];

function mostrarVista(id) {
    vistas.forEach(v => document.getElementById(v).classList.toggle('hidden', v !== id));
}

function activarTab(idTab) {
    document.querySelectorAll('.tab').forEach(t => {
        const activa = t.id === idTab;
        t.classList.toggle('active', activa);
        t.setAttribute('aria-selected', String(activa));
    });
}

// ==========================================
// Listado de inmuebles
// ==========================================
function inmueblesFiltrados() {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return db.inmuebles;
    return db.inmuebles.filter(i =>
        [i.tipo, i.direccion, i.ciudad, i.depto, i.propietario, i.matricula]
            .some(campo => String(campo).toLowerCase().includes(texto))
    );
}

function totalPaginas(lista) {
    return Math.max(1, Math.ceil(lista.length / POR_PAGINA));
}

function renderInmuebles() {
    const lista = inmueblesFiltrados();
    // Si se eliminó el último elemento de la última página, se retrocede una página
    paginaActual = Math.min(paginaActual, totalPaginas(lista));

    const inicio = (paginaActual - 1) * POR_PAGINA;
    const items = lista.slice(inicio, inicio + POR_PAGINA);
    const contenedor = document.getElementById('lista-inmuebles');

    document.getElementById('resultados').textContent = `${lista.length} inmueble(s)`;

    contenedor.innerHTML = items.length === 0
        ? '<p class="vacio">No se encontraron inmuebles.</p>'
        : items.map(i => `
            <article class="inmueble-card">
                <div class="img-container"><img src="${escapeHtml(i.imagen || IMAGEN_RESPALDO)}" alt="${escapeHtml(i.tipo)} en ${escapeHtml(i.direccion)}" loading="lazy"></div>
                <div class="info-tipo">${escapeHtml(i.tipo)}</div>
                <div class="info-dir">${escapeHtml(i.direccion)}<br><small>${escapeHtml(i.ciudad)}, ${escapeHtml(i.depto)}</small></div>
                <div class="info-precio">${formatearValor(i.valor)}</div>
                <div class="actions">
                    <button type="button" class="link-btn" data-accion="ver" data-id="${i.id}">Ver</button>
                    <button type="button" class="link-btn delete-btn" data-accion="eliminar" data-id="${i.id}">Eliminar</button>
                </div>
            </article>`).join('');

    contenedor.querySelectorAll('img').forEach(img =>
        img.addEventListener('error', () => { img.src = IMAGEN_RESPALDO; }, { once: true }));

    renderPaginacion(lista);
}

/** Genera los botones según la cantidad real de páginas (antes eran 3 fijos). */
function renderPaginacion(lista) {
    const total = totalPaginas(lista);
    const barra = document.getElementById('pagination-bar');
    barra.classList.toggle('hidden', lista.length <= POR_PAGINA);

    const botones = [`<button type="button" class="arrow" data-pagina="${paginaActual - 1}" aria-label="Página anterior" ${paginaActual === 1 ? 'disabled' : ''}>&lt;</button>`];
    for (let p = 1; p <= total; p++) {
        botones.push(`<button type="button" class="page-btn ${p === paginaActual ? 'active' : ''}" data-pagina="${p}" aria-label="Página ${p}" ${p === paginaActual ? 'aria-current="page"' : ''}>${p}</button>`);
    }
    botones.push(`<button type="button" class="arrow" data-pagina="${paginaActual + 1}" aria-label="Página siguiente" ${paginaActual === total ? 'disabled' : ''}>&gt;</button>`);
    barra.innerHTML = botones.join('');
}

function cambiarPagina(p) {
    const total = totalPaginas(inmueblesFiltrados());
    if (p >= 1 && p <= total) {
        paginaActual = p;
        renderInmuebles();
    }
}

// ==========================================
// Detalle y eliminación
// ==========================================
const modal = document.getElementById('modal-detalle');

function verDetalle(id) {
    const i = db.inmuebles.find(item => item.id === id);
    if (!i) return;
    document.getElementById('modal-body').innerHTML = `
        <h2 id="modal-titulo">Detalles del Inmueble</h2>
        <hr>
        <p><strong>Tipo:</strong> ${escapeHtml(i.tipo)}</p>
        <p><strong>Dirección:</strong> ${escapeHtml(i.direccion)}, ${escapeHtml(i.ciudad)} (${escapeHtml(i.depto)})</p>
        <p><strong>Matrícula:</strong> ${escapeHtml(i.matricula)}</p>
        <p><strong>Área:</strong> ${escapeHtml(i.area)} m²</p>
        <p><strong>Propietario:</strong> ${escapeHtml(i.propietario)} (${escapeHtml(i.id_prop)})</p>
        <p><strong>Valor:</strong> ${formatearValor(i.valor)}</p>
        <p><strong>Comercial:</strong> ${i.comercial ? 'Sí' : 'No'}</p>
    `;
    modal.classList.add('open');
    document.getElementById('btn-cerrar-modal').focus();
}

function cerrarModal() {
    modal.classList.remove('open');
}

function eliminar(id) {
    const inmueble = db.inmuebles.find(i => i.id === id);
    if (!inmueble || !confirm(`¿Eliminar el inmueble de ${inmueble.direccion}?`)) return;
    db.inmuebles = db.inmuebles.filter(i => i.id !== id);
    guardar();
    renderInmuebles();
    mostrarAviso('Inmueble eliminado.');
}

// ==========================================
// Registro de nuevos inmuebles
// ==========================================
const form = document.getElementById('form-inmueble');
const campo = id => document.getElementById(id);

function abrirFormulario() {
    form.reset();
    campo('form-error').classList.add('hidden');
    mostrarVista('vista-formulario');
    campo('new-tipo').focus();
}

function leerFormulario() {
    const datos = {
        tipo: campo('new-tipo').value,
        direccion: campo('new-dir').value.trim(),
        ciudad: campo('new-ciudad').value.trim(),
        depto: campo('new-depto').value.trim(),
        matricula: campo('new-mat').value.trim().toUpperCase(),
        area: Number(campo('new-area').value),
        propietario: campo('new-prop').value.trim(),
        id_prop: campo('new-id-prop').value.trim(),
        valor: Number(campo('new-valor').value),
        comercial: campo('new-comercial').checked,
        imagen: campo('new-img').value.trim()
    };

    const obligatorios = ['tipo', 'direccion', 'ciudad', 'depto', 'matricula', 'propietario', 'id_prop'];
    if (obligatorios.some(k => !datos[k])) return { error: 'Complete todos los campos obligatorios.' };
    if (!(datos.area > 0)) return { error: 'El área debe ser mayor a 0.' };
    if (!(datos.valor > 0)) return { error: 'El valor debe ser mayor a 0.' };
    if (db.inmuebles.some(i => i.matricula.toUpperCase() === datos.matricula)) {
        return { error: `Ya existe un inmueble con la matrícula ${datos.matricula}.` };
    }
    if (datos.imagen) {
        try {
            if (!['http:', 'https:'].includes(new URL(datos.imagen).protocol)) throw new Error();
        } catch {
            return { error: 'La URL de la imagen debe comenzar con http:// o https://.' };
        }
    }
    return { datos };
}

/** Antes el botón llamaba a esta función, pero no existía. */
function guardarNuevoInmueble(event) {
    event.preventDefault();
    const { datos, error } = leerFormulario();
    if (error) {
        campo('form-error').textContent = error;
        campo('form-error').classList.remove('hidden');
        return;
    }

    const id = db.inmuebles.reduce((max, i) => Math.max(max, i.id), 0) + 1;
    db.inmuebles.push({ id, ...datos });
    guardar();

    busqueda = '';
    campo('buscador').value = '';
    paginaActual = totalPaginas(db.inmuebles); // se muestra la página donde quedó el nuevo
    mostrarVista('vista-inmuebles');
    renderInmuebles();
    mostrarAviso('Inmueble registrado correctamente.');
}

// ==========================================
// Usuarios y encabezado
// ==========================================
function renderUsuarios() {
    document.getElementById('lista-usuarios').innerHTML = db.usuarios.map(u => `
        <tr><td>${escapeHtml(u.id)}</td><td>${escapeHtml(u.nombre)}</td><td>${escapeHtml(u.rol)}</td></tr>
    `).join('');
}

function renderEncabezado() {
    const usuario = db.usuarios[0];
    document.getElementById('header-user').innerHTML = usuario
        ? `${escapeHtml(usuario.nombre)}<br><small>${escapeHtml(usuario.rol)}</small>`
        : '';
}

// ==========================================
// Eventos de la interfaz
// ==========================================
document.getElementById('tab-inmuebles').addEventListener('click', () => {
    activarTab('tab-inmuebles');
    mostrarVista('vista-inmuebles');
    renderInmuebles();
});

document.getElementById('tab-usuarios').addEventListener('click', () => {
    activarTab('tab-usuarios');
    mostrarVista('vista-usuarios');
    renderUsuarios();
});

document.getElementById('buscador').addEventListener('input', e => {
    busqueda = e.target.value;
    paginaActual = 1;
    renderInmuebles();
});

document.getElementById('lista-inmuebles').addEventListener('click', e => {
    const boton = e.target.closest('[data-accion]');
    if (!boton) return;
    const id = Number(boton.dataset.id);
    if (boton.dataset.accion === 'ver') verDetalle(id);
    if (boton.dataset.accion === 'eliminar') eliminar(id);
});

document.getElementById('pagination-bar').addEventListener('click', e => {
    const boton = e.target.closest('[data-pagina]');
    if (boton && !boton.disabled) cambiarPagina(Number(boton.dataset.pagina));
});

document.getElementById('btn-nuevo').addEventListener('click', abrirFormulario);
document.getElementById('btn-cancelar').addEventListener('click', () => mostrarVista('vista-inmuebles'));
form.addEventListener('submit', guardarNuevoInmueble);

document.getElementById('btn-cerrar-modal').addEventListener('click', cerrarModal);
modal.addEventListener('click', e => { if (e.target === modal) cerrarModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModal(); });

// ==========================================
// Inicio
// ==========================================
(async () => {
    try {
        await cargarDatos();
        renderEncabezado();
        renderInmuebles();
    } catch (e) {
        console.error(e);
        document.getElementById('lista-inmuebles').innerHTML =
            '<p class="vacio">No se pudieron cargar los datos. Abra el proyecto desde un servidor local.</p>';
    }
})();
