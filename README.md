# ACME Inmobiliaria — Gestión de Inmuebles

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

Panel administrativo para la **gestión de inmuebles** de una inmobiliaria ficticia (ACME). Permite listar, buscar, ver el detalle, registrar y eliminar propiedades. Los datos iniciales se cargan desde un archivo JSON y los cambios se conservan en el navegador.

---

## Características

- **Carga de datos asíncrona** desde `data.json` con `fetch` y `async/await`.
- **Persistencia** en `localStorage`: los inmuebles registrados o eliminados se mantienen al recargar.
- **Listado paginado** (5 por página). Los botones se generan según el total real de páginas, y si se elimina el último inmueble de una página, la vista retrocede a la anterior.
- **Buscador** en tiempo real por tipo, dirección, ciudad, departamento, propietario o matrícula.
- **Modal de detalle** con matrícula, área, propietario, valor y uso comercial; se cierra con la tecla `Esc` o haciendo clic fuera.
- **Registro de inmuebles** con validación: campos obligatorios, área y valor mayores a 0, matrícula única y URL de imagen válida.
- **Eliminación** con confirmación.
- **Pestaña de usuarios** con los datos de `data.json`.

## Buenas prácticas aplicadas

- Datos escapados antes de insertarse en el HTML (protección contra XSS).
- Sin `onclick` ni estilos en línea: delegación de eventos y clases CSS.
- Acciones como `<button>` reales, etiquetas en los campos y roles ARIA en pestañas y modal.
- Diseño adaptable a móviles.

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Estructura | HTML5 semántico |
| Estilos | CSS3 (variables, Flexbox, Grid, media queries) |
| Lógica | JavaScript (ES6+), Fetch API, manipulación del DOM |
| Datos | JSON (15 inmuebles de ejemplo en Guatemala) + `localStorage` |

## Estructura del proyecto

```
revew-js/
├── index.html   # Layout: encabezado, pestañas, listado, formulario, usuarios y modal
├── style.css    # Estilos de tarjetas, formulario, modal, paginación y vista móvil
├── script.js    # Persistencia, búsqueda, paginación, detalle, alta y baja
└── data.json    # Datos iniciales de inmuebles y usuarios
```

## Cómo ejecutarlo

Como los datos se cargan con `fetch`, el proyecto **debe servirse desde un servidor local**: si se abre el HTML directamente, el navegador bloquea la petición.

```bash
git clone https://github.com/IkerDahinten2/revew-js.git
cd revew-js
npx serve .
```

O usa la extensión *Live Server* de VS Code y abre `index.html`.

> Para volver a los datos iniciales, borra la clave `acme_db` del `localStorage` del sitio.

## Pruebas realizadas

Probado en el navegador:

| Caso | Resultado |
|------|-----------|
| Paginación: 15 inmuebles → páginas 1, 2 y 3; la flecha no pasa de la última | ✅ |
| Eliminar los 5 inmuebles de la página 3 → regresa a la página 2 y quedan 2 páginas | ✅ |
| Búsqueda "antigua" → 1 resultado y la paginación se oculta | ✅ |
| Modal de detalle se abre y se cierra con `Esc` | ✅ |
| Formulario vacío, matrícula duplicada, valor negativo y URL `javascript:` rechazados | ✅ |
| Registro válido guardado y visible en el listado | ✅ |
| Dirección con `<img onerror>` se muestra como texto, sin ejecutarse | ✅ |
| Los cambios persisten al recargar la página | ✅ |
| Pestaña de usuarios | ✅ |

## Flujo de ramas

| Rama | Propósito |
|------|-----------|
| `main` | Versión estable |
| `dev` | Integración de cambios |
| `frontend` | Desarrollo de la interfaz |

## Autor

**Iker Dahinten** — [@IkerDahinten2](https://github.com/IkerDahinten2)
