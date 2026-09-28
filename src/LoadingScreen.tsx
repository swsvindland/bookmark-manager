export function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center" aria-busy="true">
      <div className="text-center">
        <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
        {message && <p className="text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}
