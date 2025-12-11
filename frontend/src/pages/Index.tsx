// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="space-y-6 rounded-none border-[3px] border-foreground bg-card px-12 py-16 text-center shadow-neo">
        <span className="inline-flex items-center gap-3 rounded-none border-[3px] border-foreground bg-secondary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-secondary-foreground shadow-neo-xs">
          Fresh Start
        </span>
        <h1 className="text-5xl font-black uppercase tracking-tight text-foreground">
          Build Something Bold
        </h1>
        <p className="mx-auto max-w-xl text-base font-medium text-muted-foreground">
          This space is ready for your vision. Keep it sharp, keep it playful, and embrace the neo-brutalist spirit across every pixel.
        </p>
      </div>
    </div>
  );
};

export default Index;
