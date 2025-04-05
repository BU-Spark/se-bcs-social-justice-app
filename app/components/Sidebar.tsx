"use client";

import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { useEffect, useState } from "react";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaUsers,
  FaCogs,
  FaComments,
  FaChalkboardTeacher,
} from "react-icons/fa";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: <FaTachometerAlt /> },
  { name: "Scheduling", href: "/scheduling", icon: <FaCalendarAlt /> },
  { name: "Events", href: "/events", icon: <FaUsers /> },
  { name: "Coaching", href: "/coaching", icon: <FaChalkboardTeacher /> },
  { name: "Communities", href: "/communities", icon: <FaComments /> },
  { name: "Settings", href: "/settings", icon: <FaCogs /> },
];

const Sidebar = () => {
  const pathname = usePathname();
  const { isExpanded, setIsExpanded } = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-blue-900 text-white transition-all duration-300 ease-in-out z-50 ${
        isExpanded ? "w-64" : "w-16"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span
              className={`text-lg font-bold whitespace-nowrap ${isExpanded ? "block" : "hidden"}`}
            >
              BE THE MESSENGER
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 p-3 mx-2 rounded-md transition ${
                pathname === item.href ? "bg-blue-700" : "hover:bg-blue-800"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span
                className={`text-md whitespace-nowrap ${isExpanded ? "block" : "hidden"}`}
              >
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 mt-auto">
          <SignedIn>
            <div className="flex items-center space-x-3">
              <UserButton afterSignOutUrl="/sign-in" />
              <span
                className={`text-sm whitespace-nowrap ${isExpanded ? "block" : "hidden"}`}
              >
                Profile
              </span>
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton>
              <button className="w-full bg-blue-700 hover:bg-blue-800 p-2 rounded-md">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
