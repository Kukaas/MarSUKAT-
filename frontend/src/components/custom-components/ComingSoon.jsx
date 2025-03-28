import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ComingSoon = ({ 
  title = "Coming Soon!", 
  description = "We're working hard to bring you something amazing.",
  className = "" 
}) => {
  const navigate = useNavigate();

  return (
    <section className={`px-4 mt-15 sm:px-6 w-full ${className}`}>
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative mb-6 sm:mb-8 animate-fade-in-up">
            <Construction className="h-16 w-16 sm:h-20 sm:w-20 mx-auto text-foreground transition-colors duration-200" />
          </div>
          
          <h2 className="
            text-4xl sm:text-5xl lg:text-6xl 
            font-bold 
            bg-gradient-to-r from-foreground via-muted-foreground to-foreground 
            bg-clip-text text-transparent 
            mb-4 sm:mb-6 
            animate-fade-in-up 
            leading-tight
          ">
            {title}
          </h2>
          
          <p className="
            text-lg sm:text-xl 
            text-muted-foreground 
            mb-6 sm:mb-8 
            leading-relaxed 
            animate-fade-in-up delay-100 
            px-4
          ">
            {description}
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
  );
};

export default ComingSoon; 