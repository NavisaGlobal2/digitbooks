
import React from "react";
import { render, screen } from "@testing-library/react";
import AcceptingInvitation from "../AcceptingInvitation";

describe("AcceptingInvitation", () => {
  it("renders accepting message", () => {
    render(<AcceptingInvitation />);
    
    expect(screen.getByText("Accepting Invitation")).toBeInTheDocument();
    expect(screen.getByText("You're already signed in with the correct account. Finalizing your team membership...")).toBeInTheDocument();
  });
  
  it("renders loading spinner", () => {
    render(<AcceptingInvitation />);
    
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });
});
