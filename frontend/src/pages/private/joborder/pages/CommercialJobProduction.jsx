import PrivateLayout from "../../PrivateLayout";
import ComingSoon from "@/components/custom-components/ComingSoon";

export const CommercialJobProduction = () => {
  return (
    <PrivateLayout>
      <div className="container mx-auto py-8">
        <ComingSoon 
          title="Commercial Job Production Coming Soon!"
          description="We're building a powerful system to streamline your commercial job production workflow and enhance productivity."
          className="max-w-2xl mx-auto"
        />
      </div>
    </PrivateLayout>
  );
};
