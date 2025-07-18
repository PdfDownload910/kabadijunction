import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Check if user is already logged in
    const loggedInUser = JSON.parse(localStorage.getItem("kabadiJunctionUser") || "null");
    if (loggedInUser) {
      navigate("/profile");
    }

    // Create demo user if none exists
    const users = JSON.parse(localStorage.getItem("kabadiJunctionUsers") || "[]");
    if (users.length === 0) {
      const demoUser = {
        id: "demo-user",
        email: "user@kabadijunction.com",
        password: "password123",
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("kabadiJunctionUsers", JSON.stringify([demoUser]));
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      // Login logic
      const users = JSON.parse(localStorage.getItem("kabadiJunctionUsers") || "[]");
      const user = users.find((u: any) => 
        u.email.toLowerCase() === formData.email.toLowerCase() && 
        u.password === formData.password
      );

      if (user) {
        localStorage.setItem("kabadiJunctionUser", JSON.stringify(user));
        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        });
        navigate("/profile");
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password.",
          variant: "destructive",
        });
      }
    } else {
      // Register logic
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match.",
          variant: "destructive",
        });
        return;
      }

      const users = JSON.parse(localStorage.getItem("kabadiJunctionUsers") || "[]");
      const existingUser = users.find((u: any) => u.email.toLowerCase() === formData.email.toLowerCase());

      if (existingUser) {
        toast({
          title: "Error",
          description: "An account with this email already exists.",
          variant: "destructive",
        });
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        email: formData.email,
        password: formData.password,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem("kabadiJunctionUsers", JSON.stringify(users));
      localStorage.setItem("kabadiJunctionUser", JSON.stringify(newUser));

      toast({
        title: "Account created!",
        description: "Your account has been created successfully.",
      });
      navigate("/profile");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>

              {!isLogin && (
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
              )}

              <Button type="submit" variant="hero" className="w-full">
                {isLogin ? "Login" : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <Button
                  variant="link"
                  onClick={() => setIsLogin(!isLogin)}
                  className="p-0 h-auto font-semibold"
                >
                  {isLogin ? "Sign up" : "Login"}
                </Button>
              </p>
            </div>

            {isLogin && (
              <div className="mt-4 p-4 bg-primary-light rounded-lg">
                <p className="text-sm text-center">
                  <strong>Demo Account:</strong><br />
                  Email: user@kabadijunction.com<br />
                  Password: password123
                </p>
              </div>
            )}

            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-primary hover:underline">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;