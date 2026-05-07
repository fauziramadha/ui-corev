import { Toaster } from "@/components/ui/sonner"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { useSidebar } from "@/components/ui/sidebar.tsx"

import SideBar from "@/components/sidebar/SideBar"
import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"

import HomePage from "@/pages/home/Home"
import MoviesPage from "@/pages/movies/Movies"
import ShowsPage from "@/pages/shows/Shows"
import NotFound from "@/pages/404/NotFound"
import Settings from "@/pages/settings/Settings"
import Disclaimer from "@/pages/disclaimer/Disclaimer"
import StartupOverlay from "@/components/animations/StartupOverlay.tsx"

export default function App() {
    const { open, setOpen } = useSidebar()

    return (
        <BrowserRouter>
            <div className="relative min-h-screen w-full bg-background text-foreground">
                <div id="app-root" className="relative flex min-h-screen flex-col transition-[filter] duration-500 ease-out">
                    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                        <div className="absolute top-0 left-0 h-full w-full animate-pulse [animation-duration:10s]">
                            <div className="absolute -top-48 -left-48 h-[40vw] max-h-150 min-h-75 w-[40vw] max-w-150 min-w-75 rounded-full bg-primary/60 blur-[128px]" />
                            <div className="absolute -top-32 -left-32 h-[30vw] max-h-100 min-h-50 w-[30vw] max-w-100 min-w-50 rounded-full bg-primary/20 blur-[96px]" />
                            <div className="absolute -top-16 -left-16 h-[20vw] max-h-50 min-h-25 w-[20vw] max-w-50 min-w-25 rounded-full bg-primary/10 blur-3xl" />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <SideBar />

                    {/* Sidebar overlay */}
                    {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-20 backdrop-blur-sm transition-opacity" />}

                    <Header />

                    {/* MAIN CONTENT */}
                    <main className="mx-auto w-full flex-1 space-y-6">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/movies" element={<MoviesPage />} />
                            <Route path="/shows" element={<ShowsPage />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/disclaimer" element={<Disclaimer />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </main>

                    <Footer />
                </div>

                <StartupOverlay />
            </div>

            <Toaster />
        </BrowserRouter>
    )
}