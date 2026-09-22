import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/useAuth";
import { login as loginRequest } from "@/services/authService";
import type { LoginCredentials } from "@/types/auth.types";

function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function updateField(field: keyof LoginCredentials, value: string): void {
    setCredentials((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await loginRequest(credentials);
      login(response.data.token, response.data.user);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-card">
      <div className="login-brand-lockup">
        <span className="login-emblem" aria-hidden="true">F</span>
        <div>
          <p>FALCORE</p>
          <span>Consumer Goods Trading</span>
        </div>
      </div>
      <Card className="login-panel">
        <CardHeader>
          <CardTitle className="text-2xl text-stone-900">Welcome to Falcore</CardTitle>

          <CardDescription>
            Sign in to continue to your distribution workspace.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="you@falcore.com"
                value={credentials.email}
                onChange={(event) => updateField("email", event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password
              </Label>

              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(event) => updateField("password", event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full">
              {isSubmitting ? "Signing in..." : "Enter workspace"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
