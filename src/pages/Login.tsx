import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    referralCode: "",
  });

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          navigate("/profile");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        navigate("/profile");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (showForgotPassword) {
        // Forgot password logic
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Reset email sent!",
            description: "Please check your email for password reset instructions.",
          });
          setShowForgotPassword(false);
        }
      } else if (isLogin) {
        // Login logic
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have been successfully logged in.",
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

        const redirectUrl = `${window.location.origin}/reset-password`;
        
        // Validate referral code if provided
        let referrerUserId = null;
        if (formData.referralCode.trim()) {
          console.log('Validating referral code:', formData.referralCode.trim());
          
          if (formData.referralCode === 'HARSH21') {
            // Special admin referral code - no specific referrer
            referrerUserId = 'admin';
            console.log('Using admin referral code');
          } else {
            // Check if referral code exists
            console.log('Checking referral code in database...');
            const { data: referralCodeData, error: referralError } = await supabase
              .from('referral_codes')
              .select('user_id')
              .eq('code', formData.referralCode.trim())
              .eq('is_active', true)
              .single();

            console.log('Referral code query result:', { referralCodeData, referralError });

            if (referralError || !referralCodeData) {
              console.log('Referral code validation failed:', referralError);
              toast({
                title: "Invalid referral code",
                description: "The referral code you entered is not valid.",
                variant: "destructive",
              });
              return;
            }
            referrerUserId = referralCodeData.user_id;
            console.log('Referral code validated, referrer user ID:', referrerUserId);
          }
        }

        const { data: authData, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: formData.fullName,
              referral_code_used: formData.referralCode.trim() || null,
            }
          }
        });

        if (error) {
          toast({
            title: "Registration failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          // Store referral relationship if applicable
          if (referrerUserId && authData.user && formData.referralCode.trim()) {
            setTimeout(() => {
              supabase
                .from('referrals')
                .insert({
                  referrer_user_id: referrerUserId === 'admin' ? null : referrerUserId,
                  referred_user_id: authData.user!.id,
                  referral_code: formData.referralCode.trim(),
                  status: 'pending'
                })
                .then(({ error: referralError }) => {
                  if (referralError) {
                    console.error('Error creating referral:', referralError);
                  }
                });
            }, 1000);
          }

          toast({
            title: "Account created!",
            description: formData.referralCode ? 
              "Please check your email to verify your account. Your referral has been recorded!" :
              "Please check your email to verify your account.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {showForgotPassword ? "Reset Password" : (isLogin ? "Welcome Back" : "Create Account")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && !showForgotPassword && (
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                  />
                </div>
              )}
              
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
              
              {!showForgotPassword && (
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
              )}

              {!isLogin && !showForgotPassword && (
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

              {!isLogin && !showForgotPassword && (
                <div>
                  <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                  <Input
                    id="referralCode"
                    type="text"
                    placeholder="Enter HARSH21 or a friend's code"
                    value={formData.referralCode}
                    onChange={(e) => setFormData({...formData, referralCode: e.target.value.toUpperCase()})}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Have a referral code? Enter it to give your friend ₹21 when you sell 20kg of scrap!
                  </p>
                </div>
              )}

              <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                {loading ? "Please wait..." : (showForgotPassword ? "Send Reset Email" : (isLogin ? "Login" : "Create Account"))}
              </Button>
            </form>

            {isLogin && !showForgotPassword && (
              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => setShowForgotPassword(true)}
                  className="p-0 h-auto text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </Button>
              </div>
            )}

            {!showForgotPassword && (
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
            )}

            {showForgotPassword && (
              <div className="mt-6 text-center">
                <Button
                  variant="link"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setFormData({...formData, email: "", password: ""});
                  }}
                  className="p-0 h-auto text-sm text-primary hover:underline"
                >
                  ← Back to Login
                </Button>
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