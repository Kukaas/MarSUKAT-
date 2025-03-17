import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ZoomIn,
  ZoomOut,
  X,
  MoveIcon,
  MinusCircle,
  PlusCircle,
  RotateCcw,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ImageViewer({ isOpen, onClose, imageUrl, title }) {
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Add touch event options to prevent passive listener warning
  useEffect(() => {
    const preventDefaultTouch = (e) => e.preventDefault();

    // Add non-passive touch event listeners
    const options = { passive: false };
    const element = imageRef.current;

    if (element) {
      element.addEventListener("touchmove", preventDefaultTouch, options);
      return () => {
        element.removeEventListener("touchmove", preventDefaultTouch);
      };
    }
  }, []);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 1));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Function to constrain movement within boundaries
  const constrainPosition = (newPosition) => {
    if (!imageRef.current || !containerRef.current) return newPosition;

    const image = imageRef.current;
    const container = containerRef.current;

    // Calculate boundaries based on scaled dimensions
    const scaledWidth = image.offsetWidth * scale;
    const scaledHeight = image.offsetHeight * scale;

    // Calculate maximum allowed movement
    const maxX = (scaledWidth - image.offsetWidth) / 2;
    const maxY = (scaledHeight - image.offsetHeight) / 2;

    return {
      x: Math.min(Math.max(newPosition.x, -maxX), maxX),
      y: Math.min(Math.max(newPosition.y, -maxY), maxY),
    };
  };

  // Touch event handlers
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      // Single touch for drag
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  // Update touch handlers to use constraints
  const handleTouchMove = (e) => {
    if (isDragging && e.touches.length === 1 && scale > 1) {
      e.preventDefault();
      const newPosition = {
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      };
      setPosition(constrainPosition(newPosition));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse event handlers
  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  // Update mouse handlers to use constraints
  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };
      setPosition(constrainPosition(newPosition));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const isModified = scale !== 1 || position.x !== 0 || position.y !== 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[50vw] h-[85vh] p-0 gap-0 flex flex-col">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base sm:text-lg">{title}</DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 h-[calc(85vh-140px)]">
          <div
            className="min-h-full w-full flex items-center justify-center"
            ref={containerRef}
          >
            <div
              className={cn(
                "relative w-full h-full flex items-center justify-center p-4 sm:p-6",
                isDragging && "cursor-grabbing",
                scale > 1 && !isDragging && "cursor-grab"
              )}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                style={{
                  transform: `scale(${scale}) translate(${
                    position.x / scale
                  }px, ${position.y / scale}px)`,
                  transition: isDragging ? "none" : "transform 0.2s",
                }}
                className="relative flex items-center justify-center"
              >
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Zoomed view"
                  className="max-w-full max-h-[calc(90vh-200px)] object-contain"
                  draggable="false"
                  onLoad={() => {
                    // Reset position when image loads or scale changes
                    setPosition({ x: 0, y: 0 });
                  }}
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t mt-auto">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-4 sm:justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="flex items-center justify-center w-full sm:w-auto gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleZoomOut}
                  disabled={scale === 1}
                  className="h-8 w-8"
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[48px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleZoomIn}
                  disabled={scale === 4}
                  className="h-8 w-8"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>

                {isModified && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleReset}
                    className="h-8 w-8 ml-2"
                    title="Reset zoom and position"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={handleClose}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
