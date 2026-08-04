import App from '@/components/App';
import { AuthProvider } from '@/lib/auth';

export default function Page() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
