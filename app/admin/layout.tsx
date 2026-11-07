import AppSidebar from "@/components/admin/AppSidebar";
import Navbar from "@/components/admin/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { requireAdminPage } from "@/lib/admin-auth";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await requireAdminPage();

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          <Navbar />
          <div className="px-4">{children}</div>
        </main>
      </SidebarProvider>
    </>
  )
}
