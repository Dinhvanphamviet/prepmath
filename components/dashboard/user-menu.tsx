"use client"

import * as React from "react"
import {
    BadgeCheck,
    Bell,
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
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"

export function UserMenu() {
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

    if (!isMounted) return null
    if (status === "loading") return <Button variant="ghost" size="icon" className="rounded-full animate-pulse bg-muted" />
    if (!session?.user) return null

    const user = {
        name: session.user.name || "User",
        email: session.user.email || "user@example.com",
        avatar: currentAvatar,
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 rounded-lg border">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="rounded-lg">{user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none font-heading">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground font-heading">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <Sparkles className="mr-2 h-4 w-4" />
                        <span className="font-heading">Nâng cấp tài khoản</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <BadgeCheck className="mr-2 h-4 w-4" />
                        <span className="font-heading">Hồ sơ</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span className="font-heading">Thanh toán</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Bell className="mr-2 h-4 w-4" />
                        <span className="font-heading">Thông báo</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="font-heading">Đăng xuất</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
