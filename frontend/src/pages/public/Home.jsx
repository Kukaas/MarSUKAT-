import Header from "../../components/Header";
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <Badge
              className="mb-4 bg-gray-900/5 text-gray-900 hover:bg-gray-900/10 transition-colors animate-fade-in"
              variant="secondary"
            >
              ✨ Professional Garment Solutions
            </Badge>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent mb-6 animate-fade-in-up">
              Your Complete Garment Management System
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed animate-fade-in-up delay-100">
              Streamline your uniform ordering, academic gown rentals, and
              garment production processes with our comprehensive management
              system
            </p>
            <div className="flex justify-center gap-4 animate-fade-in-up delay-200">
              <Button
                size="lg"
                className="bg-gray-900 hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Place an Order
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-gray-900 border-gray-900 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                View Catalog
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
            Our Services
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Experience seamless garment management with our comprehensive suite
            of services
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all hover:-translate-y-1 border-gray-100/50 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">👕</span>
                  Uniform Ordering
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 group-hover:text-gray-900 transition-colors">
                  Streamlined ordering system for school uniforms, corporate
                  wear, and custom garments with size management and bulk
                  ordering capabilities
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all hover:-translate-y-1 border-gray-100/50 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🎓</span>
                  Academic Gown Rentals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 group-hover:text-gray-900 transition-colors">
                  Efficient rental management system for graduation ceremonies,
                  with inventory tracking and maintenance scheduling
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all hover:-translate-y-1 border-gray-100/50 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">⚙️</span>
                  Production Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 group-hover:text-gray-900 transition-colors">
                  Real-time production tracking, inventory management, and
                  comprehensive reporting system for your garment business
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <Card className="group hover:shadow-xl transition-all hover:-translate-y-1 border-gray-100/50 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-5xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  1000+
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 group-hover:text-gray-900 transition-colors font-medium">
                  Orders Processed
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all hover:-translate-y-1 border-gray-100/50 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-5xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  500+
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 group-hover:text-gray-900 transition-colors font-medium">
                  Academic Gowns
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all hover:-translate-y-1 border-gray-100/50 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-5xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  50+
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 group-hover:text-gray-900 transition-colors font-medium">
                  Partner Schools
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all hover:-translate-y-1 border-gray-100/50 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-5xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  98%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 group-hover:text-gray-900 transition-colors font-medium">
                  Customer Satisfaction
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
