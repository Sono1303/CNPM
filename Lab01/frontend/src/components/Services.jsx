import React from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import ImageWithFallback from "./figma/ImageWithFallback";
import { Wifi, Calendar, Laptop, Users, BookOpen, Coffee, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Wifi,
    title: "Free WiFi",
    description: "High-speed internet access throughout the library",
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: Laptop,
    title: "Computer Access",
    description: "Public computers and printing services available",
    color: "bg-green-100 text-green-600"
  },
  {
    icon: Users,
    title: "Study Rooms",
    description: "Private and group study spaces for focused learning",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: Calendar,
    title: "Events & Programs",
    description: "Regular workshops, book clubs, and community events",
    color: "bg-orange-100 text-orange-600"
  },
  {
    icon: BookOpen,
    title: "Research Assistance",
    description: "Expert librarians to help with your research needs",
    color: "bg-pink-100 text-pink-600"
  },
  {
    icon: Coffee,
    title: "Café & Reading Areas",
    description: "Comfortable spaces to read and enjoy refreshments",
    color: "bg-amber-100 text-amber-600"
  }
];

export default function Services() {
  return (
    <section id="services" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-card-foreground">
              More Than Just Books
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Our library offers a comprehensive range of services and amenities 
              designed to support learning, research, and community engagement.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted text-primary`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-card-foreground">{service.title}</h3>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button size="lg" className="group">
              Learn More About Our Services
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1574765462010-b7008e693af8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjByZWFkaW5nJTIwbGlicmFyeXxlbnwxfHx8fDE3NTg4MTU5Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="People reading and studying in library"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            <Card className="absolute -bottom-6 -left-6 bg-card shadow-lg border border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-card-foreground">Open 7 Days</div>
                    <div className="text-sm text-muted-foreground">Mon-Sun: 8AM-10PM</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
