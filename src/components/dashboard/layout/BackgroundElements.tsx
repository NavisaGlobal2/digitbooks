
import React from "react";

const BackgroundElements = () => {
  return (
    <>
      {/* Background decorative elements */}
      <div className="fixed top-0 right-0 w-full h-64 bg-gradient-to-r from-blue-50 to-purple-50 opacity-60 -z-10"></div>
      <div className="fixed top-20 right-20 w-72 h-72 rounded-full bg-gradient-to-br from-green-100 to-blue-100 opacity-20 blur-3xl -z-10"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-100 to-pink-100 opacity-20 blur-3xl -z-10"></div>
    </>
  );
};

export default BackgroundElements;
