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
        <Image src="/logofinal.png" alt="Logo" width={40} height={40} />
        <h2 className="font-game font-bold text-3xl">PrepMath</h2>
      </div>

      {/* Navbar */}
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="font-game text-xl">
              Luyện đề
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[200px] gap-3 p-4">
                <li>
                  <Link href="/dashboard/exam/thpt" legacyBehavior passHref>
                    <NavigationMenuLink className="font-game text-xl block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      THPT
                    </NavigationMenuLink>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/exam/hsa" legacyBehavior passHref>
                    <NavigationMenuLink className="font-game text-xl block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      HSA
                    </NavigationMenuLink>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/exam/tsa" legacyBehavior passHref>
                    <NavigationMenuLink className="font-game text-xl block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      TSA
                    </NavigationMenuLink>
                  </Link>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link href="/pricing" legacyBehavior passHref>
              <NavigationMenuLink className={`${navigationMenuTriggerStyle()} font-game text-xl`}>
                Bảng giá
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link href="/contactus" legacyBehavior passHref>
              <NavigationMenuLink className={`${navigationMenuTriggerStyle()} font-game text-xl`}>
                Liên hệ
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link href="/about" legacyBehavior passHref>
              <NavigationMenuLink className={`${navigationMenuTriggerStyle()} font-game text-xl`}>
                Về chúng tôi
              </NavigationMenuLink>
            </Link>
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
