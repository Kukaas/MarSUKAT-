import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <section className="px-4 sm:px-6 w-full">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-8xl font-bold bg-gradient-to-r from-foreground via-muted-foreground to-foreground bg-clip-text text-transparent mb-4 sm:mb-6 animate-fade-in-up">
              404
            </h1>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-muted-foreground to-foreground bg-clip-text text-transparent mb-4 sm:mb-6 animate-fade-in-up leading-tight">
              Page Not Found
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed animate-fade-in-up delay-100 px-4">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 animate-fade-in-up delay-200 px-4">
              <Button
                size="lg"
                className="shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto"
                onClick={() => navigate(-1)}
              >
                Go Back
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto"
                onClick={() => navigate("/")}
              >
                Return Home
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
