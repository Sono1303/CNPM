import React from "react";
import { Book, MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function Footer({ disabled = false }) {
  if (disabled) return null;

  return (
    <footer className="bg-card text-card-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Library Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Book className="h-8 w-8 text-primary" />
              <span className="text-xl font-semibold text-card-foreground">Central Library</span>
            </div>
            <p className="text-muted-foreground">
              Your community's gateway to knowledge, discovery, and lifelong learning.
            </p>
            <div className="flex gap-3">
              <Button size="icon" variant="ghost" className="text-primary hover:bg-primary/10">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-primary hover:bg-primary/10">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-primary hover:bg-primary/10">
                <Instagram className="h-5 w-5" />
              </Button>
            </div>
          </div>
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Quick Links</h3>
            <div className="space-y-2">
              <a href="#catalog" className="block text-muted-foreground hover:text-primary transition-colors">
                Book Catalog
              </a>
              <a href="#events" className="block text-muted-foreground hover:text-primary transition-colors">
                Events & Programs
              </a>
              <a href="#services" className="block text-muted-foreground hover:text-primary transition-colors">
                Library Services
              </a>
              <a href="#about" className="block text-muted-foreground hover:text-primary transition-colors">
                About Us
              </a>
              <a href="#contact" className="block text-muted-foreground hover:text-primary transition-colors">
                Contact
              </a>
            </div>
          </div>
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <div className="text-muted-foreground">
                  123 Library Street<br />
                  City, State 12345
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">info@centrallibrary.org</span>
              </div>
            </div>
          </div>
          {/* Hours & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Library Hours</h3>
            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Monday - Friday: 8AM - 10PM</span>
              </div>
              <div className="text-sm ml-6">Saturday: 9AM - 8PM</div>
              <div className="text-sm ml-6">Sunday: 10AM - 6PM</div>
            </div>
            <div className="pt-4">
              <h4 className="font-semibold mb-2 text-card-foreground">Newsletter</h4>
              <div className="flex gap-2">
                <Input 
                  placeholder="Your email" 
                  className="bg-muted border-border text-card-foreground placeholder:text-muted-foreground"
                />
                <Button variant="secondary" size="sm">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 Central Library. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
