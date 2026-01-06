"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Settings,
  HelpCircle,
  Building2,
  type LucideIcon,
} from "lucide-react"

import { UserNav } from "@/components/user-nav"
import { AdminSidebar } from "photostudio-shared/components/admin/admin-sidebar"

type SidebarData = {
  navMain: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
  }[]
  navSecondary: {
    title: string
    url: string
    icon: LucideIcon
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

type AppSidebarProps = Omit<
  React.ComponentProps<typeof AdminSidebar>,
  "headerTitle" | "headerSubtitle" | "headerIcon" | "navMain" | "navSecondary" | "footer"
> & { activePath?: string | null }

export function AppSidebar({ activePath = null, ...props }: AppSidebarProps) {
  const data = React.useMemo(() => buildNavData(activePath), [activePath])

  return (
    <AdminSidebar
      headerTitle="Studio Manager"
      headerSubtitle="Admin"
      headerIcon={LayoutDashboard}
      navMain={data.navMain}
      navSecondary={data.navSecondary}
      footer={<UserNav />}
      {...props}
    />
  )
}
