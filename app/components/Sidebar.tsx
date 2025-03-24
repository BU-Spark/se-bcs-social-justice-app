"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { FiMenu, FiX } from "react-icons/fi";
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
  const [isOpen, setIsOpen] = useState(true); // Sidebar state
  const pathname = usePathname(); // Get current path

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-blue-900 text-white w-64 transition-all duration-300 ${isOpen ? "w-64" : "w-20"}`}
    >
      <div className="flex flex-col h-full">
        {/* Logo + Toggle Button */}
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            {isOpen && (
              <span className="text-lg font-bold">BE THE MESSENGER</span>
            )}
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 p-3 mx-2 rounded-md transition ${pathname === item.href ? "bg-blue-700" : "hover:bg-blue-800"}`}
            >
              <span className="text-xl">{item.icon}</span>
              {isOpen && <span className="text-md">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info & Logout Button */}
        <div className="p-4 mt-auto">
          <SignedIn>
            <div className="flex items-center space-x-3">
              <UserButton afterSignOutUrl="/sign-in" />
              {isOpen && <span className="text-sm">Profile</span>}
            </div>
            {/* <button className="flex items-center space-x-3 w-full text-left p-2 mt-3 bg-red-600 hover:bg-red-700 rounded-md">
              <FiLogOut />
              {isOpen && <span>Logout</span>}
            </button> */}
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
