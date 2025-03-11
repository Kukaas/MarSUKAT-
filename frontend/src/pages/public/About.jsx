import PublicLayout from "./PublicLayout";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Link } from "react-router-dom";

export default function About() {
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
              🏛️ Marinduque State University
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-muted-foreground to-foreground bg-clip-text text-transparent mb-4 sm:mb-6 animate-fade-in-up leading-tight">
              University Garment Services
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed animate-fade-in-up delay-100 px-4">
              Providing quality garment solutions to our university community
              and beyond through our comprehensive garment management system
            </p>
            <div className="flex justify-center animate-fade-in-up delay-200">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  Get Started Today
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3 sm:mb-4 bg-gradient-to-r from-foreground via-muted-foreground to-foreground bg-clip-text text-transparent">
            What We Offer
          </h2>
          <p className="text-muted-foreground text-center mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
            Our garment services cater to various needs within and outside the
            university community
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <Card className="group hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <span className="text-2xl">👨‍🎓</span>
                  Student Uniform Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  We provide high-quality uniforms for MSU students with
                  convenient ordering processes, size customization, and timely
                  delivery to ensure students are properly attired for their
                  academic journey.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <span className="text-2xl">🎓</span>
                  Academic Gown Rentals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  Our academic gown rental service ensures graduates look their
                  best during commencement ceremonies, with well-maintained
                  gowns and efficient rental management.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <span className="text-2xl">🏢</span>
                  Commercial Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  We extend our services to external clients, accepting
                  commercial garment orders from organizations and individuals
                  outside the university community.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <span className="text-2xl">📊</span>
                  Production Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  Our advanced production monitoring system ensures efficient
                  workflow management, quality control, and timely delivery of
                  all garment orders.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <span className="text-2xl">📦</span>
                  Inventory Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  We maintain precise control over our materials, supplies, and
                  finished products through our comprehensive inventory
                  management system.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <span className="text-2xl">📈</span>
                  Reports & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  Generate detailed reports on sales, production
                  accomplishments, and performance metrics to ensure continuous
                  improvement of our services.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
