"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface CommonLayoutProps {
  children: ReactNode;
}

const CommonLayout = ({ children }: CommonLayoutProps) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default CommonLayout;
