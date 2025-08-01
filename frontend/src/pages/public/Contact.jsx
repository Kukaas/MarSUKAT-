import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Mail, Phone, MapPin, Loader2, MessageSquare } from "lucide-react";
import PublicLayout from "./PublicLayout";
import FormInput from "@/components/custom-components/FormInput";
import { Badge } from "@/components/ui/badge";
import { contactAPI } from "@/lib/api";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number must be at least 8 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function Contact() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      // Submit form data to backend
      await contactAPI.submitContactForm(data);

      toast.success("Message sent successfully!", {
        description: "We'll get back to you as soon as possible.",
        position: "top-center",
        duration: 5000,
      });

      form.reset();
    } catch (error) {
      console.error("Contact form submission error:", error);

      const errorMessage = error.response?.data?.message || "Please try again later.";

      toast.error("Failed to send message", {
        description: errorMessage,
        position: "top-center",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout>      <div className="container mx-auto px-4 py-10 sm:py-16 lg:py-24">
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <Badge
            className="mb-3 sm:mb-4 bg-background hover:bg-muted transition-colors"
            variant="secondary"
          >
            📞 Get in Touch
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-muted-foreground to-foreground bg-clip-text text-transparent mb-3 sm:mb-4">
            Contact Us
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about our services? We're here to help. Reach out to
            us through any of the following channels.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8 max-w-5xl mx-auto">
          {/* Contact Form - Now first on mobile */}          <Card className="group hover:shadow-xl transition-all border-border bg-card order-1 lg:order-2">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="text-center mb-4 sm:mb-6 lg:hidden animate-fade-in">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">Send a Message</h3>
                <p className="text-sm text-muted-foreground">
                  Fill out the form below and we'll get back to you soon.
                </p>
              </div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 sm:space-y-6"
                >
                  <FormInput
                    form={form}
                    name="name"
                    label="Full Name"
                    placeholder="Enter your full name"
                  />

                  <FormInput
                    form={form}
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    icon={Mail}
                  />

                  <FormInput
                    form={form}
                    name="phone"
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    icon={Phone}
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Message
                    </label>
                    <textarea
                      {...form.register("message")}
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="How can we help you?"
                    />
                    {form.formState.errors.message && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.message.message}
                      </p>
                    )}
                  </div>                  <Button
                    type="submit"
                    className="w-full h-11 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-sm sm:text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>          {/* Contact Information - Now second on mobile */}
          <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
            <Card className="group hover:shadow-xl transition-all border-border bg-card">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-5 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 rounded-lg bg-background w-fit">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg">Visit Us</h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Panfilio M. Manguera Sr. Road, Tanza, Boac, Marinduque
                      </p>
                    </div>
                  </div>                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 rounded-lg bg-background w-fit">
                      <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg">Call Us</h3>
                      <p className="text-sm sm:text-base text-muted-foreground">+63 970 8123 4567</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 rounded-lg bg-background w-fit">
                      <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg">Email Us</h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        marsu.garments@marsu.edu.ph
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>            <Card className="group hover:shadow-xl transition-all border-border bg-card">
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Business Hours</h3>
                <div className="space-y-1 sm:space-y-2 text-sm sm:text-base text-muted-foreground">
                  <p>Monday - Thursday:</p>
                  <ul className="list-disc pl-4 sm:pl-5 space-y-1">
                    <li>Office Hours: 7:30 AM - 4:30 PM</li>
                    <li>Measurement: 7:30 AM - 11:30 AM</li>
                    <li>Claiming: 2:30 PM - 4:30 PM</li>
                  </ul>
                  <p className="mt-2 sm:mt-3">Friday: No Transactions</p>
                  <p>Saturday - Sunday: Closed</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
