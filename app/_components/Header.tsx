"use client";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { LogOut, User, Moon, Sun, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";

function Header() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
      <div className="bg-background/80 backdrop-blur-md border border-border shadow-sm flex items-center justify-between w-full max-w-7xl px-6 py-3 rounded-full transition-all duration-300">
        <div className="flex gap-3 items-center">
          <Image src="/logofinal.png" alt="Logo" width={40} height={40} className="hover:scale-105 transition-transform duration-200" />
          <h2 className="font-bold text-2xl tracking-tight text-primary select-none">PrepMath</h2>
        </div>

        {/* Desktop Navbar */}
        <div className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/#courses" legacyBehavior passHref>
                  <NavigationMenuLink className={`${navigationMenuTriggerStyle()} text-sm font-medium bg-transparent hover:bg-accent/50 focus:bg-transparent cursor-pointer dark:text-gray-100/90`}>
                    Khóa học
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/teachers" legacyBehavior passHref>
                  <NavigationMenuLink className={`${navigationMenuTriggerStyle()} text-sm font-medium bg-transparent hover:bg-accent/50 focus:bg-transparent cursor-pointer dark:text-gray-100/90`}>
                    Giáo viên
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/pricing" legacyBehavior passHref>
                  <NavigationMenuLink className={`${navigationMenuTriggerStyle()} text-sm font-medium bg-transparent hover:bg-accent/50 focus:bg-transparent cursor-pointer dark:text-gray-100/90`}>
                    Bảng giá
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/contactus" legacyBehavior passHref>
                  <NavigationMenuLink className={`${navigationMenuTriggerStyle()} text-sm font-medium bg-transparent hover:bg-accent/50 focus:bg-transparent cursor-pointer dark:text-gray-100/90`}>
                    Liên hệ
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/about" legacyBehavior passHref>
                  <NavigationMenuLink className={`${navigationMenuTriggerStyle()} text-sm font-medium bg-transparent hover:bg-accent/50 focus:bg-transparent cursor-pointer`}>
                    Về chúng tôi
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right Actions - Desktop Only */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Chuyển đổi giao diện</span>
          </Button>

          {/* Auth Buttons */}
          {session ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                onClick={() => signOut({ callbackUrl: 'https://www.prepmath.io.vn/' })}
                title="Đăng xuất"
              >
                <LogOut className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                      <AvatarFallback>{session.user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Hồ sơ</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => signOut({ callbackUrl: 'https://www.prepmath.io.vn/' })}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button className="rounded-full px-6 font-semibold" variant={"pixel"}>
                  Đăng kí
                </Button>
              </Link>
              <Link href="/login">
                <Button className="rounded-full px-6 font-medium" variant={"ghost"}>
                  Đăng nhập
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navbar */}
        <div className="md:hidden flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[540px]">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Mobile navigation menu</SheetDescription>
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex flex-col space-y-3">
                  <Link href="/#courses" className="text-lg font-medium hover:text-primary transition-colors">
                    Khóa học
                  </Link>
                  <Link href="/teachers" className="text-lg font-medium hover:text-primary transition-colors">
                    Giáo viên
                  </Link>
                  <Link href="/pricing" className="text-lg font-medium hover:text-primary transition-colors">
                    Bảng giá
                  </Link>
                  <Link href="/contactus" className="text-lg font-medium hover:text-primary transition-colors">
                    Liên hệ
                  </Link>
                  <Link href="/about" className="text-lg font-medium hover:text-primary transition-colors">
                    Về chúng tôi
                  </Link>
                </div>

                <div className="h-px bg-border my-2" />

                {/* Mobile Actions */}
                <div className="flex flex-col gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-start gap-2"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    <Sun className="h-5 w-5 dark:hidden" />
                    <Moon className="h-5 w-5 hidden dark:block" />
                    {theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}
                  </Button>

                  {!session && (
                    <div className="flex flex-col gap-2">
                      <Link href="/login" className="w-full">
                        <Button variant="ghost" className="w-full justify-start" size="lg">Đăng nhập</Button>
                      </Link>
                      <Link href="/login" className="w-full">
                        <Button variant="default" className="w-full justify-start" size="lg">Đăng kí</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

export default Header;
