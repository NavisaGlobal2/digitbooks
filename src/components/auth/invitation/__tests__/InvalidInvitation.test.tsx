
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import InvalidInvitation from "../InvalidInvitation";
import { MemoryRouter } from "react-router-dom";

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("InvalidInvitation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it("renders error message", () => {
    render(
      <MemoryRouter>
        <InvalidInvitation />
      </MemoryRouter>
    );
    
    expect(screen.getByText("Invalid Invitation")).toBeInTheDocument();
    expect(screen.getByText("This invitation link is invalid or has expired.")).toBeInTheDocument();
  });
  
  it("navigates to auth page when button is clicked", () => {
    render(
      <MemoryRouter>
        <InvalidInvitation />
      </MemoryRouter>
    );
    
    const button = screen.getByText("Go to Login");
    fireEvent.click(button);
    
    expect(mockNavigate).toHaveBeenCalledWith("/auth");
  });
});
