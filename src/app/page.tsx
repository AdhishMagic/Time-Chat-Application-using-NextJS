export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Time Chat Application</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        App Router refactor complete. Use these routes to verify the grouped
        structure.
      </p>
      <div className="flex flex-wrap gap-3">
        <a className="rounded-md border px-4 py-2" href="/login">
          Login
        </a>
        <a className="rounded-md border px-4 py-2" href="/register">
          Register
        </a>
        <a className="rounded-md border px-4 py-2" href="/chat">
          Chat
        </a>
        <a className="rounded-md border px-4 py-2" href="/api/test">
          API Test
        </a>
      </div>
    </main>
  );
}
