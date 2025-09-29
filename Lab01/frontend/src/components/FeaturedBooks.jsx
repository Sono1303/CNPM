import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import ImageWithFallback from "./figma/ImageWithFallback";
import { Star, Heart, BookOpen } from "lucide-react";
import apiClient from "../utils/apiClient";

export default function FeaturedBooks() {
  const [featuredBooks, setFeaturedBooks] = useState([]);

  useEffect(() => {
    apiClient.getBooks()
      .then((data) => {
        if (Array.isArray(data)) setFeaturedBooks(data);
        else setFeaturedBooks([]);
      })
      .catch(() => setFeaturedBooks([]));
  }, []);

  return (
    <section id="catalog" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-card-foreground">Featured Books</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular and recommended reads, carefully curated by our librarians
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredBooks.map((book) => (
            <Card key={book.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <ImageWithFallback
                    src={book.image}
                    alt={book.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge variant={(book.available_quantity || book.available) ? "default" : "secondary"}>
                      {(book.available_quantity || book.available) ? "Available" : "Out of stock"}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold line-clamp-2 mb-1 text-card-foreground">{book.title}</h3>
                    <p className="text-sm text-muted-foreground">by {book.author}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{book.genre}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-card-foreground">{book.rating}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    variant={(book.available_quantity || book.available) ? "default" : "outline"}
                    disabled={! (book.available_quantity || book.available)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    {(book.available_quantity || book.available) ? "Borrow Now" : "Reserve"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center">
          <Button size="lg" variant="outline" className="px-8">
            View All Books
          </Button>
        </div>
      </div>
    </section>
  );
}
