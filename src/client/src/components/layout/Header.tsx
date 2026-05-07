import { Button } from "@/components/ui/button"
import { SearchDialog } from "@/components/layout/SearchDialog.tsx"
import { LucideSearch, Settings2 } from "lucide-react"
import { Kbd } from "@/components/ui/kbd"
import { SidebarTrigger } from "@/components/ui/sidebar.tsx"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAppSettings } from "@/hooks/use-appsettings.ts"

export default function Header() {
    const { t } = useTranslation()
    const { setShowSearch, showSearch } = useAppSettings()

    return (
        <>
            <header className="fixed top-0 z-10 w-full">
                <div className="mx-auto mt-3 flex h-16 w-[min(92vw,1240px)] items-center justify-between rounded-2xl border px-4 backdrop-blur-xl sm:px-5 lg:px-6">
                    <div className={"flex items-center gap-4"}>
                        <SidebarTrigger />
                        <Link to="/" className="group inline-flex items-center gap-2">
                            <span className="inline-flex size-10 items-center justify-center overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
                                <img src="/favicon.svg" alt="CinePro logo" className="size-full object-cover" />
                            </span>
                            <span className="text-2xl font-semibold tracking-tight text-primary-foreground">{t("projectName")}</span>
                        </Link>
                    </div>

                    <div className="hidden w-56 sm:block md:w-72 lg:w-96">
                        <Button variant="outline" onClick={() => setShowSearch(!showSearch)} className="h-9 w-full justify-between px-3 text-sm">
                            <span className="inline-flex items-center gap-2 text-muted-foreground">
                                <LucideSearch className="size-4" />
                                <span className="hidden sm:inline">{t("header.searchPlaceholder")}</span>
                            </span>

                            <span className="hidden items-center gap-1 md:flex">
                                <Kbd>⌘</Kbd>+<Kbd>F</Kbd>
                            </span>
                        </Button>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link to="/settings" className="inline-flex items-center gap-1.5">
                                <Settings2 className="size-4" />
                                {t("settingsPage.title")}
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            <SearchDialog />
        </>
    )
}
