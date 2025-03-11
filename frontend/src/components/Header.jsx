import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Menu,
  ChevronRight,
  Bell,
  LogOut,
  User,
  Moon,
  Sun,
} from "lucide-react";
import { menuItems } from "../config/menuItems";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Switch } from "./ui/switch";
import React from "react";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="theme-toggle"
        checked={theme === "dark"}
        onCheckedChange={toggleTheme}
        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
      />
      <label
        htmlFor="theme-toggle"
        className="text-sm text-muted-foreground cursor-pointer"
      >
        {theme === "dark" ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </label>
    </div>
  );
};

// Memoize ThemeToggle to prevent unnecessary rerenders
const MemoizedThemeToggle = React.memo(ThemeToggle);

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout(true);
  };

  const AuthenticatedControls = () => {
    const role = user?.role || "Student";
    const userId = user?._id;
    const currentMenuItems = menuItems[role] || [];

    // Generate the current path with actual user ID
    const getCurrentPath = (pathFn) => {
      return role === "Student" ? pathFn(userId) : pathFn();
    };

    return (
      <>
        {/* Desktop view */}
        <div className="hidden md:flex items-center space-x-4">
          <MemoizedThemeToggle />
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photo} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile view */}
        <div className="flex md:hidden items-center space-x-2">
          <MemoizedThemeToggle />
          <Button variant="ghost" size="icon" className="relative h-8 w-8">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photo} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[300px] p-0">
              <div className="flex flex-col h-full">
                <SheetHeader className="p-4 border-b border-border">
                  <SheetTitle className="text-lg font-bold bg-gradient-to-r from-foreground via-muted-foreground to-foreground bg-clip-text text-transparent">
                    MarSUKAT
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 space-y-4">
                    {currentMenuItems.map((item) => {
                      if (item.type === "accordion") {
                        return (
                          <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                            key={item.title}
                          >
                            <AccordionItem
                              value={item.title}
                              className="border-none"
                            >
                              <AccordionTrigger className="flex items-center p-2 rounded-lg hover:bg-muted/50 transition-all">
                                <div className="flex items-center gap-3 flex-1">
                                  {item.icon}
                                  <div>
                                    <div className="font-medium">
                                      {item.title}
                                    </div>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pt-1 pb-4">
                                {item.items.map((subItem) => (
                                  <Link
                                    key={subItem.title}
                                    to={getCurrentPath(subItem.path)}
                                    className="flex items-center p-2 pl-8 rounded-lg hover:bg-muted/50 transition-all group"
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      {subItem.icon}
                                      <div>
                                        <div className="font-medium">
                                          {subItem.title}
                                        </div>
                                      </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                  </Link>
                                ))}
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        );
                      }

                      return (
                        <Link
                          key={item.title}
                          to={getCurrentPath(item.path)}
                          className="flex items-center p-2 rounded-lg hover:bg-muted/50 transition-all group"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {item.icon}
                            <div>
                              <div className="font-medium">{item.title}</div>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </>
    );
  };

  const UnauthenticatedControls = () => (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-3">
        <MemoizedThemeToggle />
        <Button variant="ghost" size="sm" className="hover:bg-muted/80" asChild>
          <Link to="/login">Login</Link>
        </Button>
        <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
          <Link to="/signup">Register</Link>
        </Button>
      </div>

      {/* Mobile Navigation */}
      <div className="flex md:hidden items-center space-x-2">
        <MemoizedThemeToggle />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[300px] p-0">
            <div className="flex flex-col h-full">
              <SheetHeader className="p-4 border-b border-border">
                <SheetTitle className="text-lg font-bold bg-gradient-to-r from-foreground via-muted-foreground to-foreground bg-clip-text text-transparent">
                  MarSUKAT
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    asChild
                  >
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button
                    className="w-full justify-center bg-primary hover:bg-primary/90"
                    asChild
                  >
                    <Link to="/signup">Register</Link>
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );

  return (
    <header className="bg-background/80 backdrop-blur-md shadow-sm fixed w-full top-0 z-50 border-b border-border">
      <nav className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-xl sm:text-2xl font-bold text-foreground hover:opacity-80 transition-opacity"
          >
            MarSUKAT
          </Link>

          {user ? <AuthenticatedControls /> : <UnauthenticatedControls />}
        </div>
      </nav>
    </header>
  );
};

export default Header;
