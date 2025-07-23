import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [scrapMaterials, setScrapMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/login");
        } else {
          fetchUserData(session.user.id);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/login");
      } else {
        fetchUserData(session.user.id);
      }
    });

    // Fetch scrap materials
    fetchScrapMaterials();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData);
      }

      // Fetch user orders with order items
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            scrap_materials (*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
      } else {
        setOrders(ordersData || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchScrapMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('scrap_materials')
        .select('*');
      
      if (error) throw error;
      setScrapMaterials(data || []);
    } catch (error) {
      console.error('Error fetching scrap materials:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ));

      toast({
        title: "Order Updated",
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "picked": return "bg-purple-100 text-purple-800";
      case "completed": return "bg-green-100 text-green-800";
      case "success": return "bg-emerald-100 text-emerald-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getMaterialName = (materialId: string) => {
    const material = scrapMaterials.find(m => m.id === materialId);
    return material ? material.name : materialId;
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    
    try {
      const { error } = await supabase.functions.invoke('contact-message', {
        body: {
          name: contactForm.name,
          email: contactForm.email,
          message: contactForm.message
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Message sent!",
          description: "Thank you for your message. We'll get back to you soon.",
        });
        
        setContactForm({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setContactLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: ["+91 9102646660", "+91 6203879860"],
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@kabadijunction.com", "support@kabadijunction.com"],
    },
    {
      icon: MapPin,
      title: "Address",
      details: ["Chhoti Keshopur", "Jamalpur"],
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Mon - Sat: 9:00 AM - 6:00 PM", "Sunday: 10:00 AM - 4:00 PM"],
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in space-y-8">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Profile</span>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => navigate("/")}>
                    Back to Home
                  </Button>
                  <Button variant="destructive" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Email:</strong> {user.email}</p>
                {profile?.full_name && <p><strong>Name:</strong> {profile.full_name}</p>}
                {profile?.phone && <p><strong>Phone:</strong> {profile.phone}</p>}
                <p><strong>Member since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>


          {/* Contact Us Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Have questions about our scrap collection service? We're here to help!
                  Reach out to us through any of the following channels.
                </p>
                
                <div className="space-y-4">
                  {contactInfo.map((info, index) => {
                    const IconComponent = info.icon;
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <IconComponent className="h-5 w-5 text-primary mt-1" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{info.title}</h3>
                          {info.details.map((detail, detailIndex) => (
                            <p key={detailIndex} className="text-sm text-muted-foreground">
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      rows={6}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      required
                    />
                  </div>

                  <Button type="submit" variant="hero" className="w-full" disabled={contactLoading}>
                    {contactLoading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;