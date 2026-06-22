import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { AdminStore, DetailWidgetProps } from "@medusajs/framework/types"
import { Button, Container, Heading, Input, Label, Switch, Text, Toaster, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"

interface AnnouncementBarConfig {
    enabled: boolean
    message: string
    message_zh?: string
    link: string
}

const copy = {
    en: {
        title: "Announcement Bar",
        description: "Configure the top banner displayed on your storefront",
        enabledLabel: "Enable Announcement Bar",
        enabledHelp: "Show or hide the banner on your store",
        messageLabel: "English Message",
        messagePlaceholder: "e.g., Free shipping on orders over $79!",
        messageHelp: "The default text displayed in the announcement bar",
        messageZhLabel: "Chinese Message",
        messageZhPlaceholder: "e.g., 满 $79 全球免费配送",
        messageZhHelp: "Shown when the storefront or admin language is Chinese",
        linkLabel: "Link (optional)",
        linkPlaceholder: "e.g., /shop or /sale",
        linkHelp: "Click destination URL. Leave empty for a non-clickable banner.",
        preview: "Preview",
        save: "Save Changes",
        saving: "Saving...",
        saved: "Settings saved successfully!",
        errorTitle: "Error",
        saveFailed: "Failed to save announcement settings. Please try again.",
    },
    zh: {
        title: "公告栏",
        description: "配置显示在店铺前台顶部的横幅",
        enabledLabel: "启用公告栏",
        enabledHelp: "显示或隐藏店铺顶部横幅",
        messageLabel: "英文文案",
        messagePlaceholder: "例如：Free shipping on orders over $79!",
        messageHelp: "公告栏默认显示的英文文案",
        messageZhLabel: "中文文案",
        messageZhPlaceholder: "例如：满 $79 全球免费配送",
        messageZhHelp: "当前台或后台语言为中文时显示",
        linkLabel: "链接（可选）",
        linkPlaceholder: "例如：/shop 或 /sale",
        linkHelp: "点击公告栏跳转的地址。留空则不可点击。",
        preview: "预览",
        save: "保存更改",
        saving: "保存中...",
        saved: "设置已保存！",
        errorTitle: "错误",
        saveFailed: "公告栏设置保存失败，请重试。",
    },
}

const AnnouncementSettingsWidget = ({ data }: DetailWidgetProps<AdminStore>) => {
    const [config, setConfig] = useState<AnnouncementBarConfig>({
        enabled: false,
        message: "",
        message_zh: "",
        link: "",
    })
    const [isSaving, setIsSaving] = useState(false)
    const [isDirty, setIsDirty] = useState(false)
    const [isChineseAdmin, setIsChineseAdmin] = useState(false)

    const labels = isChineseAdmin ? copy.zh : copy.en
    const previewMessage = isChineseAdmin
        ? config.message_zh || config.message
        : config.message

    useEffect(() => {
        const detectChineseAdmin = () => {
            const htmlLang = document.documentElement.lang?.toLowerCase() || ""
            const browserLang = navigator.language?.toLowerCase() || ""
            const visibleText = document.body.innerText

            setIsChineseAdmin(
                htmlLang.startsWith("zh") ||
                browserLang.startsWith("zh") ||
                (visibleText.includes("设置") && visibleText.includes("商店"))
            )
        }

        detectChineseAdmin()
        const timeout = window.setTimeout(detectChineseAdmin, 500)

        return () => window.clearTimeout(timeout)
    }, [])

    useEffect(() => {
        if (data?.metadata?.announcement_bar) {
            const announcementBar = data.metadata.announcement_bar as AnnouncementBarConfig
            setConfig({
                enabled: announcementBar.enabled ?? false,
                message: announcementBar.message ?? "",
                message_zh: announcementBar.message_zh ?? "",
                link: announcementBar.link ?? "",
            })
        }
    }, [data])

    const handleChange = (field: keyof AnnouncementBarConfig, value: string | boolean) => {
        setConfig((prev) => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const response = await fetch(`/admin/stores/${data.id}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    metadata: {
                        ...data.metadata,
                        announcement_bar: config,
                    },
                }),
            })

            if (!response.ok) {
                throw new Error(labels.saveFailed)
            }

            toast.success(labels.title, {
                description: labels.saved,
            })
            setIsDirty(false)
        } catch (error) {
            console.error("Error saving announcement settings:", error)
            toast.error(labels.errorTitle, {
                description: labels.saveFailed,
            })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <div>
                    <Heading level="h2">{labels.title}</Heading>
                    <Text className="text-ui-fg-subtle" size="small">
                        {labels.description}
                    </Text>
                </div>
            </div>

            <div className="space-y-6 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="announcement-enabled" weight="plus">
                            {labels.enabledLabel}
                        </Label>
                        <Text className="text-ui-fg-subtle" size="small">
                            {labels.enabledHelp}
                        </Text>
                    </div>
                    <Switch
                        id="announcement-enabled"
                        checked={config.enabled}
                        onCheckedChange={(checked) => handleChange("enabled", checked)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="announcement-message" weight="plus">
                        {labels.messageLabel}
                    </Label>
                    <Input
                        id="announcement-message"
                        placeholder={labels.messagePlaceholder}
                        value={config.message}
                        onChange={(event) => handleChange("message", event.target.value)}
                    />
                    <Text className="text-ui-fg-subtle" size="small">
                        {labels.messageHelp}
                    </Text>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="announcement-message-zh" weight="plus">
                        {labels.messageZhLabel}
                    </Label>
                    <Input
                        id="announcement-message-zh"
                        placeholder={labels.messageZhPlaceholder}
                        value={config.message_zh ?? ""}
                        onChange={(event) => handleChange("message_zh", event.target.value)}
                    />
                    <Text className="text-ui-fg-subtle" size="small">
                        {labels.messageZhHelp}
                    </Text>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="announcement-link" weight="plus">
                        {labels.linkLabel}
                    </Label>
                    <Input
                        id="announcement-link"
                        placeholder={labels.linkPlaceholder}
                        value={config.link}
                        onChange={(event) => handleChange("link", event.target.value)}
                    />
                    <Text className="text-ui-fg-subtle" size="small">
                        {labels.linkHelp}
                    </Text>
                </div>

                {config.enabled && previewMessage && (
                    <div className="space-y-2">
                        <Label weight="plus">{labels.preview}</Label>
                        <div className="bg-charcoal rounded px-4 py-2 text-center text-sm text-white">
                            {previewMessage}
                        </div>
                    </div>
                )}

                <div className="pt-4">
                    <Button
                        onClick={handleSave}
                        isLoading={isSaving}
                        disabled={!isDirty}
                        className="w-full"
                    >
                        {isSaving ? labels.saving : labels.save}
                    </Button>
                </div>
            </div>

            <Toaster />
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "store.details.after",
})

export default AnnouncementSettingsWidget
