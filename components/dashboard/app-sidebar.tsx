"use client"

import * as React from "react"
import {
    BookOpen,
    Bot,
    ChevronRight,
    Frame,
    LifeBuoy,
    Map,
    PieChart,
    Send,
    Settings,
    SquareTerminal,
    User,
    GraduationCap,
    Home,
    FileText,
    BarChart3,
    type LucideIcon // Import thêm type nếu cần, hoặc để any ở dưới
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
    SidebarGroup,
    SidebarGroupLabel,
    useSidebar,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { NavUser } from "@/components/dashboard/nav-user"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

// 1. Định nghĩa Interface cho NavItem
interface NavItem {
    title: string
    url: string
    icon: any // Có thể dùng LucideIcon nếu muốn chặt chẽ hơn
    isActive?: boolean
    items?: {
        title: string
        url: string
    }[]
}

// 2. Áp dụng kiểu dữ liệu cho biến data
const data: {
    user: {
        name: string
        email: string
        avatar: string
    }
    navMain: NavItem[]
} = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Tất cả các khóa học",
            url: "/dashboard",
            icon: Home,
            isActive: true,
        },
        {
            title: "Khóa học của tôi",
            url: "/dashboard/courses",
            icon: BookOpen,
        },
        {
            title: "Hồ sơ",
            url: "/dashboard/profile",
            icon: User,
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-2">
                    <div className="flex items-center justify-center rounded-lg size-10">
                        <Image
                            src="/logofinal.png"
                            alt="Prep Math Logo"
                            width={40}
                            height={40}
                            className="rounded-lg object-contain"
                        />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-bold font-heading text-2xl">Prep Math</span>
                        <span className="truncate text-base font-heading">Student</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {data.navMain.map((item) => {
                            // Logic kiểm tra active bao gồm cả menu con (nếu có)
                            const isActive = pathname === item.url || (item.items && item.items.some(sub => pathname === sub.url));

                            // Kiểm tra item.items?.length thay vì chỉ item.items để an toàn hơn
                            if (item.items && item.items.length > 0) {
                                return (
                                    <Collapsible
                                        key={item.title}
                                        asChild
                                        defaultOpen={item.isActive}
                                        className="group/collapsible"
                                    >
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton tooltip={item.title} className="font-heading">
                                                    {item.icon && <item.icon />}
                                                    <span className="text-lg">{item.title}</span>
                                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.items.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.title}>
                                                            <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                                                <Link href={subItem.url}>
                                                                    <span className="font-heading text-lg">{subItem.title}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                )
                            }

                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
                                        <Link href={item.url}>
                                            {item.icon && <item.icon />}
                                            <span className="font-heading text-lg">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}