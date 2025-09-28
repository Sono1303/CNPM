import React, { useState } from "react";
import { Book, Home, Clock, LogIn, User, Menu, X } from "lucide-react";
import { Button } from "./ui/button";

export default function Layout({ children, currentUser, onLogout, currentPage, onPageChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: "home", label: "Library", icon: Home },
    ...(currentUser ? [{ id: "history", label: "History", icon: Clock }] : []),
    ...(currentUser && currentUser.role === "admin" ? [{ id: "admin", label: "Admin", icon: User }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-background px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <Book className="h-6 w-6" />
            <span className="text-lg font-medium">liba</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentUser ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Hello, {currentUser.name || currentUser.username || currentUser.user_name}
              </span>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onPageChange("login")}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Login
            </Button>
          )}
        </div>
      </header>
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          fixed md:static top-16 left-0 z-30 min-h-[calc(100vh-4rem)] md:h-auto w-64 
          bg-input-background border-r border-border transition-transform duration-200 ease-in-out
        `}
          style={{ backgroundColor: '#f8f8f8' }}
        >
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              const itemClass = `w-full justify-start ${isActive ? 'bg-input-background text-foreground font-medium' : 'text-muted-foreground'} hover:bg-input-background hover:text-foreground`;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={itemClass}
                  onClick={() => {
                    onPageChange(item.id);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
          {!currentUser && (
            <div className="absolute bottom-4 left-4 right-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:bg-input-background hover:text-foreground"
                onClick={() => {
                  onPageChange("login");
                  setSidebarOpen(false);
                }}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </div>
          )}
        </aside>
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 top-16 bg-black/20 md:hidden z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
