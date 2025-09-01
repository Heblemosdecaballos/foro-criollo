
import { RealtimeMonitor } from '@/components/admin/RealtimeMonitor';

export default function RealtimeAdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Monitor de Tiempo Real
        </h1>
        <p className="text-gray-600 mt-2">
          Monitoreo del sistema WebSocket, Redis y notificaciones push
        </p>
      </div>

      <RealtimeMonitor />
    </div>
  );
}

