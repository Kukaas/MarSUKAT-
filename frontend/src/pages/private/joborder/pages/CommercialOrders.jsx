import PrivateLayout from "../../PrivateLayout";
import ComingSoon from "@/components/custom-components/ComingSoon";

export function CommercialOrders() {
  return (
    <PrivateLayout>
      <div className="container mx-auto py-8">
        <ComingSoon 
          title="Commercial Orders Coming Soon!"
          description="We're developing a comprehensive commercial orders management system to help you track and process orders efficiently."
          className="max-w-2xl mx-auto"
        />
      </div>
    </PrivateLayout>
  );
}
