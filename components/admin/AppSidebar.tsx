'use client';

import { IdCard, TagPlus, Calendar, ChevronDown, ChevronUp, Combine, CreditCard, Home, Inbox, Plus, Projector, Search, Settings, ShoppingCart, User2 } from 'lucide-react';
import Image from 'next/image';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

function AppSidebar() {
  return (
    <Sidebar collapsible="offcanvas">

      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={
                <Link href="/">
                    <Image src="/logo.svg" alt="logo" width={20} height={20} />
                    <span>Smart Commerce</span>
                </Link>} 
              />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* <SidebarSeparator /> */}

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={
                      <Link href="/admin">
                        <Home />
                        <span>Home</span>
                      </Link>} 
                  />
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <DropdownMenu>
                    <DropdownMenuTrigger render={
                            <SidebarMenuButton>
                                <ShoppingCart /> Products <ChevronDown className="ml-auto" />
                            </SidebarMenuButton>
                        }
                    />
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link href={"/admin/products"} className='w-full'>
                            Products
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={"/admin/groups"} className='w-full'>
                            Category Groups
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={"/admin/categories"} className='w-full'>
                            Categories
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={"/admin/products/colors"} className='w-full'>
                            Colors
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={"/admin/products/sizes"} className='w-full'>
                            Sizes
                          </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <DropdownMenu>
                    <DropdownMenuTrigger render={
                            <SidebarMenuButton>
                                <Combine /> Outfits <ChevronDown className="ml-auto" />
                            </SidebarMenuButton>
                        }
                    />
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link href={"/admin/outfits"} className='w-full'>
                            Outfits
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={"/admin/collections"} className='w-full'>
                            Collections
                          </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton render={
                        <Link href="/admin/orders">
                          <CreditCard />
                          <span>Orders</span>
                        </Link>} 
                    />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={
                        <Link href="/admin/brands">
                          <IdCard />
                          <span>Brands</span>
                        </Link>} 
                    />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton render={
                        <Link href="/admin/tags">
                          <TagPlus />
                          <span>Tags</span>
                        </Link>} 
                    />
                </SidebarMenuItem>
              {/* {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={
                        <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                        </Link>} 
                    />
                  {item.title === "Inbox" && (
                    <SidebarMenuBadge>24</SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))} */}

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* COLLAPSABLE */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel render={
                    <CollapsibleTrigger>
                        Collapsable Group
                        <ChevronDown className="ml-auto transition-transform group-data-[open]/collapsible:rotate-180" />
                    </CollapsibleTrigger>
                } 
            />
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton render={
                            <Link href="/#">
                                <Projector />
                                See All Projects
                            </Link>
                        } 
                    />
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton render={
                            <Link href="/#">
                                <Plus />
                                Add Project
                            </Link>
                        } 
                    />
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>


        <SidebarGroup />

      </SidebarContent>

        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                    <DropdownMenuTrigger render={
                            <SidebarMenuButton>
                                <User2 /> John Doe <ChevronUp className="ml-auto" />
                            </SidebarMenuButton>
                        }
                    />
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Account</DropdownMenuItem>
                        <DropdownMenuItem>Setting</DropdownMenuItem>
                        <DropdownMenuItem>Sign out</DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>

    </Sidebar>
  )
}

export default AppSidebar