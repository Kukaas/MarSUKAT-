import Dashboard from "@/pages/private/coordinator/pages/Dashboard";
import RentalsRequest from "@/pages/private/coordinator/pages/RentalsRequest";

export const coordinatorRoutes = [
    {
        path: "/coordinator/dashboard/:id",
        element: <Dashboard />,
    },
    {
        path: "coordinator/rental-request",
        element: <RentalsRequest />,
    }
]