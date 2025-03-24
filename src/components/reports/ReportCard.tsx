
import { Card, CardContent } from "@/components/ui/card";

interface ReportCardProps {
  title: string;
  description: string;
  variant: "blue" | "green" | "yellow";
  onClick: () => void;
}

export const ReportCard = ({ title, description, variant, onClick }: ReportCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "blue":
        return "border-blue-200 bg-blue-50 hover:bg-blue-100";
      case "green":
        return "border-green-200 bg-green-50 hover:bg-green-100";
      case "yellow":
        return "border-yellow-200 bg-yellow-50 hover:bg-yellow-100";
      default:
        return "border-gray-200 bg-gray-50 hover:bg-gray-100";
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-colors ${getVariantStyles()}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  );
};
