# Encuéntralo: contexto y plan de mejoras

> Archivo de contexto para el agente enfocado en mejoras de UI/UX. Léelo completo antes de modificar nada.
>
> **Regla de precedencia:** Ante cualquier conflicto, prevalecen el estado real del código y `.env`, y luego `AGENTS.md`; `CONTEXTO_ENCUENTRALO.md` solo define el trabajo de UI/UX actual. No tocar lógica, base de datos ni autenticación.

## 1. Qué es el proyecto

**Encuéntralo** es una plataforma web de objetos perdidos y encontrados para una institución educativa (campus). Estudiantes y personal publican objetos perdidos o encontrados, otros los buscan y el dueño acredita su pertenencia antes de la entrega.

- Sitio desplegado: https://encuentralo-eta.vercel.app/
- Público: estudiantes y personal del campus. **Uso mayoritario desde el celular.**
- Idioma de la interfaz: español.

### Flujo actual (NO romper)

1. **Publica el reporte:** objeto perdido o encontrado, sin datos personales.
2. **Acredita tu pertenencia:** el dueño envía detalles privados que solo él conocería.
3. **Entrega confirmada:** tras aprobar la solicitud se coordina la entrega en un punto seguro (vía chat interno) y se cierra el caso.

Estados de un objeto (se conservan los 4 estados en la lógica y la UI muestra "En proceso" con su propia etiqueta):
- `Perdido`
- `Encontrado`
- `En proceso` (con solicitud en curso / evaluación)
- `Recuperado`

Secciones existentes: Inicio, Catálogo, Mis publicaciones, Mis solicitudes, Publicar objeto, notificaciones, mensajes (chat de entrega), sesión.

---

## 2. Reglas de trabajo

- **No cambies la lógica de negocio, la base de datos, la autenticación ni el flujo de acreditación.** Esto es una mejora de interfaz y experiencia de uso.
- **Primero audita, luego cambia.** Antes de editar, revisa el código y lista qué vas a tocar.
- Conserva lo que ya funciona: la barra de búsqueda visible, los botones "Perdí algo" y "Encontré algo", las tarjetas con foto y estado, el aviso de privacidad del formulario.
- Trabaja por fases (ver sección 4) y confirma al terminar cada una.
- Entrega código completo, sin placeholders ni secciones a medias.
- Prioriza **móvil primero**; luego verifica escritorio.

### Diseño: con o sin Taste Skill

- **Si el skill `design-taste-frontend` (o `redesign-skill`) está instalado:** úsalo, partiendo de su protocolo de auditoría, y aplica además las reglas de este archivo.
- **Si no está instalado:** aplica estas reglas mínimas por tu cuenta:
  - Evita el aspecto genérico de IA (degradado índigo a morado con título blanco en negrita).
  - Usa una paleta propia y acotada: un color de marca, uno de acento y neutros.
  - Jerarquía tipográfica clara, buen contraste y texto secundario nunca menor a 13 px.
  - Espaciado consistente (escala de 4/8 px) y bordes y sombras coherentes.
  - Movimiento sutil y con propósito, nada decorativo.
  - Nunca dependas solo del color para comunicar estado (agrega icono o texto).
  - Cumple contraste WCAG AA y áreas táctiles de al menos 44 px.

---

## 3. Problemas detectados (auditoría)

### 3.1 Datos y textos
- Hay registros de prueba visibles: la tarjeta **"Celular"** tiene descripción de teclado aleatorio y una captura de pantalla como foto.
- Errores de ortografía en datos: "UDB negro" debería ser "USB negro"; "Telefono" debería llevar tilde.
- Las descripciones largas **desbordan la tarjeta** en móvil (sin recorte ni salto de palabra).

### 3.2 Inicio (escritorio y móvil)
- La sección "Publicados recientemente" mezcla objetos ya `Recuperado` con activos. Debe **priorizar objetos activos** (`Perdido` y `Encontrado`).
- El hero usa un degradado genérico y una etiqueta de relleno ("Comunidad educativa segura").
- Los botones **rojo ("Perdí algo") y verde ("Encontré algo")** se leen como error/éxito y son problemáticos para daltonismo.
- Las **categorías** son cajas de solo texto, sin iconos.
- El placeholder del buscador se **corta en móvil** ("...categoría o lu...").
- En móvil, el encabezado "Publicados recientemente" se aprieta y "Ver todos los objetos" se parte en dos líneas.

### 3.3 Tarjetas del catálogo
- Lugar y fecha en letra muy pequeña y gris claro, aunque son datos clave.
- Lugares truncados ("Pabellón 100 Aul...").
- Las etiquetas de estado y categoría sobre la foto se leen mal con imágenes claras o con mucho detalle.
- Sin foto no hay placeholder decente.
- En móvil las tarjetas son **demasiado altas** (una por pantalla).

