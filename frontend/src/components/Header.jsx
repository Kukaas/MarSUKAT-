import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";

const Header = () => {
  return (
    <header className="bg-white/70 backdrop-blur-md shadow-lg fixed w-full top-0 z-50 border-b border-gray-100">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              MarSUKAT
            </Link>
          </div>

          <NavigationMenu>
            <NavigationMenuList className="space-x-2">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100/80">
                  Products
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-2 p-4 w-[400px] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
                    <NavigationMenuLink asChild>
                      <Link
                        to="/uniforms"
                        className="block p-3 rounded-md hover:bg-gray-100/80 transition-all hover:translate-x-1"
                      >
                        <div className="font-medium">Uniforms</div>
                        <p className="text-sm text-gray-600">
                          Professional attire for schools and institutions
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/academic-gowns"
                        className="block p-3 rounded-md hover:bg-gray-100/80 transition-all hover:translate-x-1"
                      >
                        <div className="font-medium">Academic Gowns</div>
                        <p className="text-sm text-gray-600">
                          Ceremonial wear for graduations
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/custom-garments"
                        className="block p-3 rounded-md hover:bg-gray-100/80 transition-all hover:translate-x-1"
                      >
                        <div className="font-medium">Custom Garments</div>
                        <p className="text-sm text-gray-600">
                          Tailored solutions for your needs
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100/80">
                  Services
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-2 p-4 w-[400px] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
                    <NavigationMenuLink asChild>
                      <Link
                        to="/ordering"
                        className="block p-3 rounded-md hover:bg-gray-100/80 transition-all hover:translate-x-1"
                      >
                        <div className="font-medium">Order Management</div>
                        <p className="text-sm text-gray-600">
                          Track and manage your orders efficiently
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/rentals"
                        className="block p-3 rounded-md hover:bg-gray-100/80 transition-all hover:translate-x-1"
                      >
                        <div className="font-medium">Rental Services</div>
                        <p className="text-sm text-gray-600">
                          Flexible rental solutions for events
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/production"
                        className="block p-3 rounded-md hover:bg-gray-100/80 transition-all hover:translate-x-1"
                      >
                        <div className="font-medium">Production Tracking</div>
                        <p className="text-sm text-gray-600">
                          Real-time production monitoring
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link
                  to="/about"
                  className="px-4 py-2 rounded-md hover:bg-gray-100/80 transition-all"
                >
                  About
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="hover:bg-gray-100/80" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button className="bg-gray-900 hover:bg-gray-800 shadow-sm" asChild>
              <Link to="/register">Register</Link>
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
