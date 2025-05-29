import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import SocketContextProvider from "./contexts/SocketContext.tsx";
import PeerContextProvider from "./contexts/PeerContext.tsx";
import { Toaster } from "@/components/ui/sonner";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <PeerContextProvider>
      <SocketContextProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SocketContextProvider>
    </PeerContextProvider>
    <Toaster />
  </QueryClientProvider>
);
