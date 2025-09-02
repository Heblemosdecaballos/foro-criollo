
// Edit horse page
import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EditHorseContent from './EditHorseContent';

interface Props {
  params: { horseId: string };
}

export const metadata: Metadata = {
  title: 'Editar Caballo - Hall of Fame Admin',
  description: 'Editar información del caballo',
};

export default function EditHorsePage({ params }: Props) {
  if (!params.horseId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Caballo</h1>
        <p className="text-gray-600">Modifica la información del caballo</p>
      </div>

      <Suspense fallback={<EditHorseLoading />}>
        <EditHorseContent horseId={params.horseId} />
      </Suspense>
    </div>
  );
}

function EditHorseLoading() {
  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-lg border p-6 space-y-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i}>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
