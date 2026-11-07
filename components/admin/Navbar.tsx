"use client"

import { LogOut, Moon, Settings, Sun, User } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Button } from '../ui/button'
import { useTheme } from "next-themes"
import { SidebarTrigger } from '../ui/sidebar'
import { UserButton, useUser } from "@clerk/nextjs"

function Navbar() {
    const { setTheme } = useTheme()
    const {user} = useUser()


  return (
    <nav className="p-4 flex items-center justify-between">
      {/* LEFT */}
        <SidebarTrigger />
      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <Link href={"/"}>Dashboard</Link>
        {/* THEME MENU */}
        <DropdownMenu>
            <DropdownMenuTrigger render={
                <Button variant="outline" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>}
            />
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        <UserButton />

      </div>
    </nav>
  )
}

export default Navbar