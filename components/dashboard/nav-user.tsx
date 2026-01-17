
"use client"

import * as React from "react"
import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Sparkles,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { useSession, signOut } from "next-auth/react"

export function NavUser() {
    const { isMobile } = useSidebar()
    const { data: session, status } = useSession()

    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const [currentAvatar, setCurrentAvatar] = React.useState(session?.user?.image || "");

    React.useEffect(() => {
        if (session?.user?.image) {
            setCurrentAvatar(session.user.image);
        }
    }, [session?.user?.image]);

    React.useEffect(() => {
        const handleAvatarUpdate = (event: CustomEvent<string>) => {
            setCurrentAvatar(event.detail);
        };
        window.addEventListener('user-avatar-updated', handleAvatarUpdate as EventListener);
        return () => window.removeEventListener('user-avatar-updated', handleAvatarUpdate as EventListener);
    }, []);

    if (!isMounted) return null

    if (status === "loading") {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" className="animate-pulse">
                        <div className="h-8 w-8 rounded-lg bg-muted" />
                        <div className="grid flex-1 gap-2">
                            <div className="h-4 w-24 bg-muted rounded" />
                            <div className="h-3 w-32 bg-muted rounded" />
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    // Fallback user if session is not yet loaded but we are in dashboard (assuming protected)
    // Or just return null if no session.
    // However, if the user "lost" the button, maybe session is taking time.
    // Let's render a skeleton or just render with defaults if session is loading?
    // "useSession" returns status.

    // Better: If no session, do not return null, maybe show a "Loading..." or just hide?
    // If the user says "lost button", they expect to see it.

    if (!session?.user) return null

    const user = {
        name: session.user.name || "User",
        email: session.user.email || "user@example.com",
        avatar: currentAvatar,
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar key={user.avatar} className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="rounded-lg">{user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold font-heading text-lg">{user.name}</span>
                                <span className="truncate text-sm font-heading">{user.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar key={user.avatar} className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="rounded-lg">{user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold font-heading text-lg">{user.name}</span>
                                    <span className="truncate text-sm font-heading">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Sparkles className="mr-2 h-4 w-4" />
                                <span className="font-heading text-lg">Nâng cấp tài khoản</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <BadgeCheck className="mr-2 h-4 w-4" />
                                <span className="font-heading text-lg">Hồ sơ</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <CreditCard className="mr-2 h-4 w-4" />
                                <span className="font-heading text-lg">Thanh toán</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Bell className="mr-2 h-4 w-4" />
                                <span className="font-heading text-lg">Thông báo</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span className="font-heading text-lg">Đăng xuất</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
