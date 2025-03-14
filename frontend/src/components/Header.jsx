import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Menu,
  ChevronRight,
  Bell,
  LogOut,
  User,
  Moon,
  Sun,
  ChevronDown,
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
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Switch } from "./ui/switch";
import React, { useState } from "react";
import { cn } from "../lib/utils";
import ProfileModal from "./profile/ProfileModal";

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
  const publicMenuItems = menuItems.PublicMenu || [];
  const location = useLocation();
  const [openAccordions, setOpenAccordions] = useState({});
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const handleLogout = () => {
    logout(true);
  };

  const ListItem = React.forwardRef(
    ({ className, title, children, ...props }, ref) => {
      return (
        <li>
          <NavigationMenuLink asChild>
            <a
              ref={ref}
              className={cn(
                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                className
              )}
              {...props}
            >
              <div className="text-sm font-medium leading-none">{title}</div>
              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                {children}
              </p>
            </a>
          </NavigationMenuLink>
        </li>
      );
    }
  );
  ListItem.displayName = "ListItem";

  const PublicNavigation = () => (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {publicMenuItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            <NavigationMenuLink asChild>
              <Link
                to={item.path()}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                  location.pathname === item.path() &&
                    "bg-accent text-accent-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  {item.title}
                </div>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );

  const AuthenticatedControls = () => {
    const role = user?.role || "Student";
    const userId = user?._id;
    const currentMenuItems = menuItems[role] || [];
    const location = useLocation();
    const [openAccordions, setOpenAccordions] = useState({});

    const getCurrentPath = (pathFn) => {
      try {
        return typeof pathFn === "function" ? pathFn(userId) : pathFn;
      } catch (error) {
        console.error("Error generating path:", error);
        return "/";
      }
    };

    const toggleAccordion = (title) => {
      setOpenAccordions((prev) => ({
        ...prev,
        [title]: !prev[title],
      }));
    };

    const isLinkActive = (path) => {
      const currentPath = getCurrentPath(path);
      return location.pathname === currentPath;
    };

    return (
      <>
        {/* Desktop view */}
        <div className="hidden md:flex items-center space-x-4">
          <MemoizedThemeToggle />
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80" align="end" sideOffset={8}>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  You have no new notifications.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
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
              <DropdownMenuItem
                onClick={() => setProfileModalOpen(true)}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
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
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[300px] p-0">
              <div className="flex flex-col h-full">
                <SheetHeader className="p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.photo} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <SheetTitle className="text-left">
                        {user?.name}
                      </SheetTitle>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 space-y-4">
                    {currentMenuItems.map((item) => {
                      if (item.type === "accordion") {
                        const isOpen = openAccordions[item.title];
                        const hasActiveChild = item.items?.some((subItem) =>
                          isLinkActive(subItem.path)
                        );

                        return (
                          <div key={item.title} className="space-y-2">
                            <button
                              onClick={() => toggleAccordion(item.title)}
                              className={cn(
                                "w-full text-sm px-2 py-1.5 rounded-lg transition-colors flex items-center justify-between",
                                hasActiveChild || isOpen
                                  ? "bg-accent text-accent-foreground"
                                  : "hover:bg-accent/50"
                              )}
                            >
                              <span className="flex items-center gap-2">
                                {item.icon}
                                {item.title}
                              </span>
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 transition-transform",
                                  isOpen ? "transform rotate-180" : ""
                                )}
                              />
                            </button>
                            {isOpen && (
                              <div className="space-y-1 pl-4">
                                {item.items.map((subItem) => {
                                  const isActive = isLinkActive(subItem.path);
                                  return (
                                    <Link
                                      key={subItem.title}
                                      to={getCurrentPath(subItem.path)}
                                      className={cn(
                                        "flex items-center p-2 rounded-lg transition-colors",
                                        isActive
                                          ? "bg-accent text-accent-foreground"
                                          : "hover:bg-accent/50"
                                      )}
                                    >
                                      {subItem.icon}
                                      <span className="ml-2 text-sm">
                                        {subItem.title}
                                      </span>
                                      <ChevronRight className="h-4 w-4 ml-auto" />
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }

                      const isActive = isLinkActive(item.path);
                      return (
                        <Link
                          key={item.title}
                          to={getCurrentPath(item.path)}
                          className={cn(
                            "flex items-center p-2 rounded-lg transition-colors",
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent/50"
                          )}
                        >
                          {item.icon}
                          <span className="ml-2 text-sm">{item.title}</span>
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
                <div className="border-t border-border mt-auto">
                  <div className="p-4 space-y-2">
                    <button
                      onClick={() => setProfileModalOpen(true)}
                      className={cn(
                        "flex w-full items-center p-2 rounded-lg transition-colors hover:bg-accent/50"
                      )}
                    >
                      <User className="h-4 w-4" />
                      <span className="ml-2 text-sm">Profile</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center p-2 rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="ml-2 text-sm">Log out</span>
                    </button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Profile Modal */}
        <ProfileModal
          open={profileModalOpen}
          onOpenChange={setProfileModalOpen}
        />
      </>
    );
  };

  const UnauthenticatedControls = () => (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-3">
        <MemoizedThemeToggle />
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Login
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Button
                  className="shadow-lg hover:shadow-xl transition-all hover:scale-105 p-3"
                  asChild
                >
                  <Link to="/signup">Register</Link>
                </Button>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Mobile Navigation */}
      <div className="flex md:hidden items-center space-x-2">
        <MemoizedThemeToggle />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="h-5 w-5" />
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
                  {publicMenuItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.path()}
                      className={cn(
                        "flex items-center p-2 rounded-lg transition-colors",
                        location.pathname === item.path()
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50"
                      )}
                    >
                      {item.icon}
                      <span className="ml-2 text-sm">{item.title}</span>
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Link>
                  ))}
                  <div className="border-t border-border pt-4 space-y-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button
                      className="w-full h-11 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                      asChild
                    >
                      <Link to="/signup">Register</Link>
                    </Button>
                  </div>
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
            className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            MarSUKAT
          </Link>

          {/* Public Navigation - Only show when not authenticated */}
          {!user && <PublicNavigation />}

          {/* Auth Controls */}
          {user ? <AuthenticatedControls /> : <UnauthenticatedControls />}
        </div>
      </nav>
    </header>
  );
};

export default Header;
