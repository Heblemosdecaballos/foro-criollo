import HeroBanner from "@/components/HeroBanner";

export default async function Home() {
  return (
    <>
      <HeroBanner />
      <div className="container py-6">
        {/* …contenido de portada… */}
      </div>
    </>
  );
}
