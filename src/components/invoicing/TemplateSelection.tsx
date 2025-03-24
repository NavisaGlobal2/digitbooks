
import { FileText } from "lucide-react";

interface TemplateSelectionProps {
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
}

const TemplateSelection = ({ selectedTemplate, setSelectedTemplate }: TemplateSelectionProps) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-border">
      <h3 className="text-lg font-medium mb-4">Select template</h3>
      <div className="grid grid-cols-3 gap-4">
        <div 
          className={`border rounded-md p-2 cursor-pointer transition-all hover:shadow-md ${selectedTemplate === "default" ? "border-green-500 bg-green-50" : "border-gray-200"}`}
          onClick={() => setSelectedTemplate("default")}
        >
          <div className="aspect-[3/4] bg-white rounded border border-gray-200 flex items-center justify-center">
            <img 
              src="/lovable-uploads/37efa1ea-49eb-4e89-8928-6e829c9ac5bd.png" 
              alt="Default template" 
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-sm text-center mt-2">Default template</p>
        </div>
        <div 
          className={`border rounded-md p-2 cursor-pointer transition-all hover:shadow-md ${selectedTemplate === "professional" ? "border-green-500 bg-green-50" : "border-gray-200"}`}
          onClick={() => setSelectedTemplate("professional")}
        >
          <div className="aspect-[3/4] bg-white rounded border border-gray-200 flex items-center justify-center">
            <img 
              src="/lovable-uploads/64229911-f907-4630-9ee3-54dd7ef51e21.png" 
              alt="Professional template" 
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-sm text-center mt-2">Professional template</p>
        </div>
        <div 
          className={`border rounded-md p-2 cursor-pointer transition-all hover:shadow-md ${selectedTemplate === "minimalist" ? "border-green-500 bg-green-50" : "border-gray-200"}`}
          onClick={() => setSelectedTemplate("minimalist")}
        >
          <div className="aspect-[3/4] bg-white rounded border border-gray-200 flex items-center justify-center">
            <FileText className="text-gray-400" size={48} />
          </div>
          <p className="text-sm text-center mt-2">Minimalist template</p>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelection;
