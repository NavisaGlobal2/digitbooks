
import React from "react";

const DecorativeBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute w-64 h-64 rounded-full bg-white/10 -top-32 -right-32 animate-pulse" />
      <div className="absolute w-96 h-96 rounded-full bg-white/5 -bottom-48 -left-48 animate-pulse [animation-delay:1s]" />
    </div>
  );
};

export default DecorativeBackground;
