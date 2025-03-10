import Header from "../../components/Header";

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <Header />
      {children}
    </div>
  );
};

export default PublicLayout;
