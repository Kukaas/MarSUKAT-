import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import TermsContent from "./TermsContent";
import PrivacyContent from "./PrivacyContent";

const Footer = () => {
  return (
    <footer className="w-full py-4 bg-background border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-primary">MarSUKAT</span>
            <span className="text-xs text-muted-foreground">
              © {new Date().getFullYear()}
            </span>
          </div>

          <nav className="flex items-center space-x-6">
            <Dialog>
              <DialogTrigger className="text-xs hover:text-primary transition-colors duration-200 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Terms
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Terms of Service</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh]">
                  <div className="p-4">
                    <TermsContent />
                  </div>
                </ScrollArea>
                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger className="text-xs hover:text-primary transition-colors duration-200 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Privacy
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Privacy Policy</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh]">
                  <div className="p-4">
                    <PrivacyContent />
                  </div>
                </ScrollArea>
                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Link
              to="/contact-us"
              className="text-xs hover:text-primary transition-colors duration-200 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
