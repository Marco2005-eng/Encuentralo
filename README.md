# Encuéntralo — Sistema de Objetos Perdidos y Encontrados

Sistema web desarrollado con foco en **Interacción Humano-Computador (IHC)** para registrar, buscar y recuperar objetos perdidos o encontrados en una comunidad educativa.

## 🚀 Cómo ejecutar el proyecto en local

1. Instalar dependencias (si aún no lo hiciste):
   ```bash
   npm install
   ```

2. Iniciar el servidor de desarrollo en local:
   ```bash
   npm run dev
   ```

   > **Nota sobre el puerto:** Vite iniciará automáticamente en `http://localhost:5173`. Si deseas usar otro puerto (por ejemplo el 4000), ejecuta:
   > ```bash
   > npm run dev -- --port 4000
   > ```

3. Para compilar la versión de producción y verificar tipos TypeScript:
   ```bash
   npm run build
   ```

---

## 👥 Cuentas de Demostración (Seed precargado)

El sistema incluye datos de ejemplo sembrados en `localStorage` con cuentas, publicaciones y solicitudes predeterminadas:

| Rol | Correo | Contraseña |
| --- | --- | --- |
| **Administrador** | `admin@encuentralo.test` | `Admin123!` |
| **Usuario** | `ana@encuentralo.test` | `Usuario123!` |
| **Usuario** | `luis@encuentralo.test` | `Usuario123!` |

*(En la pantalla de inicio de sesión dispones además de botones rápidos para autocompletar estas credenciales).*

---

## 🧭 Pantallas y Rutas Implementadas

- **Inicio** (`/`): Buscador destacado, accesos directos "Perdí algo" y "Encontré algo", categorías y objetos recientes.
- **Iniciar Sesión** (`/iniciar-sesion`): Acceso con validaciones y opción de credenciales demo rápidas.
- **Registro** (`/registro`): Creación de cuenta con medidor y requisitos de contraseña en tiempo real.
- **Catálogo de Objetos** (`/objetos`): Filtros combinados (categoría, estado, orden, búsqueda con debounce) sincronizados con la URL.
- **Publicar Objeto** (`/objetos/nuevo`): Formulario con aviso de privacidad, prevención de errores y compresión automática de imágenes en el cliente.
- **Detalle de Objeto** (`/objetos/:id`): Vista completa, protección de datos del propietario y modal para enviar solicitud acreditando pertenencia.
- **Mis Publicaciones** (`/mis-publicaciones`): Gestión de reportes propios y revisión de solicitudes recibidas para aprobar (marcando el objeto como *Recuperado*) o rechazar (con motivo obligatorio).
- **Mis Solicitudes** (`/mis-solicitudes`): Seguimiento de solicitudes enviadas y opción de cancelarlas.
- **Panel de Administración** (`/admin`): Supervisión de publicaciones, solicitudes, métricas visuales y botón para restablecer los datos de demostración.
"# Encuentralo" 


## Accesibilidad e IHC

Mejoras de interfaz implementadas:
- Navegación entre pantallas con foco en el encabezado principal y título de pestaña actualizado, incluso al cargar datos de manera asíncrona.
- Catálogo con anuncio de carga y cantidad de resultados; botones de filtros con nombres accesibles.
- Formularios con ayudas vinculadas al campo, errores anunciados y resumen de errores al publicar. React Hook Form lleva el foco al primer campo inválido.
- Selector de fotografía utilizable mediante teclado, con foco visible en su etiqueta.
- Avisos persistentes hasta cerrarlos, sin límite de tiempo para leer; errores anunciados como alertas.
- Chat con historial semántico que anuncia mensajes añadidos, campo con nombre accesible y error de envío visible sin perder el texto.
- Botones con área mínima de 44 × 44 px, textos secundarios de al menos 13 px y respeto por la preferencia de movimiento reducido.

### Comprobación manual para la entrega del curso

1. Usar Tab, Shift+Tab, Enter, flechas y Escape para navegar, filtrar, abrir/cerrar ventanas y seleccionar una foto sin mouse.
2. Con NVDA, buscar un objeto y comprobar el anuncio de resultados, el título de cada pantalla y los errores de los campos.
3. Intentar publicar un formulario incompleto: comprobar el resumen y el foco en el primer campo inválido.
4. Ampliar el navegador al 200 % y revisar inicio, catálogo, formulario y chat en móvil y escritorio.
5. Comprobar que los avisos siguen visibles tras esperar y se pueden cerrar con teclado.
6. En dos sesiones de demostración, enviar mensajes y comprobar que se anuncian las novedades sin mover el foco del campo de escritura.

La compilación y el análisis estático no certifican conformidad WCAG. Las pruebas con lector de pantalla y personas usuarias deben documentarse por separado.


### Opciones de inclusión

El botón **Accesibilidad**, dentro de Ayuda en escritorio o del Menú en móvil, abre las preferencias:
- Texto al 100 %, 115 %, 130 % o 150 %, compatible con el zoom del navegador.
- Colores originales, colores diferenciados para estados (con texto, iconos y bordes distintos) y alto contraste.
- Lectura de pasos de las guías “Perdí algo” y “Encontré algo”, con velocidad pausada, normal o rápida. La voz solo comienza al pulsar “Escuchar paso”; se puede detener y se cancela al cambiar de paso o cerrar la guía.
- Preferencias guardadas en el navegador, con validación de datos y restablecimiento. Si no se pueden guardar, los cambios funcionan durante la visita y se muestra un aviso.

La disponibilidad y la voz en español dependen del navegador y de las voces instaladas. Si no hay soporte, se muestra una explicación y permanecen las instrucciones escritas. La guía por voz complementa el soporte para lectores de pantalla.

Verificado: compilación y lint; opciones de inclusión en navegador, persistencia tras recarga, controles de lectura, restablecimiento y panel a 390 px con texto al 150 % y alto contraste sin desbordamiento horizontal. Servicio de preferencias comprobado con datos inválidos y almacenamiento bloqueado. Pendiente: evaluación con personas con distintas necesidades de acceso y escucha real en sus dispositivos.


### Organización de la navegación

Cabecera compacta en una fila de escritorio: identidad y Catálogo a la izquierda, publicaciones, solicitudes y administración visibles como enlaces directos, y publicación, comunicación, Ayuda y cuenta a la derecha. Ayuda contiene el centro de ayuda y Accesibilidad.

En móvil se mantienen identidad, Publicar y Menú, con accesos visibles de Catálogo, Mis publicaciones, Mis solicitudes y Administración (según el rol) debajo. Menú reúne apoyo, comunicación y opciones personales. Los desplegables de escritorio admiten teclado, Escape y cierre al pulsar fuera.

Verificado con cuenta de administrador de demostración: menús y acceso a Accesibilidad, escritorio y móvil, y texto al 150 % sin desbordamiento horizontal. Compilación y lint correctos. Los datos de Supabase no se modificaron.
