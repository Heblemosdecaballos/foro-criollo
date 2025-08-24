import NewsForm from "@/components/NewsForm";
export default function NuevaNoticia() {
  return (
    <main className="container py-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Nueva noticia</h1>
      <NewsForm />
    </main>
  );
}
