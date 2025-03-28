import PrivateLayout from "../../PrivateLayout";
import ComingSoon from "@/components/custom-components/ComingSoon";

export const OthersProduction = () => {
  return (
    <PrivateLayout>
      <div className="container mx-auto py-8">
        <ComingSoon 
          title="Others Production Coming Soon!"
          description="We're currently developing the Others Production feature to help you manage and track various production types more effectively."
          className="max-w-2xl mx-auto"
        />
      </div>
    </PrivateLayout>
  );
};
