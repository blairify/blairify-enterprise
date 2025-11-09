"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Logo from "@/components/atoms/logo-blairify";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type AuthMode = "login" | "register";
type RegisterStep = 1 | 2 | 3 | 4;

export default function MultiStepAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("register");
  const [currentStep, setCurrentStep] = useState<RegisterStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Login form data
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Register form data
  const [registerData, setRegisterData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    enterpriseName: "",
    organisationName: "",
  });

  const handleModeSwitch = (newMode: AuthMode) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setMode(newMode);
      setCurrentStep(1);
      setIsTransitioning(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }, 300);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as RegisterStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as RegisterStep);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return (
          registerData.email &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)
        );
      case 2:
        return registerData.name.trim().length > 0;
      case 3:
        return (
          registerData.password.length >= 8 &&
          registerData.password === registerData.confirmPassword
        );
      case 4:
        return true; // Optional fields
      default:
        return false;
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      toast.success("Login successful!");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async () => {
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (registerData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          enterpriseName: registerData.enterpriseName || undefined,
          organisationName: registerData.organisationName || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success("Account created successfully!");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Registration failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = () => {
    if (mode === "login") return "Welcome back";

    switch (currentStep) {
      case 1:
        return "What's your email?";
      case 2:
        return "Tell us your name";
      case 3:
        return "Secure your account";
      case 4:
        return "Company information";
      default:
        return "Create Account";
    }
  };

  const getStepDescription = () => {
    if (mode === "login") {
      return "Sign in to continue your interview preparation journey";
    }

    switch (currentStep) {
      case 1:
        return "Enter your email address to get started";
      case 2:
        return "What should we call you?";
      case 3:
        return "Create a strong password for your account";
      case 4:
        return "Optional: Add your company details";
      default:
        return "Get started with Blairify";
    }
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLoginSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="kisia@gmail.com"
          value={loginData.email}
          onChange={(e) =>
            setLoginData({ ...loginData, email: e.target.value })
          }
          required
          className="bg-input border-border"
          disabled={isLoading}
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
            required
            className="bg-input border-border pr-10"
            disabled={isLoading}
            autoComplete="current-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );

  const renderRegisterStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-email">Email Address</Label>
              <Input
                id="register-email"
                type="email"
                placeholder="Enter your email address"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
                required
                className="bg-input border-border"
                disabled={isLoading}
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-name">Full Name</Label>
              <Input
                id="register-name"
                type="text"
                placeholder="Enter your full name"
                value={registerData.name}
                onChange={(e) =>
                  setRegisterData({ ...registerData, name: e.target.value })
                }
                required
                className="bg-input border-border"
                disabled={isLoading}
                autoComplete="name"
                autoFocus
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <div className="relative">
                <Input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min. 8 characters)"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                  required
                  minLength={8}
                  className="bg-input border-border pr-10"
                  disabled={isLoading}
                  autoComplete="new-password"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-confirm-password">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  className="bg-input border-border pr-10"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {registerData.password &&
                registerData.confirmPassword &&
                registerData.password !== registerData.confirmPassword && (
                  <p className="text-sm text-red-500">Passwords do not match</p>
                )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-enterprise">
                Company Name (Optional)
              </Label>
              <Input
                id="register-enterprise"
                type="text"
                placeholder="Acme Corp"
                value={registerData.enterpriseName}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    enterpriseName: e.target.value,
                  })
                }
                className="bg-input border-border"
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-organisation">
                Team/Department (Optional)
              </Label>
              <Input
                id="register-organisation"
                type="text"
                placeholder="Engineering"
                value={registerData.organisationName}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    organisationName: e.target.value,
                  })
                }
                className="bg-input border-border"
                disabled={isLoading}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Leave blank to use default names
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 items-center">
        {/* Logo - switches sides based on mode */}
        <div
          className={`flex-1 flex items-center justify-center transition-all duration-700 ease-in-out ${
            mode === "login" ? "md:order-1" : "md:order-2"
          }`}
        >
          <Logo variant="stacked" repeatCount={7} />
        </div>

        {/* Auth Card */}
        <div
          className={`w-full max-w-md transition-all duration-700 ease-in-out ${
            mode === "login" ? "md:order-2" : "md:order-1"
          }`}
        >
          <Card className="border-border bg-card">
            <CardHeader className="text-center">
              <div
                className={`transition-all duration-500 ease-in-out ${
                  isTransitioning
                    ? "opacity-0 transform translate-y-2 scale-95"
                    : "opacity-100 transform translate-y-0 scale-100"
                }`}
              >
                <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
                <CardDescription>{getStepDescription()}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-hidden">
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    isTransitioning
                      ? "opacity-0 transform translate-x-4 scale-95"
                      : "opacity-100 transform translate-x-0 scale-100"
                  }`}
                >
                  {mode === "login" ? (
                    <>
                      <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                          <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">
                            OR CONTINUE WITH EMAIL
                          </span>
                        </div>
                      </div>

                      {renderLoginForm()}
                    </>
                  ) : (
                    <>
                      {renderRegisterStep()}

                      <div className="flex justify-between mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={currentStep === 1 || isLoading}
                          className="bg-transparent border border-border text-foreground hover:bg-accent/10"
                        >
                          Previous
                        </Button>

                        {currentStep === 4 ? (
                          <Button
                            onClick={handleRegisterSubmit}
                            disabled={isLoading}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            {isLoading ? "Creating..." : "Create Account"}
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={handleNext}
                            disabled={!canProceedToNextStep() || isLoading}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            Next
                          </Button>
                        )}
                      </div>

                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">
                            OR SIGN UP WITH
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  {mode === "login" ? (
                    <>
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => handleModeSwitch("register")}
                        className="text-primary hover:underline focus:outline-none transition-colors"
                        disabled={isLoading || isTransitioning}
                      >
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => handleModeSwitch("login")}
                        className="text-primary hover:underline focus:outline-none transition-colors"
                        disabled={isLoading || isTransitioning}
                      >
                        Log in
                      </button>
                    </>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
