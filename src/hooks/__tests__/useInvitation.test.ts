
import { renderHook, act } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useInvitation } from "@/hooks/useInvitation";

// Mock dependencies
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      signUp: jest.fn(),
    },
    rpc: jest.fn(),
  },
}));

describe("useInvitation", () => {
  const mockNavigate = jest.fn();
  const mockToken = "valid-token";
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    
    // Mock supabase.from().select().eq().single()
    const mockSingle = jest.fn().mockResolvedValue({
      data: {
        email: "test@example.com",
        name: "Test User",
        role: "Member",
        status: "pending"
      },
      error: null
    });
    
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    
    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect
    });
    
    // Mock setTimeout
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it("validates token on mount", async () => {
    const { result } = renderHook(() => useInvitation(mockToken));
    
    // Wait for effect to run
    await act(async () => {
      await Promise.resolve();
    });
    
    expect(supabase.from).toHaveBeenCalledWith("team_invitations");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isValid).toBe(true);
    expect(result.current.invitation).toEqual({
      email: "test@example.com",
      name: "Test User",
      role: "Member"
    });
  });
  
  it("handles invalid token", async () => {
    // Mock invalid token response
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { message: "Record not found" }
    });
    
    const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    
    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect
    });
    
    const { result } = renderHook(() => useInvitation(mockToken));
    
    // Wait for effect to run
    await act(async () => {
      await Promise.resolve();
    });
    
    expect(toast.error).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/auth");
    expect(result.current.isValid).toBe(false);
  });
  
  it("handles null token", async () => {
    const { result } = renderHook(() => useInvitation(null));
    
    // Wait for effect to run
    await act(async () => {
      await Promise.resolve();
    });
    
    expect(toast.error).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/auth");
  });
  
  it("registers account successfully", async () => {
    // Mock successful sign up
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: { id: "user-id" } },
      error: null
    });
    
    // Mock successful invitation acceptance
    (supabase.rpc as jest.Mock).mockResolvedValue({
      error: null
    });
    
    const { result } = renderHook(() => useInvitation(mockToken));
    
    // Wait for effect to run
    await act(async () => {
      await Promise.resolve();
    });
    
    // Register account
    await act(async () => {
      await result.current.registerAccount("password123");
    });
    
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
      options: {
        data: {
          name: "Test User",
          onboardingCompleted: true
        }
      }
    });
    
    expect(supabase.rpc).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
    
    // Fast-forward timers
    act(() => {
      jest.runAllTimers();
    });
    
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });
  
  it("handles registration error", async () => {
    // Mock sign up error
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: "Error registering account" }
    });
    
    const { result } = renderHook(() => useInvitation(mockToken));
    
    // Wait for effect to run
    await act(async () => {
      await Promise.resolve();
    });
    
    // Register account
    await act(async () => {
      await result.current.registerAccount("password123");
    });
    
    expect(toast.error).toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
  });
  
  it("handles already registered error", async () => {
    // Mock already registered error
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: "User already registered" }
    });
    
    const { result } = renderHook(() => useInvitation(mockToken));
    
    // Wait for effect to run
    await act(async () => {
      await Promise.resolve();
    });
    
    // Register account
    await act(async () => {
      await result.current.registerAccount("password123");
    });
    
    expect(toast.error).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/auth");
  });
  
  it("accepts invitation successfully", async () => {
    // Mock successful invitation acceptance
    (supabase.rpc as jest.Mock).mockResolvedValue({
      error: null
    });
    
    const { result } = renderHook(() => useInvitation(mockToken));
    
    // Wait for effect to run
    await act(async () => {
      await Promise.resolve();
    });
    
    // Accept invitation
    await act(async () => {
      await result.current.acceptInvitation();
    });
    
    expect(supabase.rpc).toHaveBeenCalledWith('accept_team_invitation', {
      p_token: mockToken
    });
    
    expect(toast.success).toHaveBeenCalled();
    
    // Fast-forward timers
    act(() => {
      jest.runAllTimers();
    });
    
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });
  
  it("handles invitation acceptance error", async () => {
    // Mock invitation acceptance error
    (supabase.rpc as jest.Mock).mockResolvedValue({
      error: { message: "Error accepting invitation" }
    });
    
    const { result } = renderHook(() => useInvitation(mockToken));
    
    // Wait for effect to run
    await act(async () => {
      await Promise.resolve();
    });
    
    // Accept invitation
    await act(async () => {
      await result.current.acceptInvitation();
    });
    
    expect(toast.error).toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
  });
});
