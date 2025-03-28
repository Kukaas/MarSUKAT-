import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ChevronLeft, ChevronRight, X, Heart } from "lucide-react";
import EmptyState from "@/components/custom-components/EmptyState";
import SectionHeader from "@/components/custom-components/SectionHeader";
import { dashboardAPI } from "../api/dashboardApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ViewDetailsDialog } from "@/components/custom-components/ViewDetailsDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDataFetching } from "@/hooks/useDataFetching";

function ImageModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  setCurrentIndex,
}) {
  if (!images?.length) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <ViewDetailsDialog
      open={isOpen}
      onClose={onClose}
      title={
        <div className="w-full text-center">
          <span className="text-lg">
            Image {currentIndex + 1} of {images.length}
          </span>
        </div>
      }
      maxWidth="max-w-4xl"
      className="bg-background/95 dark:bg-background/98"
    >
      <ScrollArea className="h-full">
        <div className="relative min-h-[60vh] flex items-center justify-center p-6">
          <img
            key={currentIndex}
            src={images[currentIndex].data}
            alt={`Image ${currentIndex + 1}`}
            className="max-w-full w-auto h-auto object-contain transition-all duration-500 ease-in-out animate-fadeIn"
            style={{
              willChange: "transform, opacity",
            }}
          />

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              {/* Left button - fixed position */}
              <div className="fixed left-8 top-1/2 -translate-y-1/2 z-50">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background shadow-sm border transition-transform duration-300 ease-in-out hover:scale-110"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>

              {/* Right button - fixed position */}
              <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background shadow-sm border transition-transform duration-300 ease-in-out hover:scale-110"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </ViewDetailsDialog>
  );
}

function ProductCard({ product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const hasMultipleImages = product.images?.length > 1;

  // Load favorite state from localStorage on component mount
  useEffect(() => {
    const favorites = JSON.parse(
      localStorage.getItem("favoriteProducts") || "[]"
    );
    setIsFavorite(favorites.includes(product._id));
  }, [product._id]);

  const toggleFavorite = (e) => {
    e.stopPropagation();

    const favorites = JSON.parse(
      localStorage.getItem("favoriteProducts") || "[]"
    );

    const newFavorites = isFavorite
      ? favorites.filter((id) => id !== product._id)
      : [...favorites, product._id];

    localStorage.setItem("favoriteProducts", JSON.stringify(newFavorites));

    // Trigger storage event for other tabs
    window.dispatchEvent(new Event("storage"));

    setIsFavorite(!isFavorite);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  return (
    <>
      <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 ease-in-out border-0 bg-background">
        <CardContent className="p-0">
          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            className={cn(
              "absolute top-3 right-3 z-10 rounded-full p-2",
              "bg-background/80 backdrop-blur-sm shadow-sm",
              "transition-all duration-300 ease-in-out",
              "hover:scale-110 active:scale-95",
              isFavorite
                ? "text-red-500 hover:text-red-600"
                : "text-muted-foreground hover:text-red-500"
            )}
          >
            <Heart
              className="w-5 h-5"
              fill={isFavorite ? "currentColor" : "none"}
            />
          </button>

          {/* Image Section */}
          <div
            className="relative bg-muted/30 cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            {product.images?.length > 0 ? (
              <>
                <div className="relative w-full aspect-[3/2] sm:aspect-[4/3] flex items-center justify-center p-4">
                  <img
                    src={product.images[currentImageIndex].data}
                    alt={`${product.productType}`}
                    className="max-w-full max-h-full w-auto h-auto object-contain transition-all duration-500 ease-in-out transform group-hover:scale-105"
                    style={{ willChange: "transform" }}
                  />
                </div>

                {/* Image Navigation */}
                {hasMultipleImages && (
                  <>
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-3">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border-0"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border-0"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
                      {product.images.map((_, index) => (
                        <button
                          key={index}
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            currentImageIndex === index
                              ? "w-6 bg-primary"
                              : "w-1.5 bg-primary/30"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(index);
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full aspect-[3/2] sm:aspect-[4/3] flex items-center justify-center bg-muted/30">
                <Package className="h-12 w-12 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-base text-foreground line-clamp-2">
                {product.productType}
              </h3>
              {hasMultipleImages && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {currentImageIndex + 1}/{product.images.length}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                {product.level}
              </span>

              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-xs font-medium hover:bg-primary/10 hover:text-primary"
                onClick={() => setIsModalOpen(true)}
              >
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        images={product.images}
        currentIndex={currentImageIndex}
        setCurrentIndex={setCurrentImageIndex}
      />
    </>
  );
}

export function AvailableProducts() {
  // Use React Query for data fetching with caching
  const { data: products = [], isLoading, error } = useDataFetching(
    ['activeProducts'],
    () => dashboardAPI.getActiveProducts(),
    {
      staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
      onError: (error) => {
        toast.error("Failed to fetch products");
        console.error("Error fetching products:", error);
      },
    }
  );

  // Sort products with favorites first
  const sortedProducts = useMemo(() => {
    const favorites = JSON.parse(
      localStorage.getItem("favoriteProducts") || "[]"
    );

    return [...products].sort((a, b) => {
      const aIsFavorite = favorites.includes(a._id);
      const bIsFavorite = favorites.includes(b._id);

      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return 0;
    });
  }, [products]);

  // Add event listener for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      // Force re-render to update product order
      window.dispatchEvent(new Event('storage'));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className="w-full">
      <div className="px-4 mb-6">
        <SectionHeader title="Available Products" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-0 sm:px-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="relative overflow-hidden">
              <CardContent className="p-0">
                <div className="animate-pulse">
                  <div className="aspect-[3/2] sm:aspect-[4/3] bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded-full w-3/4" />
                    <div className="h-4 bg-muted rounded-full w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-0 sm:px-4">
          {sortedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          message="No products available at the moment"
          className="mt-4"
        />
      )}
    </div>
  );
}
