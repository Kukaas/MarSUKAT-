import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

const PrivateLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex h-[calc(100vh-4rem)] pt-16">
        <div className="hidden md:block w-64 flex-shrink-0">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto px-6 py-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;
