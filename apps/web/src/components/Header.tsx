"use client";

import { Button, Dropdown, Label } from "@heroui/react";
import { useState } from "react";
import { useAuthStore } from "@/src/store/auth.store";
import { supabase } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  Dog,
  Settings,
  LogOut,
  Bone,
  Menu,
  X,
  User,
  Stethoscope,
  Calendar,
  LucideIcon,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserRole } from "@reservacion-veterinaria/types";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      router.replace("/auth/login");
    }
  };

  const navItemsByRole: Record<UserRole, NavItem[]> = {
    admin: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Dueños", href: "/admin/owners_pets", icon: Users },
      { label: "Mascotas", href: "/admin/pets", icon: Dog },
      { label: "Veterinarios", href: "/admin/veterinary", icon: Stethoscope },
      { label: "Chats", href: "/admin/chat", icon: MessageCircle },
    ],

    veterinarian: [
      { label: "Calendario", href: "/veterinary/calendar", icon: Calendar },
      { label: "Pacientes", href: "/veterinary/pets", icon: Dog },
    ],

    owner_pet: [{ label: "Pacientes", href: "/admin/pets", icon: Dog }],

    receptionist: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Dueños", href: "/admin/owners_pets", icon: Users },
      { label: "Mascotas", href: "/admin/pets", icon: Dog },
    ],
  };

  const navItems = navItemsByRole[user?.role as UserRole];

  const linkClass = (href: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
     ${
       pathname === href
         ? "bg-default-100 text-zinc-700 font-medium "
         : "text-zinc-500 hover:text-zinc hover:bg-zinc-50"
     }`;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <button
              className="sm:hidden p-2 text-default-600 hover:text-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Bone className="text-primary" size={28} />
            <span className="font-bold text-xl text-default-900">
              VetClinic
            </span>
          </div>

          {/* Nav Desktop */}
          <nav className="hidden sm:flex gap-6">
            {navItems?.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(item.href)}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <Dropdown>
            <Button isIconOnly aria-label="Menu" variant="secondary">
              <Settings size={18} />
            </Button>
            <Dropdown.Popover>
              <Dropdown.Menu
                onAction={(key) => {
                  if (key === "logout") {
                    handleSignOut();
                  }
                }}
              >
                <Dropdown.Item id="new-file" textValue="New file">
                  <User size={18} />
                  <Label>Perfil</Label>
                </Dropdown.Item>

                <Dropdown.Item
                  id="logout"
                  textValue="Delete file"
                  variant="danger"
                >
                  <LogOut size={18} className="text-danger" />
                  <Label>Cerrar session</Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="sm:hidden pb-4 space-y-2">
            {navItems?.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 text-default-600 hover:text-primary hover:bg-default-100 rounded-lg transition-colors"
              >
                <item.icon size={18} />
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
