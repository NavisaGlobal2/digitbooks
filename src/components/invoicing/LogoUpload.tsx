
import { useRef, ChangeEvent } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LogoUploadProps {
  logoPreview: string | null;
  setLogoPreview: (logo: string | null) => void;
}

const LogoUpload = ({ logoPreview, setLogoPreview }: LogoUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setLogoPreview(e.target.result);
          toast.success("Logo uploaded successfully");
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleBrowseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setLogoPreview(e.target.result);
          toast.success("Logo uploaded successfully");
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-border">
      <h3 className="text-lg font-medium mb-4">Upload logo</h3>
      <div 
        className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center bg-gray-50"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {logoPreview ? (
          <div className="flex flex-col items-center">
            <div className="h-24 w-24 mb-3">
              <img 
                src={logoPreview} 
                alt="Uploaded logo" 
                className="h-full w-full object-contain"
              />
            </div>
            <Button 
              variant="outline" 
              className="text-green-500 border-green-500 hover:bg-green-50"
              onClick={handleBrowseFiles}
            >
              Change logo
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-2">
              <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H20V28H4V4Z" stroke="#00C853" strokeWidth="2.5" fill="none"/>
                <path d="M12 4V28" stroke="#00C853" strokeWidth="2.5"/>
                <path d="M4 4H20V28H4V4Z" fill="#00C853" fillOpacity="0.2"/>
              </svg>
            </div>
            <p className="text-sm text-gray-500 mb-1">Drag & drop file here</p>
            <p className="text-sm text-gray-500 mb-3">or</p>
            <Button 
              variant="outline" 
              className="text-green-500 border-green-500 hover:bg-green-50"
              onClick={handleBrowseFiles}
            >
              Browse files
            </Button>
          </>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleLogoUpload}
        />
      </div>
    </div>
  );
};

export default LogoUpload;
