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
import Link from "next/link";

function Header() {
  return (
    <div className="p-4 max-w-7xl flex justify-between items-center w-full">
      <div className="flex gap-2 items-center">
        <Image src="/logo.png" alt="Logo" width={40} height={40} />
        <h2 className="font-game font-bold text-3xl">Prep HSA</h2>
      </div>

      {/* Navbar */}
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="font-game text-xl">
              Luyện đề
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink className="font-game text-xl">
                THPT
              </NavigationMenuLink>
              <NavigationMenuLink className="font-game text-xl">
                HSA
              </NavigationMenuLink>
              <NavigationMenuLink className="font-game text-xl">
                TSA
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link href="/pricing" className="font-game text-xl">
                Bảng giá
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <Link href="/contactus" className="font-game text-xl">
                Liên hệ
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <Link href="/about" className="font-game text-xl">
                Về chúng tôi
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* SignUp Button*/}

      <div className="flex items-center gap-4">
        <Link href="/register">
          <Button className="font-game text-2xl" variant={"pixel"}>
            Đăng kí
          </Button>
        </Link>
        <Link href="/login">
          <Button className="font-game text-2xl" variant={"pixel"}>
            Đăng nhập
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default Header;
