import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, ChevronRight, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "./ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg fixed w-full top-0 z-50 border-b border-gray-100">
      <nav className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            MarSUKAT
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Accordion type="single" collapsible className="flex space-x-6">
              {/* Products Dropdown */}
              <AccordionItem value="products" className="border-none relative">
                <AccordionTrigger className="hover:bg-gray-100/80 px-4 py-2 rounded-lg data-[state=open]:bg-gray-100/80 group">
                  <span className="text-sm font-medium">Products</span>
                </AccordionTrigger>
                <AccordionContent className="absolute top-[calc(100%+0.5rem)] left-0 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 w-[300px] z-50">
                  <div className="p-2 space-y-1">
                    <Link
                      to="/uniforms"
                      className="flex items-center p-2.5 rounded-lg hover:bg-gray-100/80 transition-all group"
                    >
                      <div className="flex-1">
                        <div className="font-medium">Uniforms</div>
                        <p className="text-sm text-gray-600">
                          Professional attire for schools
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to="/academic-gowns"
                      className="flex items-center p-2.5 rounded-lg hover:bg-gray-100/80 transition-all group"
                    >
                      <div className="flex-1">
                        <div className="font-medium">Academic Gowns</div>
                        <p className="text-sm text-gray-600">
                          Ceremonial graduation wear
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to="/custom-garments"
                      className="flex items-center p-2.5 rounded-lg hover:bg-gray-100/80 transition-all group"
                    >
                      <div className="flex-1">
                        <div className="font-medium">Custom Garments</div>
                        <p className="text-sm text-gray-600">
                          Tailored solutions
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Services Dropdown */}
              <AccordionItem value="services" className="border-none relative">
                <AccordionTrigger className="hover:bg-gray-100/80 px-4 py-2 rounded-lg data-[state=open]:bg-gray-100/80 group">
                  <span className="text-sm font-medium">Services</span>
                </AccordionTrigger>
                <AccordionContent className="absolute top-[calc(100%+0.5rem)] left-0 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 w-[300px] z-50">
                  <div className="p-2 space-y-1">
                    <Link
                      to="/ordering"
                      className="flex items-center p-2.5 rounded-lg hover:bg-gray-100/80 transition-all group"
                    >
                      <div className="flex-1">
                        <div className="font-medium">Order Management</div>
                        <p className="text-sm text-gray-600">
                          Track your orders
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to="/rentals"
                      className="flex items-center p-2.5 rounded-lg hover:bg-gray-100/80 transition-all group"
                    >
                      <div className="flex-1">
                        <div className="font-medium">Rental Services</div>
                        <p className="text-sm text-gray-600">Event rentals</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to="/production"
                      className="flex items-center p-2.5 rounded-lg hover:bg-gray-100/80 transition-all group"
                    >
                      <div className="flex-1">
                        <div className="font-medium">Production Tracking</div>
                        <p className="text-sm text-gray-600">
                          Monitor production
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <Link
                to="/about"
                className="px-4 py-2 rounded-lg hover:bg-gray-100/80 transition-all text-sm font-medium"
              >
                About
              </Link>
            </Accordion>

            <div className="flex items-center space-x-3 ml-6">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-gray-100/80"
                asChild
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button
                size="sm"
                className="bg-gray-900 hover:bg-gray-800 shadow-sm"
                asChild
              >
                <Link to="/register">Register</Link>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[300px] p-0">
                <div className="flex flex-col h-full">
                  <SheetHeader className="p-4 border-b flex justify-between items-center">
                    <SheetTitle className="text-lg font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                      MarSUKAT
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem
                          value="products"
                          className="border-b border-gray-100"
                        >
                          <AccordionTrigger className="py-3 hover:no-underline">
                            <span className="font-medium">Products</span>
                          </AccordionTrigger>
                          <AccordionContent className="pb-3 space-y-1">
                            <Link
                              to="/uniforms"
                              className="flex items-center p-2 rounded-lg hover:bg-gray-100/80 transition-all group"
                            >
                              <div className="flex-1">
                                <div className="font-medium">Uniforms</div>
                                <p className="text-sm text-gray-600">
                                  Professional attire for schools
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                              to="/academic-gowns"
                              className="flex items-center p-2 rounded-lg hover:bg-gray-100/80 transition-all group"
                            >
                              <div className="flex-1">
                                <div className="font-medium">
                                  Academic Gowns
                                </div>
                                <p className="text-sm text-gray-600">
                                  Ceremonial graduation wear
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                              to="/custom-garments"
                              className="flex items-center p-2 rounded-lg hover:bg-gray-100/80 transition-all group"
                            >
                              <div className="flex-1">
                                <div className="font-medium">
                                  Custom Garments
                                </div>
                                <p className="text-sm text-gray-600">
                                  Tailored solutions
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem
                          value="services"
                          className="border-b border-gray-100"
                        >
                          <AccordionTrigger className="py-3 hover:no-underline">
                            <span className="font-medium">Services</span>
                          </AccordionTrigger>
                          <AccordionContent className="pb-3 space-y-1">
                            <Link
                              to="/ordering"
                              className="flex items-center p-2 rounded-lg hover:bg-gray-100/80 transition-all group"
                            >
                              <div className="flex-1">
                                <div className="font-medium">
                                  Order Management
                                </div>
                                <p className="text-sm text-gray-600">
                                  Track your orders
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                              to="/rentals"
                              className="flex items-center p-2 rounded-lg hover:bg-gray-100/80 transition-all group"
                            >
                              <div className="flex-1">
                                <div className="font-medium">
                                  Rental Services
                                </div>
                                <p className="text-sm text-gray-600">
                                  Event rentals
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                              to="/production"
                              className="flex items-center p-2 rounded-lg hover:bg-gray-100/80 transition-all group"
                            >
                              <div className="flex-1">
                                <div className="font-medium">
                                  Production Tracking
                                </div>
                                <p className="text-sm text-gray-600">
                                  Monitor production
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <div className="py-3 border-b border-gray-100">
                        <Link
                          to="/about"
                          className="flex items-center p-2 rounded-lg hover:bg-gray-100/80 transition-all group"
                        >
                          <span className="font-medium">About</span>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform ml-auto" />
                        </Link>
                      </div>

                      <div className="pt-4 space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-center"
                          asChild
                        >
                          <Link to="/login">Login</Link>
                        </Button>
                        <Button
                          className="w-full justify-center bg-gray-900 hover:bg-gray-800"
                          asChild
                        >
                          <Link to="/register">Register</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
