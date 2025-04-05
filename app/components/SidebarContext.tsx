"use client";

import { createContext, useContext, useState } from "react";

interface SidebarContextType {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isExpanded: false,
  setIsExpanded: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <SidebarContext.Provider value={{ isExpanded, setIsExpanded }}>
      {children}
    </SidebarContext.Provider>
  );
};
