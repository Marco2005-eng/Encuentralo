import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes/router';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ChatProvider } from '@/context/ChatContext';

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;