### 3.4 Navegación móvil
- El menú hamburguesa oculta "Catálogo", "Iniciar sesión" y "Registrarse".
- Para usuarios con sesión no hay acceso rápido y permanente a "Publicar".

### 3.5 Formulario "Publicar nuevo objeto"
- **Categoría** viene preseleccionada en "Otros" y la mayoría la dejará así.
- **Lugar** es texto libre, así que los datos quedan inconsistentes y se busca peor.
- No pregunta **dónde está el objeto ahora** cuando se marca "Encontré".
- La foto es opcional incluso para objetos encontrados.
- Textos de ayuda y aviso de privacidad en letra muy pequeña.

---

## 4. Plan de trabajo por fases

### Fase 1: datos y robustez (rápida)
- [ ] Corregir "UDB" por "USB" y "Telefono" por "Teléfono". Si son datos de prueba, bórralos o márcalos para borrar.
- [ ] Limitar descripciones en tarjetas a 2 líneas (`line-clamp-2`) y agregar `overflow-wrap: anywhere` para que nada rompa el layout.
- [ ] Placeholder por categoría para objetos sin foto (icono de la categoría sobre fondo neutro).
- [ ] Lugares: permitir 2 líneas o abreviar de forma consistente; no truncar a mitad de palabra.

### Fase 2: inicio y catálogo
- [ ] "Publicados recientemente" muestra objetos **activos primero**. Mover los `Recuperado` a una sección aparte, "Casos resueltos".
- [ ] Reemplazar la etiqueta de relleno del hero por un dato real si existe (p. ej. "N objetos devueltos este mes"). Si no hay dato, quitarla.
- [ ] Botones principales: uno primario (relleno) y uno secundario (contorno), con iconos distintos. No depender de rojo/verde.
- [ ] Categorías con iconos. En móvil, carrusel horizontal de chips en vez de cuadrícula.
- [ ] Placeholder corto del buscador en móvil: "Buscar objeto o lugar".
- [ ] Subir tamaño y contraste de lugar y fecha en tarjetas.
- [ ] Etiquetas sobre fotos con fondo sólido o semitransparente legible.

### Fase 3: móvil
- [ ] Tarjetas compactas: **miniatura a la izquierda y texto a la derecha**, o cuadrícula de 2 columnas. Meta: ver 3 o 4 objetos por pantalla.
- [ ] Encabezado de sección apilado: título arriba, enlace "Ver todos →" abajo o a la derecha en una sola línea.
- [ ] Mostrar un botón "Ingresar" visible junto al logo, sin esconderlo en el menú.
- [ ] Usuarios con sesión: **barra de navegación inferior** con Inicio, Catálogo, **Publicar** (botón central destacado), Mis solicitudes y Perfil.

### Fase 4: formulario de publicación
- [ ] Categoría sin valor por defecto: placeholder "Selecciona una categoría" y validación.
- [ ] Lugar con **autocompletado** a partir de una lista de ubicaciones del campus (pabellones, aulas, comedor, laboratorios), permitiendo texto libre como respaldo.
- [ ] Si el usuario elige **"Encontré un objeto"**, mostrar el campo **"¿Dónde está el objeto ahora?"** (lo tengo conmigo, lo dejé en vigilancia, en oficina X, etc.).
- [ ] Foto: recomendada para "Perdí" y **muy incentivada (casi obligatoria)** para "Encontré".
- [ ] Subir el tamaño de los textos de ayuda y del aviso de privacidad (mínimo 13 px, buen contraste).
- [ ] Mantener el aviso de privacidad y la validación de no fechas futuras.

### Fase 5: pulido
- [ ] Revisar consistencia visual (tipografía, espaciado, radios, sombras).
- [ ] Estados vacíos, de carga y de error en catálogo y formularios.
- [ ] Accesibilidad: foco visible, etiquetas en iconos, contraste AA, `alt` en imágenes.
- [ ] Probar en móvil (≈390 px) y escritorio (≥1280 px).

---

## 5. Criterios de aceptación

- Un desborde de texto, por largo o raro que sea, **nunca** rompe una tarjeta.
- En móvil se ven al menos **3 objetos** del catálogo en la primera pantalla de scroll.
- Un usuario sin experiencia puede reportar un objeto en **menos de 1 minuto**.
- Ningún estado (Perdido / Encontrado / En proceso / Recuperado) depende únicamente del color.
- El flujo de acreditación y entrega sigue funcionando igual que antes.

---

## 6. Cómo trabajar con este archivo

Empieza con este mensaje:

> Lee `CONTEXTO_ENCUENTRALO.md`. Primero haz una auditoría breve del código actual y dime qué archivos vas a tocar en la **Fase 1**. No cambies lógica de negocio. Cuando termines una fase, resume qué cambiaste y espera mi confirmación para pasar a la siguiente.
