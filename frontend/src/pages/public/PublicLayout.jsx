import Header from "../../components/Header";
import Footer from "../../components/Footer";

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background bg-gradient-to-b from-muted/50 via-background to-muted/50 flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
