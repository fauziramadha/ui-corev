import { useTranslation } from "react-i18next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppSettings } from "@/hooks/use-appsettings.ts"
import { supportedLocales, type SupportedLocales } from "@/hooks/use-appsettings"
import type { CountryISO3166_1 } from "@lorenzopant/tmdb"
import { maskKey } from "@/lib/strings.utils.ts"
import { useOmss } from "@/hooks/use-omss.ts"
import { Badge } from "@/components/ui/badge.tsx"
import { Item, ItemContent, ItemHeader } from "@/components/ui/item.tsx"
import { H1, H4, P } from "@/components/ui/typography.tsx"
import { AlertTriangle, RefreshCcw, Star } from "lucide-react"
import { useHistory } from "@/hooks/use-history.ts"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Trash2 } from "lucide-react"
import ConfirmDialog from "@/components/layout/ConfirmDialog.tsx"
import { supportedRegions, useTmdb } from "@/hooks/use-tmdb.ts"
import { Link } from "react-router-dom"

export default function Settings() {
    const { t } = useTranslation()
    const { region, locale, autoplayNext, tmdbApiKey, setLocale, setAutoplayNext, setRegion, standalone } = useAppSettings()
    const { valid, baseUrl, setBaseUrl } = useOmss()
    const { clear, history, remove } = useHistory()
    const {cache} = useTmdb()

    return (
        <section className="mx-auto mt-22 max-w-3xl space-y-6">
            <H1>{t("settingsPage.title")}</H1>

            <Tabs defaultValue="general" className="w-full">
                {/* Tabs header */}
                <TabsList variant="line">
                    <TabsTrigger value="general">{t("settingsPage.general.title")}</TabsTrigger>
                    <TabsTrigger value="history">{t("settingsPage.tabs.history")}</TabsTrigger>
                    <TabsTrigger value="playback">{t("settingsPage.tabs.playback")}</TabsTrigger>
                    <TabsTrigger value="omss">{t("settingsPage.tabs.omss")}</TabsTrigger>
                    <TabsTrigger value="tmdb">{t("settingsPage.tabs.tmdb")}</TabsTrigger>
                </TabsList>

                {/* ---------------- GENERAL ---------------- */}
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("settingsPage.general.title")}</CardTitle>
                            <CardDescription>{t("settingsPage.general.description")}</CardDescription>
                            <CardAction>
                                <Button asChild>
                                    <Link to={t("common.opensource.git-url")} target="_blank" rel="noopener noreferrer">
                                        <Star />
                                        <span className="ml-1 hidden sm:inline">
                                            {t("header.githubButton", {
                                                platform: t("common.opensource.git-platform"),
                                            })}
                                        </span>
                                    </Link>
                                </Button>
                            </CardAction>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="mt-3 flex justify-between">
                                <div>
                                    <Label>{t("settingsPage.general.language.cardlabel")}</Label>
                                    <span className="flex pt-1 text-muted-foreground">{t("settingsPage.general.language.info", { gitUrl: t("common.opensource.git-url") })}</span>
                                </div>

                                <Select value={locale} onValueChange={(value) => setLocale(value as SupportedLocales)}>
                                    <SelectTrigger className="w-80">
                                        <SelectValue placeholder={t("settingsPage.general.language.placeholder")} />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>{t("settingsPage.general.language.selectlabel")}</SelectLabel>

                                            {supportedLocales.map((l) => (
                                                <SelectItem key={l.iso639} value={l.iso639}>
                                                    {l.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="mt-3 flex justify-between">
                                <div>
                                    <Label>{t("settingsPage.general.reset.label")}</Label>
                                    <span className="flex pt-1 text-muted-foreground">{t("settingsPage.general.reset.info")}</span>
                                </div>
                                <ConfirmDialog
                                    title={t("settingsPage.general.reset.title")}
                                    description={t("settingsPage.general.reset.description")}
                                    onConfirm={() => {
                                        localStorage.clear()
                                        location.reload()
                                    }}
                                    classname="w-40"
                                    trigger={
                                        <Button variant="destructive">
                                            <RefreshCcw />
                                            {t("settingsPage.general.reset.button")}
                                        </Button>
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ---------------- HISTORY ---------------- */}
                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("settingsPage.history.title")}</CardTitle>
                            <CardDescription>{t("settingsPage.history.description")}</CardDescription>

                            <CardAction>
                                <ConfirmDialog
                                    title={t("settingsPage.history.clear.title")}
                                    description={t("settingsPage.history.clear.description")}
                                    onConfirm={clear}
                                    trigger={
                                        <Button variant="destructive" size="sm" disabled={!history.length}>
                                            <Trash2 />
                                            {t("settingsPage.history.clear.button")}
                                        </Button>
                                    }
                                />
                            </CardAction>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {!history.length ? (
                                <Empty className="rounded-lg border py-10">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <Trash2 className="size-5" />
                                        </EmptyMedia>
                                        <EmptyTitle>{t("settingsPage.history.empty.title")}</EmptyTitle>
                                        <EmptyDescription>{t("settingsPage.history.empty.description")}</EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            ) : (
                                <div className="space-y-2">
                                    {history.map((item) => {
                                        const title = item.kind === "movie" ? item.item.title : `${item.item.tvshowtitle} • S${item.item.season_number}E${item.item.episode_number}`

                                        return (
                                            <Item key={title} className="flex items-center justify-between border-dashed border-border">
                                                <ItemContent>
                                                    <P>{title}</P>
                                                </ItemContent>

                                                <ConfirmDialog
                                                    title={t("settingsPage.history.item.removeTitle")}
                                                    description={t("settingsPage.history.item.removeDescription")}
                                                    onConfirm={() => remove(item)}
                                                    trigger={
                                                        <Button variant="secondary" size="sm">
                                                            <Trash2 />
                                                            {t("settingsPage.history.item.removeButton")}
                                                        </Button>
                                                    }
                                                />
                                            </Item>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ---------------- PLAYBACK ---------------- */}
                <TabsContent value="playback">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("settingsPage.playback.title")}</CardTitle>
                            <CardDescription>{t("settingsPage.playback.description")}</CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label>{t("settingsPage.playback.autoplayNext.label")}</Label>
                                    <p className="text-sm text-muted-foreground">{t("settingsPage.playback.autoplayNext.description")}</p>
                                </div>

                                <Switch checked={autoplayNext} onCheckedChange={setAutoplayNext} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ---------------- OMSS ---------------- */}
                <TabsContent value="omss">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("settingsPage.omss.title", { coreName: t("coreName") })}</CardTitle>
                            <CardDescription>{t("settingsPage.omss.description")}</CardDescription>
                            <CardAction>
                                {valid ? <Badge>{t("settingsPage.omss.connection.connected")}</Badge> : <Badge variant="destructive">{t("settingsPage.omss.connection.disconnected")}</Badge>}
                            </CardAction>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="omss">{t("settingsPage.omss.label", { coreName: t("coreName") })}</Label>

                                <span className="flex pt-1 text-muted-foreground">{t("settingsPage.omss.info")}</span>

                                <Input id="omss" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="http://localhost:3000" />

                                {!standalone && (
                                    <Item className="border-dashed border-border">
                                        <ItemHeader>
                                            <H4 className="flex items-center gap-2">
                                                <AlertTriangle />
                                                {t("settingsPage.omss.note.title")}
                                            </H4>
                                        </ItemHeader>
                                        <ItemContent>
                                            <P>{t("settingsPage.omss.note.value")}</P>
                                        </ItemContent>
                                    </Item>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ---------------- TMDB ---------------- */}
                <TabsContent value="tmdb">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("settingsPage.tmdb.title")}</CardTitle>
                            <CardDescription>{t("settingsPage.tmdb.description")}</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="tmdb">{t("settingsPage.tmdb.apiKey")}</Label>
                                <span className="flex pt-1 text-muted-foreground">{t("settingsPage.tmdb.info")}</span>
                                <Input disabled id="tmdb" value={maskKey(tmdbApiKey, 10)} />
                            </div>

                            <div className="mt-3 flex justify-between">
                                <div>
                                    <Label>{t("settingsPage.tmdb.region.cardlabel")}</Label>

                                    <span className="flex pt-1 pr-4 text-muted-foreground">
                                        {t("settingsPage.tmdb.region.info", {
                                            projectName: t("projectName"),
                                        })}
                                    </span>
                                </div>

                                <Select
                                    value={region}
                                    onValueChange={(value) => {
                                        setRegion(value as CountryISO3166_1)
                                        cache?.clear()
                                        location.reload()
                                    }}
                                >
                                    <SelectTrigger className="w-3/5">
                                        <SelectValue placeholder={t("settingsPage.tmdb.region.placeholder")} />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>{t("settingsPage.tmdb.region.selectlabel")}</SelectLabel>
                                        </SelectGroup>

                                        {supportedRegions.map((r) => (
                                            <SelectItem key={r.value} value={r.value}>
                                                {r.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </section>
    )
}
