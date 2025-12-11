import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="space-y-6 text-center">
        <div className="inline-flex flex-col items-center gap-4 rounded-none border-[3px] border-foreground bg-card px-10 py-12 shadow-neo">
          <span className="rounded-none border-[3px] border-foreground bg-destructive px-4 py-2 text-xs font-semibold uppercase tracking-widest text-destructive-foreground shadow-neo-xs">
            Off the Grid
          </span>
          <h1 className="text-7xl font-black uppercase text-foreground">404</h1>
          <p className="max-w-sm text-sm font-medium text-foreground/70">
            This page doesn’t exist yet. Sculpt a new path or head back to the main structure.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-none border-[3px] border-foreground bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground shadow-neo-xs transition-transform duration-150 hover:-translate-y-[3px] hover:-translate-x-[3px]"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
