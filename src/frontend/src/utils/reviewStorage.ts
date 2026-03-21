export type Review = {
  id: string;
  parentName: string;
  studentName: string;
  reviewText: string;
  rating: number; // 1-5
  createdAt: number;
};

const KEY = "tuitions_reviews";

export function getReviews(): Review[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Review[]) : [];
  } catch {
    return [];
  }
}

export function addReview(review: Omit<Review, "id" | "createdAt">): void {
  const reviews = getReviews();
  reviews.push({ ...review, id: crypto.randomUUID(), createdAt: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(reviews));
}

export function deleteReview(id: string): void {
  const reviews = getReviews().filter((r) => r.id !== id);
  localStorage.setItem(KEY, JSON.stringify(reviews));
}
