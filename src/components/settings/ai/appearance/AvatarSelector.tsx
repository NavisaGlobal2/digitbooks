
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, UserCircle, MessageCircle, User, UserRound, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const avatarOptions = [
  { id: "bot", label: "Robot", icon: <Bot className="h-4 w-4" /> },
  { id: "user", label: "Person", icon: <User className="h-4 w-4" /> },
  { id: "circle", label: "Circle", icon: <UserCircle className="h-4 w-4" /> },
  { id: "round", label: "Round", icon: <UserRound className="h-4 w-4" /> },
  { id: "message", label: "Message", icon: <MessageCircle className="h-4 w-4" /> },
  { id: "custom", label: "Custom", icon: null },
  { id: "uploaded", label: "Uploaded", icon: <Upload className="h-4 w-4" /> },
];

export const themeColors = {
  purple: "#9b87f5",
  green: "#05D166",
  blue: "#1EAEDB",
  black: "#222222"
};

export const getAvatarPreview = (avatarType: string, theme: string, customUrl?: string, uploadedUrl?: string) => {
  if (avatarType === "uploaded" && uploadedUrl) {
    return (
      <Avatar className={`h-16 w-16 bg-${theme === "black" ? "gray-800" : theme}`}>
        <AvatarFallback>AI</AvatarFallback>
        <AvatarImage src={uploadedUrl} />
      </Avatar>
    );
  }
  
  if (avatarType === "custom" && customUrl) {
    return (
      <Avatar className={`h-16 w-16 bg-${theme === "black" ? "gray-800" : theme}`}>
        <AvatarFallback>AI</AvatarFallback>
        <AvatarImage src={customUrl} />
      </Avatar>
    );
  }
  
  const avatarOption = avatarOptions.find(option => option.id === avatarType);
  
  return (
    <Avatar className={`h-16 w-16 bg-${theme === "black" ? "gray-800" : themeColors[theme]}`}>
      <AvatarFallback className="flex items-center justify-center text-white">
        {avatarOption?.icon || "AI"}
      </AvatarFallback>
    </Avatar>
  );
};

type AvatarSelectorProps = {
  avatarType: string;
  setAvatarType: (value: string) => void;
  theme: string;
  customUrl?: string;
  setCustomUrl?: (url: string) => void;
  uploadedUrl?: string;
  setUploadedUrl?: (url: string) => void;
};

const AvatarSelector = ({ 
  avatarType, 
  setAvatarType, 
  theme,
  customUrl = "",
  setCustomUrl = () => {},
  uploadedUrl = "",
  setUploadedUrl = () => {}
}: AvatarSelectorProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload file to Supabase Storage
      const fileName = `ai_avatar_${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setUploadedUrl(urlData.publicUrl);
      setAvatarType('uploaded');
      toast.success('Avatar uploaded successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Avatar</Label>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center justify-center">
          {getAvatarPreview(avatarType, theme, customUrl, uploadedUrl)}
        </div>
        <div className="flex-1 space-y-2">
          <RadioGroup 
            value={avatarType}
            onValueChange={setAvatarType}
            className="grid grid-cols-2 gap-2"
          >
            {avatarOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={`avatar-${option.id}`} />
                <Label htmlFor={`avatar-${option.id}`} className="flex items-center gap-2">
                  {option.icon && <span>{option.icon}</span>}
                  <span>{option.label}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          {avatarType === "custom" && (
            <div className="mt-2">
              <Label htmlFor="custom-avatar">Image URL</Label>
              <Input
                id="custom-avatar"
                placeholder="https://example.com/image.png"
                className="mt-1"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                For a custom avatar, an image URL is required
              </p>
            </div>
          )}

          {avatarType === "uploaded" && (
            <div className="mt-2">
              <Label htmlFor="upload-avatar">Upload Image</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="upload-avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="flex-1"
                />
                {isUploading && <span className="text-xs">Uploading...</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Max file size: 2MB. Recommended dimensions: 256x256px.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector;
