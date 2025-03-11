import PrivateLayout from "../../PrivateLayout";
import { useAuth } from "../../../../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <PrivateLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome, {user?.name}!
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-700">Role</h3>
              <p className="text-blue-900">{user?.role}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-700">Access Level</h3>
              <p className="text-green-900">{user?.accessLevel}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-700">Email</h3>
              <p className="text-purple-900">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
}
