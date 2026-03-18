import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppNav from "@/components/AppNav";
import HomePage from "@/pages/HomePage";
import DashboardPage from "@/pages/DashboardPage";
import PacketHistoryPage from "@/pages/PacketHistoryPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-dvh flex-col bg-background">
        <AppNav />
        <main className="min-h-0 flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/packet-history" element={<PacketHistoryPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
