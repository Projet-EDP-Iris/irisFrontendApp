import { useEffect } from "react";
import { useLocation } from "wouter";

export default function GoodbyePage() {
  const [, navigate] = useLocation();

  useEffect(() => {
    const timeout = setTimeout(() => navigate("/"), 1700);
    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300">
      <div className="text-center px-8 py-12 rounded-3xl backdrop-blur-md border border-white/50 bg-white/40 shadow-xl">
        <h1 className="text-5xl font-bold text-orange-600 mb-3">See you soon</h1>
        <p className="text-orange-900/75">Iris keeps your workflow warm while you are away.</p>
      </div>
    </div>
  );
}
