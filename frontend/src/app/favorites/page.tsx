import { Favorites } from "@/components/ui/favorites";
import { Navigation } from "@/components/ui/navigation";

export default function FavoritesPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen flex flex-col items-center justify-start p-6 relative pt-24">
        <div className="relative z-10 w-full max-w-4xl">
          <Favorites />
        </div>
      </main>
    </>
  );
}
