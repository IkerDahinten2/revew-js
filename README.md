# ACME Inmobiliaria — Gestión de Inmuebles

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

Panel administrativo para la **gestión de inmuebles** de una inmobiliaria ficticia (ACME). Permite listar propiedades con paginación, ver su detalle en una ventana modal, eliminarlas y abrir el formulario de registro de nuevos inmuebles. Los datos se cargan dinámicamente desde un archivo JSON.

---

## Características

- **Carga de datos asíncrona** desde `data.json` con `fetch` y `async/await`.
- **Listado paginado** de inmuebles (5 por página) con navegación por números y flechas.
- **Modal de detalle** con la información completa de cada propiedad (matrícula, área, propietario, valor, uso comercial).
- **Eliminación** de registros con confirmación.
- **Navegación por pestañas** entre las vistas *Inmuebles* y *Usuarios*.
- **Formulario de registro** de nuevos inmuebles.

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Estructura | HTML5 |
| Estilos | CSS3 |
| Lógica | JavaScript (ES6+), Fetch API, manipulación del DOM |
| Datos | JSON (15 inmuebles de ejemplo en Guatemala) |

## Estructura del proyecto

```
revew-js/
├── index.html   # Layout: encabezado, pestañas, contenido, paginación y modal
├── style.css    # Estilos de tarjetas, modal y paginación
├── script.js    # Estado, carga de datos, renderizado y navegación
└── data.json    # Base de datos de inmuebles y usuarios
```

## Cómo ejecutarlo

Como los datos se cargan con `fetch`, el proyecto **debe servirse desde un servidor local** (abrir el HTML directamente bloquea la petición por CORS).

```bash
git clone https://github.com/IkerDahinten2/revew-js.git
cd revew-js
npx serve .
```

O usa la extensión *Live Server* de VS Code y abre `index.html`.

## Estado y pendientes

- [ ] Implementar la función `guardarNuevoInmueble()` que invoca el botón **Guardar Inmueble** del formulario (actualmente no está definida).
- [ ] Conectar el buscador del listado.
- [ ] Persistir los cambios (altas/bajas) en `localStorage` o en un backend.

## Flujo de ramas

| Rama | Propósito |
|------|-----------|
| `main` | Versión estable |
| `dev` | Integración de cambios |
| `frontend` | Desarrollo de la interfaz |

## Autor

**Iker Dahinten** — [@IkerDahinten2](https://github.com/IkerDahinten2)
