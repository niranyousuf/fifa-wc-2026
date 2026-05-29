export default function NotFound() {
  return (
    <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] p-12 text-center">
      <h1 className="font-display text-3xl tracking-wide">Page not found</h1>
      <p className="mt-2 text-[hsl(var(--muted-foreground))]">
        The page you are looking for does not exist.
      </p>
    </div>
  );
}
