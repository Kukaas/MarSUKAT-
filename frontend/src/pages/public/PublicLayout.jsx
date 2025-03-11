import Header from "../../components/Header";

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background bg-gradient-to-b from-muted/50 via-background to-muted/50">
      <Header />
      {children}
    </div>
  );
};

export default PublicLayout;
