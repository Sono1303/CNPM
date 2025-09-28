import React from "react";
import { Button } from "./ui/button";
import ImageWithFallback from "./figma/ImageWithFallback";
import { BookOpen, Users, Clock } from "lucide-react";

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-card-foreground">
              Discover Your Next
              <span className="text-primary block">Great Read</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg">
              Explore our vast collection of books, digital resources, and community programs. 
              Your gateway to knowledge and imagination awaits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8">
                Browse Collection
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Get Library Card
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <div className="text-2xl font-bold text-card-foreground">50K+</div>
                <div className="text-sm text-muted-foreground">Books Available</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div className="text-2xl font-bold text-card-foreground">15K+</div>
                <div className="text-sm text-muted-foreground">Active Members</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <div className="text-2xl font-bold text-card-foreground">24/7</div>
                <div className="text-sm text-muted-foreground">Digital Access</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1674653760708-f521366e5cde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsaWJyYXJ5JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU4ODE1OTM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Modern library interior with reading spaces"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-card rounded-lg p-4 shadow-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-card-foreground">New Arrivals</div>
                  <div className="text-sm text-muted-foreground">120 books this week</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
