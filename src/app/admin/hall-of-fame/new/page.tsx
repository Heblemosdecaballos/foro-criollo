
// New horse creation page
import { Metadata } from 'next';
import HorseForm from '../HorseForm';

export const metadata: Metadata = {
  title: 'Agregar Caballo - Hall of Fame Admin',
  description: 'Agregar un nuevo caballo al Hall of Fame',
};

export default function NewHorsePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agregar Nuevo Caballo</h1>
        <p className="text-gray-600">Completa la información del caballo para agregarlo al Hall of Fame</p>
      </div>

      <HorseForm />
    </div>
  );
}
