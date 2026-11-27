import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes/router';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ChatProvider } from '@/context/ChatContext';

import { AccesibilidadProvider } from '@/context/AccesibilidadContext';

function App() {
  return (
    <AccesibilidadProvider>
    <AuthProvider>
      <ToastProvider>
        <ChatProvider>
          <RouterProvider router={router} />
        </ChatProvider>
      </ToastProvider>
    </AuthProvider>
    </AccesibilidadProvider>
  );
}

export default App;