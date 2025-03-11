import PublicLayout from "./PublicLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { Badge } from "../../components/ui/badge";

export default function Faq() {
  const faqData = [
    {
      category: "Getting Started",
      items: [
        {
          question: "What is MarSUKAT?",
          answer:
            "MarSUKAT is MSU's official garment management platform where you can order uniforms, rent academic gowns, and track your orders.",
        },
        {
          question: "How do I create an account?",
          answer:
            "Sign up using your MSU email address. Once verified, you can start ordering uniforms or renting academic gowns.",
        },
        {
          question: "What payment methods are accepted?",
          answer:
            "We accept GCash, Maya, and cash payments at designated payment centers within MSU.",
        },
      ],
    },
    {
      category: "Uniform Orders",
      items: [
        {
          question: "How do I order my school uniform?",
          answer:
            "1. Log in to your account\n2. Select your department and course\n3. Choose your uniform type and size\n4. Add to cart and proceed to checkout",
        },
        {
          question: "How long does uniform delivery take?",
          answer:
            "Standard delivery takes 3-5 working days within campus. Rush orders (additional fee) are delivered within 24-48 hours.",
        },
        {
          question: "What if my uniform doesn't fit?",
          answer:
            "We offer free size adjustments within 7 days of delivery. Visit our office with your order receipt.",
        },
      ],
    },
    {
      category: "Academic Gown Rentals",
      items: [
        {
          question: "When should I book my graduation gown?",
          answer:
            "Book at least 2 weeks before your graduation ceremony to ensure availability. Early booking gets 10% discount.",
        },
        {
          question: "What's included in the gown rental?",
          answer:
            "Package includes: graduation gown, cap, tassel, and hood (for specific degrees). All freshly cleaned and pressed.",
        },
        {
          question: "How do I return the rented gown?",
          answer:
            "Return to our office within 2 days after graduation. Late returns incur a daily fee of ₱100.",
        },
      ],
    },
  ];

  return (
    <PublicLayout>
      <section className="pt-24 lg:pt-32 pb-16 lg:pb-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <Badge
              className="mb-4 bg-background hover:bg-muted transition-colors animate-fade-in"
              variant="secondary"
            >
              ❓ Got Questions?
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-muted-foreground to-foreground bg-clip-text text-transparent mb-4 sm:mb-6 animate-fade-in-up leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed animate-fade-in-up delay-100 px-4">
              Quick answers about uniforms, gowns, and more
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 lg:py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-8 last:mb-0">
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {category.category}
              </h2>
              <Accordion type="single" collapsible className="w-full space-y-4">
                {category.items.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${categoryIndex}-${index}`}
                    className="border border-border bg-card hover:shadow-lg transition-all rounded-lg px-4"
                  >
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
