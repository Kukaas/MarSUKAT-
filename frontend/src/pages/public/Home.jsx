import PublicLayout from "./PublicLayout";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

export default function Home() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-24 lg:pt-32 pb-16 lg:pb-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <Badge
              className="mb-4 bg-background hover:bg-muted transition-colors animate-fade-in"
              variant="secondary"
            >
              ✨ Professional Garment Solutions
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-muted-foreground to-foreground bg-clip-text text-transparent mb-4 sm:mb-6 animate-fade-in-up leading-tight">
              Your Complete Garment Management System
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed animate-fade-in-up delay-100 px-4">
              Streamline your uniform ordering, academic gown rentals, and
              garment production processes with our comprehensive management
              system
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 animate-fade-in-up delay-200 px-4">
              <Button
                size="lg"
                className="shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto"
              >
                Place an Order
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto"
              >
                View Catalog
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3 sm:mb-4 bg-gradient-to-r from-foreground via-muted-foreground to-foreground bg-clip-text text-transparent">
            Our Services
          </h2>
          <p className="text-muted-foreground text-center mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
            Experience seamless garment management with our comprehensive suite
            of services
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <Card className="group hover:shadow-xl transition-all hover:-translate-y-1 border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <span className="text-2xl">👕</span>
                  Uniform Ordering
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  Streamlined ordering system for school uniforms, corporate
                  wear, and custom garments with size management and bulk
                  ordering capabilities
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all hover:-translate-y-1 border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <span className="text-2xl">🎓</span>
                  Academic Gown Rentals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  Efficient rental management system for graduation ceremonies,
                  with inventory tracking and maintenance scheduling
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all hover:-translate-y-1 border-border bg-card sm:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <span className="text-2xl">⚙️</span>
                  Production Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  Real-time production tracking, inventory management, and
                  comprehensive reporting system for your garment business
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <Card className="group hover:shadow-xl transition-all hover:-translate-y-1 border-border bg-card">
              <CardHeader>
                <CardTitle className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                  1000+
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors font-medium text-sm sm:text-base">
                  Orders Processed
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all hover:-translate-y-1 border-border bg-card">
              <CardHeader>
                <CardTitle className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                  500+
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors font-medium text-sm sm:text-base">
                  Academic Gowns
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all hover:-translate-y-1 border-border bg-card">
              <CardHeader>
                <CardTitle className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                  50+
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors font-medium text-sm sm:text-base">
                  Partner Schools
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all hover:-translate-y-1 border-border bg-card">
              <CardHeader>
                <CardTitle className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                  98%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors font-medium text-sm sm:text-base">
                  Customer Satisfaction
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
