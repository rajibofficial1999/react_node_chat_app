import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";
import "./index.css";
import SocketContextProvider from "./contexts/SocketContext.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <SocketContextProvider>
        <App />
      </SocketContextProvider>
      <Toaster />
    </BrowserRouter>
  </QueryClientProvider>
);
