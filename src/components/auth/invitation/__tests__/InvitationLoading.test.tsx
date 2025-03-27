
import React from "react";
import { render, screen } from "@testing-library/react";
import InvitationLoading from "../InvitationLoading";

describe("InvitationLoading", () => {
  it("renders loading message", () => {
    render(<InvitationLoading />);
    
    expect(screen.getByText("Validating invitation...")).toBeInTheDocument();
  });
  
  it("renders loading spinner", () => {
    render(<InvitationLoading />);
    
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });
});
