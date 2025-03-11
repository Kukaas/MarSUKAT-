import PrivateLayout from "../../PrivateLayout";

export default function Dashboard() {
  return (
    <PrivateLayout>
      <div className="py-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your student dashboard</p>
      </div>
    </PrivateLayout>
  );
}
