import { categories } from "@/lib/data/categories";

export function getCategories() {
  return categories;
}

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}

