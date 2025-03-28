import { Separator } from "../ui/separator";

const SectionHeader = ({ title, description }) => {
  return (
    <div className="pb-2">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Separator className="my-6" />
    </div>
  );
};

export default SectionHeader;
