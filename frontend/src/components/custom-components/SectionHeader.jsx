const SectionHeader = ({ title }) => {
  return (
    <div className="border-b border-foreground/10 pb-2">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    </div>
  );
};

export default SectionHeader;
