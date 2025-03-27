
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegistrationForm from "../RegistrationForm";
import { toast } from "sonner";

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe("RegistrationForm", () => {
  const mockInvitation = {
    email: "test@example.com",
    name: "Test User",
    role: "Member",
  };
  
  const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it("renders invitation details", () => {
    render(
      <RegistrationForm 
        invitation={mockInvitation}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );
    
    expect(screen.getByText(/You've been invited as:/i)).toBeInTheDocument();
    expect(screen.getByText("Member")).toBeInTheDocument();
    expect(screen.getByText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });
  
  it("shows error when passwords don't match", async () => {
    render(
      <RegistrationForm 
        invitation={mockInvitation}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );
    
    const passwordInput = screen.getByLabelText(/Create Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "password456" } });
    
    const submitButton = screen.getByRole("button", { name: /Accept Invitation & Create Account/i });
    fireEvent.click(submitButton);
    
    expect(toast.error).toHaveBeenCalledWith("Passwords do not match");
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  it("shows error when password is too short", async () => {
    render(
      <RegistrationForm 
        invitation={mockInvitation}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );
    
    const passwordInput = screen.getByLabelText(/Create Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    
    fireEvent.change(passwordInput, { target: { value: "12345" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "12345" } });
    
    const submitButton = screen.getByRole("button", { name: /Accept Invitation & Create Account/i });
    fireEvent.click(submitButton);
    
    expect(toast.error).toHaveBeenCalledWith("Password must be at least 6 characters");
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  it("calls onSubmit with password when form is valid", async () => {
    render(
      <RegistrationForm 
        invitation={mockInvitation}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );
    
    const passwordInput = screen.getByLabelText(/Create Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });
    
    const submitButton = screen.getByRole("button", { name: /Accept Invitation & Create Account/i });
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith("password123");
  });
  
  it("disables form when isSubmitting is true", () => {
    render(
      <RegistrationForm 
        invitation={mockInvitation}
        onSubmit={mockOnSubmit}
        isSubmitting={true}
      />
    );
    
    const passwordInput = screen.getByLabelText(/Create Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByRole("button", { name: /Creating Account.../i });
    
    expect(passwordInput).toBeDisabled();
    expect(confirmPasswordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });
});
