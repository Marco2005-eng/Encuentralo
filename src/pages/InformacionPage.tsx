import React, { useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface InformacionPageProps { tipo: 'privacidad' | 'terminos' }

export const InformacionPage: React.FC<InformacionPageProps> = ({ tipo }) => {
  const privacidad = tipo === 'privacidad';
  const title = privacidad ? 'Privacidad y uso de tus datos' : 'Términos de uso';
  useEffect(() => {
    document.title = title + ' · Encuéntralo';
    window.scrollTo(0, 0);
    document.getElementById('titulo-informacion')?.focus({ preventScroll: true });
    return () => { document.title = 'Encuéntralo - Objetos perdidos y encontrados'; };
  }, [title]);
  return (
    <div className="container-app py-8 sm:py-12">
      <Link to="/objetos" className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-brand-700 hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver al catálogo</Link>
      <div className="mt-6 grid gap-8 md:grid-cols-[200px_minmax(0,1fr)] md:gap-12">
        <nav aria-label="Información del sitio" className="flex flex-wrap content-start gap-2 md:flex-col">
          {[['/privacidad', 'Privacidad'], ['/terminos', 'Términos de uso']].map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => 'inline-flex min-h-[44px] items-center rounded-lg px-4 py-3 text-sm font-semibold ' + (isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100')}>{label}</NavLink>
          ))}
        </nav>
        <article className="information-document min-w-0 max-w-[72ch]">
          <header className="mb-8">
            <p className="mb-3 text-sm font-medium text-slate-600">Encuéntralo · Proyecto académico de IHC</p>
            <h1 id="titulo-informacion" tabIndex={-1} className="text-3xl sm:text-4xl font-bold text-slate-900">{title}</h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600">{privacidad ? 'Qué información utiliza la plataforma, quién puede consultarla y qué controles tienes.' : 'Orientaciones para publicar, acreditar pertenencia y coordinar devoluciones de forma responsable.'}</p>
          </header>
          {privacidad ? <>
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 text-sm leading-relaxed text-brand-900"><strong>Antes de publicar</strong><p className="mt-2">La descripción y las fotografías del objeto aparecen en el catálogo. No incluyas teléfonos, correos, direcciones particulares ni documentos legibles.</p></div>
            <section><h2>Qué información se utiliza y para qué</h2><p>El perfil utiliza tu nombre y correo para identificar tu cuenta. Las publicaciones contienen categoría, descripción, ubicación, fecha y fotografías opcionales para facilitar la búsqueda. Las solicitudes incluyen detalles o imágenes de pertenencia para revisar la recuperación.</p><p>El chat permite coordinar la entrega después de aprobar una solicitud. Las notificaciones internas comunican cambios en tus publicaciones y solicitudes.</p></section>
            <section><h2>Qué se muestra y quién lo consulta</h2><p>El catálogo muestra la información del objeto; no presenta el nombre completo, correo ni teléfono del publicador como datos de contacto. Si escribes esos datos en una descripción o los incluyes en una fotografía, también serán visibles.</p><p>La revisión de solicitudes corresponde al solicitante, al responsable de la publicación y a la administración según sus permisos. El chat se utiliza para coordinar entre las partes después de la aprobación. Evita adjuntar documentos completos, contraseñas o información sensible.</p><p>No trates las imágenes adjuntas como un canal para documentos confidenciales ni compartas sus enlaces fuera del proceso.</p></section>
            <section><h2>Almacenamiento y sesión</h2><p>La plataforma admite Supabase para cuentas, publicaciones, solicitudes y archivos. También dispone de un modo de demostración local que conserva información en el navegador. La sesión puede mantenerse en el dispositivo: ciérrala cuando uses un equipo compartido.</p><p>El cierre de sesión no elimina las publicaciones, solicitudes ni conversaciones. Esta interfaz no establece un plazo automático de eliminación ni garantiza el borrado de copias o archivos asociados al retirar una publicación.</p></section>
            <section><h2>Controles disponibles</h2><p>Puedes revisar tu perfil, editar o eliminar tus publicaciones y cancelar solicitudes pendientes desde las opciones disponibles en tu cuenta. Estas acciones no equivalen a eliminar todos los datos de la cuenta.</p><div className="flex flex-wrap gap-x-6"><Link to="/perfil">Ver mi perfil</Link><Link to="/mis-publicaciones">Mis publicaciones</Link><Link to="/mis-solicitudes">Mis solicitudes</Link></div></section>
            <section><h2>Alcance y consultas sobre datos</h2><p>Encuéntralo es un proyecto académico de IHC. Esta página explica su funcionamiento y no acredita una política oficial de la institución educativa. Esta versión no dispone de un canal específico configurado para solicitudes de acceso o eliminación integral de datos; esas solicitudes deben coordinarse con el equipo responsable del proyecto.</p><p>No se publica un contacto ni un plazo de atención que no haya sido confirmado por ese equipo.</p></section>
          </> : <>
            <section><h2>Finalidad del servicio</h2><p>Encuéntralo permite a la comunidad educativa publicar, buscar y gestionar la recuperación de objetos. La existencia de un reporte o una solicitud aprobada no garantiza la identidad de las partes ni la recuperación del objeto.</p></section>
            <section><h2>Publicaciones responsables</h2><p>Publica información pertinente y veraz sobre objetos perdidos o encontrados. Utiliza imágenes del objeto y evita contenido ofensivo, fotografías de personas sin autorización o datos personales de terceros.</p><p>Reserva alguna característica distintiva para comprobar la pertenencia. Mantén el estado de tus publicaciones actualizado y retira los reportes que ya no correspondan.</p></section>
            <section><h2>Solicitudes y acreditación</h2><p>Solicita la recuperación únicamente cuando puedas justificar que el objeto te pertenece. Si comunicas un hallazgo sobre un reporte perdido, describe dónde lo encontraste y su ubicación actual. El responsable de la publicación o la administración revisa la solicitud y puede pedir detalles antes de resolverla.</p></section>
            <section><h2>Coordinación de la entrega</h2><p>Una vez aprobada la solicitud, utiliza el chat de entrega para acordar un lugar y una hora. Prefiere espacios públicos con personal de apoyo y confirma directamente los horarios y procedimientos de tu institución.</p><p>Comprueba el objeto en persona antes de confirmar la entrega. Las sugerencias de lugares del sitio no certifican disponibilidad, custodia ni respaldo institucional.</p></section>
            <section><h2>Administración y límites</h2><p>La administración dispone de herramientas para revisar publicaciones, gestionar solicitudes y atender usos indebidos. La disponibilidad del sitio depende de sus servicios y conexión; las notificaciones son internas a la plataforma.</p><p>Consulta la <Link to="/privacidad">información de privacidad</Link> antes de compartir datos o archivos.</p></section>
          </>}
        </article>
      </div>
    </div>
  );
};
