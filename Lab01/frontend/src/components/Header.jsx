import React from "react";
import { Search, Menu, Book } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Book className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold text-card-foreground">Central Library</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#home" className="text-foreground hover:text-primary transition-colors">
            Home
          </a>
          <a href="#catalog" className="text-foreground hover:text-primary transition-colors">
            Catalog
          </a>
          <a href="#services" className="text-foreground hover:text-primary transition-colors">
            Services
          </a>
          <a href="#events" className="text-foreground hover:text-primary transition-colors">
            Events
          </a>
          <a href="#about" className="text-foreground hover:text-primary transition-colors">
            About
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search books..." 
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-foreground"
            />
          </div>
          <Button variant="outline" className="hidden sm:inline-flex">
            Sign In
          </Button>
          <Button size="icon" variant="ghost" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
