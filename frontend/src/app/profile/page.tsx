import { Navigation } from "@/components/ui/navigation";
import { UserProfile } from "@/components/ui/user-profile";

export default function ProfilePage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen flex flex-col items-center justify-start p-6 relative pt-24">
        <div className="relative z-10 w-full max-w-4xl">
          <UserProfile />
        </div>
      </main>
    </>
  );
}
