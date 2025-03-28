import PrivateLayout from "../../PrivateLayout";
import ComingSoon from "@/components/custom-components/ComingSoon";

export const OthersInventory = () => {
  return (
    <PrivateLayout>
      <ComingSoon 
        title="Others Inventory"
        description="We're building a flexible inventory management system to handle diverse item types and categories with customizable tracking features."
      />
    </PrivateLayout>
  );
};
