import { SignIn } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center bg-bg-2 px-5 py-12"
    >
      <div className="w-full max-w-md">
        <h1 className="mb-6 font-display text-3xl font-bold tracking-tight text-ink">
          Welkom terug
        </h1>
        <SignIn routing="hash" />
      </div>
    </main>
  );
}
