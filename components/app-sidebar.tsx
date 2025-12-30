"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Settings,
  HelpCircle,
  Building2,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { UserNav } from "@/components/user-nav"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type SidebarData = {
  navMain: {
    title: string
    url: string
    icon: any
    isActive?: boolean
  }[]
  navSecondary: {
    title: string
    url: string
    icon: any
  }[]
}

function buildNavData(activePath: string | null): SidebarData {
  return {
    navMain: [
      {
        title: "Clients",
        url: "/admin",
        icon: LayoutDashboard,
        isActive: activePath === "/admin" || activePath?.startsWith("/admin/client") || activePath?.startsWith("/admin/new"),
      },
      {
        title: "Studios",
        url: "/admin/studios",
        icon: Building2,
        isActive: activePath?.startsWith("/admin/studios"),
      },
      {
        title: "Settings",
        url: "/admin/settings",
        icon: Settings,
        isActive: activePath?.startsWith("/admin/settings"),
      },
    ],
    navSecondary: [
      {
        title: "Support",
        url: "mailto:hello@yourstudio.com",
        icon: HelpCircle,
      },
    ],
  }
}

export function AppSidebar({
  activePath = null,
  ...props
}: React.ComponentProps<typeof Sidebar> & { activePath?: string | null }) {
  const data = React.useMemo(() => buildNavData(activePath), [activePath])

  return (
    <Sidebar
      variant="sidebar"
      // style={{ "--sidebar-width": "14rem" } as React.CSSProperties}
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Studio Manager</span>
                  <span className="truncate text-xs text-muted-foreground">Admin</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <UserNav />
      </SidebarFooter>
    </Sidebar>
  )
}
