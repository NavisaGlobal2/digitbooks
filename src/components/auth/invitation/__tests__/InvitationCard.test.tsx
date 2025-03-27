
import React from "react";
import { render, screen } from "@testing-library/react";
import InvitationCard from "../InvitationCard";

describe("InvitationCard", () => {
  it("renders title correctly", () => {
    render(
      <InvitationCard title="Test Title">
        <div>Test Content</div>
      </InvitationCard>
    );
    
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });
  
  it("renders subtitle when provided", () => {
    render(
      <InvitationCard title="Test Title" subtitle="Test Subtitle">
        <div>Test Content</div>
      </InvitationCard>
    );
    
    expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
  });
  
  it("renders children correctly", () => {
    render(
      <InvitationCard title="Test Title">
        <div data-testid="test-child">Test Content</div>
      </InvitationCard>
    );
    
    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });
});
