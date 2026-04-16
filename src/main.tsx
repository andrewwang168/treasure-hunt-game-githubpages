import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider, useAuth } from "./context/AuthContext.tsx";
import AuthScreen from "./components/AuthScreen.tsx";
import { Toaster } from "sonner";

function Root() {
  const { currentUser, isLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (currentUser) setShowAuth(false);
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100">
        <p className="text-amber-800 text-lg">Loading...</p>
      </div>
    );
  }

  if (showAuth) return <AuthScreen onClose={() => setShowAuth(false)} />;
  return <App onShowAuth={() => setShowAuth(true)} />;
}

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <Root />
    <Toaster position="top-center" richColors />
  </AuthProvider>
);
