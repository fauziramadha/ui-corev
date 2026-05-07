import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"

import { LucideCog, LucideFilm, LucideHome, LucideTv } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useHistory } from "@/hooks/use-history"
import { Badge } from "@/components/ui/badge"

export default function SideBar() {
    const { open, setOpen } = useSidebar()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()
    const { history } = useHistory()

    const isActive = (path: string) => location.pathname === path

    const navItemClass = (active: boolean) =>
        `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all
        ${active ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"}`

    const clickHandler = (path: string) => {
        setOpen(false)
        navigate(path)
    }

    return (
        <Sidebar side="left" variant="floating" collapsible="offcanvas" className={open ? "z-30" : "z-20"}>
            {/* Header */}
            <SidebarHeader>
                <div onClick={() => clickHandler("/")} className="flex cursor-pointer items-center gap-3 px-2 py-2">
                    <img src="/favicon.svg" alt="Logo" className="h-10" />

                    <h1 className={`text-xl font-bold text-primary transition-all duration-300 ${open ? "opacity-100" : "w-0 overflow-hidden opacity-0"}`}>{t("projectName")}</h1>
                </div>
            </SidebarHeader>

            <SidebarContent>
                {/* Pages */}
                <SidebarGroup>
                    <SidebarGroupLabel>{t("common.pages")}</SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <div onClick={() => clickHandler("/")} className={navItemClass(isActive("/"))}>
                                    <LucideHome size={18} />
                                    {open && <span>{t("common.home")}</span>}
                                </div>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <div onClick={() => clickHandler("/movies")} className={navItemClass(isActive("/movies"))}>
                                    <LucideFilm size={18} />
                                    {open && <span>{t("common.movie.plural")}</span>}
                                </div>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <div onClick={() => clickHandler("/shows")} className={navItemClass(isActive("/shows"))}>
                                    <LucideTv size={18} />
                                    {open && <span>{t("common.tvShow.plural")}</span>}
                                </div>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* History */}
                <SidebarGroup>
                    <SidebarGroupLabel>{t("watchhistory.title")}</SidebarGroupLabel>

                    <SidebarGroupContent>
                        {!open ? null : history.length === 0 ? (
                            <p className="px-2 text-sm text-muted-foreground">{t("watchhistory.empty")}</p>
                        ) : (
                            <div className="max-h-75 overflow-y-auto pr-1">
                                <SidebarMenu>
                                    {history.map((entry) => {
                                        const key = entry.kind === "movie" ? `movie-${entry.item.id}` : `episode-${entry.item.show_id}-${entry.item.season_number}-${entry.item.episode_number}`

                                        const label = entry.kind === "movie" ? entry.item.title : `${entry.item.tvshowtitle} S${entry.item.season_number}E${entry.item.episode_number}`

                                        return (
                                            <SidebarMenuItem key={key}>
                                                <SidebarMenuButton
                                                    onClick={() => clickHandler(entry.kind === "movie" ? `/movie/${entry.item.id}` : `/show/${entry.item.show_id}`)}
                                                    className="flex justify-between hover:bg-muted/50"
                                                >
                                                    <span className="truncate">{label}</span>
                                                    <Badge variant="secondary">{t(`common.${entry.kind}.singular`)}</Badge>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        )
                                    })}
                                </SidebarMenu>
                            </div>
                        )}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div onClick={() => clickHandler("/settings")} className={navItemClass(isActive("/settings"))}>
                            <LucideCog size={18} />
                            {open && <span>{t("common.settings")}</span>}
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}
