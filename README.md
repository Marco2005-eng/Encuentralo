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
