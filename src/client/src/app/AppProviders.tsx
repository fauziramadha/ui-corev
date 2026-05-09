import { TooltipProvider } from "@/components/ui/tooltip"
import { type ReactNode } from "react"
import { OmssProvider } from "@/app/providers/omss-provider"
import { TMDBProvider } from "@/app/providers/tmdb-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/app/providers/theme-provider"
import { HistoryProvider } from "@/app/providers/history-provider"
import "@/app/i18n/i18n"
import "lenis/dist/lenis.css"
import Lenis from "lenis"

export default function AppProviders({ children }: { children: ReactNode }) {
    new Lenis({
        autoRaf: true,
        prevent: (node) => node.classList.contains("lenis-disabled"),
    })

    return (
        <ThemeProvider defaultTheme="dark" storageKey="app-theme">
            <TooltipProvider delayDuration={150}>
                <TMDBProvider>
                    <OmssProvider>
                        <HistoryProvider>
                            <SidebarProvider defaultOpen={false}>{children}</SidebarProvider>
                        </HistoryProvider>
                    </OmssProvider>
                </TMDBProvider>
            </TooltipProvider>
        </ThemeProvider>
    )
}
