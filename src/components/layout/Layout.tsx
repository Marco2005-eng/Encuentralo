import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
      {/* Enlace para saltar al contenido principal accesible */}
      <a href="#contenido-principal" className="skip-link">
        Saltar al contenido principal
      </a>

      <Header />

      <main id="contenido-principal" className="flex-1 flex flex-col focus:outline-none" tabIndex={-1}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};