import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { InicioPage } from '@/pages/InicioPage';
import { IniciarSesionPage } from '@/pages/IniciarSesionPage';
import { RegistroPage } from '@/pages/RegistroPage';
import { CatalogoPage } from '@/pages/CatalogoPage';
import { RegistrarObjetoPage } from '@/pages/RegistrarObjetoPage';
import { DetalleObjetoPage } from '@/pages/DetalleObjetoPage';
import { MisPublicacionesPage } from '@/pages/MisPublicacionesPage';
import { EditarPublicacionPage } from '@/pages/EditarPublicacionPage';
import { MisSolicitudesPage } from '@/pages/MisSolicitudesPage';
import { PerfilPage } from '@/pages/PerfilPage';
import { AdminPage } from '@/pages/AdminPage';
import { NoEncontradoPage } from '@/pages/NoEncontradoPage';
import { RequireAuth, RequireAdmin } from './guards';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <InicioPage /> },
      { path: 'iniciar-sesion', element: <IniciarSesionPage /> },
      { path: 'registro', element: <RegistroPage /> },
      { path: 'objetos', element: <CatalogoPage /> },
      {
        path: 'objetos/nuevo',
        element: (
          <RequireAuth>
            <RegistrarObjetoPage />
          </RequireAuth>
        ),
      },
      { path: 'objetos/:id', element: <DetalleObjetoPage /> },
      {
        path: 'mis-publicaciones',
        element: (
          <RequireAuth>
            <MisPublicacionesPage />
          </RequireAuth>
        ),
      },
      {
        path: 'mis-publicaciones/:id/editar',
        element: (
          <RequireAuth>
            <EditarPublicacionPage />
          </RequireAuth>
        ),
      },
      {
        path: 'mis-solicitudes',
        element: (
          <RequireAuth>
            <MisSolicitudesPage />
          </RequireAuth>
        ),
      },
      {
        path: 'perfil',
        element: (
          <RequireAuth>
            <PerfilPage />
          </RequireAuth>
        ),
      },
      {
        path: 'admin',
        element: (
          <RequireAdmin>
            <AdminPage />
          </RequireAdmin>
        ),
      },
      { path: '*', element: <NoEncontradoPage /> },
    ],
  },
]);