import { lazy, Suspense } from "react"
import { Toaster } from "@/components/ui/sonner"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { useSidebar } from "@/components/ui/sidebar.tsx"
import SideBar from "@/components/sidebar/SideBar"
import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"
import StartupOverlay from "@/components/animations/StartupOverlay.tsx"

const HomePage = lazy(() => import("@/pages/home/Home"))
const MoviesPage = lazy(() => import("@/pages/movies/Movies"))
const ShowsPage = lazy(() => import("@/pages/shows/Shows"))
const NotFound = lazy(() => import("@/pages/404/NotFound"))
const Settings = lazy(() => import("@/pages/settings/Settings"))
const Disclaimer = lazy(() => import("@/pages/disclaimer/Disclaimer"))

export default function App() {
    const { open, setOpen } = useSidebar()

    return (
        <BrowserRouter>
            <div className="relative min-h-screen w-full bg-background text-foreground">
                <div id="app-root" className="relative flex min-h-screen flex-col transition-[filter] duration-500 ease-out">
                    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                        <div className="absolute top-0 left-0 h-full w-full animate-pulse animation-duration-[10s]">
                            <div className="absolute -top-48 -left-48 h-[40vw] max-h-150 min-h-75 w-[40vw] max-w-150 min-w-75 rounded-full bg-primary/60 blur-[128px]" />
                            <div className="absolute -top-32 -left-32 h-[30vw] max-h-100 min-h-50 w-[30vw] max-w-100 min-w-50 rounded-full bg-primary/20 blur-[96px]" />
                            <div className="absolute -top-16 -left-16 h-[20vw] max-h-50 min-h-25 w-[20vw] max-w-50 min-w-25 rounded-full bg-primary/10 blur-3xl" />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <SideBar />

                    {/* Sidebar overlay */}
                    <div
                        onClick={() => setOpen(false)}
                        className={`fixed inset-0 z-20 transition-all duration-300 ease-out ${open ? "opacity-100 backdrop-blur-sm" : "backdrop-blur-0 pointer-events-none opacity-0"}`}
                    />

                    <Header />

                    {/* MAIN CONTENT */}
                    <main className="mx-auto w-full flex-1 space-y-6">
                        <Suspense
                            fallback={
                                <div className="flex min-h-[50vh] items-center justify-center">
                                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                </div>
                            }
                        >
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/movies" element={<MoviesPage />} />
                                <Route path="/shows" element={<ShowsPage />} />
                                <Route path="/settings" element={<Settings />} />
                                <Route path="/disclaimer" element={<Disclaimer />} />
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </Suspense>
                    </main>

                    <Footer />
                </div>

                <StartupOverlay />
            </div>

            <Toaster />
        </BrowserRouter>
    )
}
