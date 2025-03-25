
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const BusinessGreeting = () => {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState("");
  
  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('business_name')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }
        
        if (data && data.business_name) {
          setBusinessName(data.business_name);
        }
      } catch (error) {
        console.error("Error fetching business profile:", error);
      }
    };
    
    fetchBusinessProfile();
  }, [user]);
  
  // Truncate business name for smaller screens
  const truncatedBusinessName = businessName && businessName.length > 15 
    ? `${businessName.substring(0, 15)}...` 
    : businessName;
  
  return (
    <h1 className="text-base sm:text-xl font-bold ml-10 md:ml-0 truncate">
      {businessName ? 
        <span className="hidden sm:inline">{`Hi ${businessName}, let's get organized`}</span> :
        <span className="hidden sm:inline">Welcome, let's get organized</span>
      }
      {businessName ? 
        <span className="sm:hidden">{`Hi ${truncatedBusinessName}`}</span> :
        <span className="sm:hidden">Welcome</span>
      }
    </h1>
  );
};

export default BusinessGreeting;
