import PrivateLayout from "../../PrivateLayout";
import ComingSoon from "@/components/custom-components/ComingSoon";

export function Rentals() {
  return (
    <PrivateLayout>
      <div className="container mx-auto py-8">
        <ComingSoon 
          title="Rentals System Coming Soon!"
          description="We're creating an intuitive rental management system to help you handle equipment rentals, tracking, and scheduling with ease."
          className="max-w-2xl mx-auto"
        />
      </div>
    </PrivateLayout>
  );
}
