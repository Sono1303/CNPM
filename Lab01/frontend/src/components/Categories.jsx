import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import apiClient from "../utils/apiClient";

export default function Categories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    apiClient.getBooks()
      .then((data) => {
        if (Array.isArray(data)) {
          const cats = Array.from(new Set(data.map((book) => book.category || book.genre)));
          setCategories(cats);
        } else setCategories([]);
      })
      .catch(() => setCategories([]));
  }, []);

  return (
    <section className="py-16 lg:py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-card-foreground">Browse Categories</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our organized collection across various genres and subjects
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Card key={cat} className="group hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1">
              <CardContent className="p-4">
                <h3 className="font-semibold text-card-foreground">{cat}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
