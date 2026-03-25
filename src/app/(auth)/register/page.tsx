export default function RegisterPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Register</h1>
      <form className="flex flex-col gap-3 rounded-md border p-4">
        <input
          type="text"
          placeholder="Name"
          className="rounded-md border px-3 py-2"
        />
        <input
          type="email"
          placeholder="Email"
          className="rounded-md border px-3 py-2"
        />
        <input
          type="password"
          placeholder="Password"
          className="rounded-md border px-3 py-2"
        />
        <button type="submit" className="rounded-md border px-4 py-2">
          Create account
        </button>
      </form>
    </main>
  );
}
