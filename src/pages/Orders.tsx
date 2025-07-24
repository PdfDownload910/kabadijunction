import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

const Orders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [scrapMaterials, setScrapMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/login");
        } else {
          fetchAllOrders();
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
        fetchAllOrders();
      }
    });

    // Fetch scrap materials
    fetchScrapMaterials();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchAllOrders = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch only the current user's orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            scrap_materials (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        toast({
          title: "Error",
          description: "Failed to fetch your orders.",
          variant: "destructive",
        });
      } else {
        setOrders(ordersData || []);
      }
    } catch (error) {
      console.error('Error fetching orders data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders data.",
        variant: "destructive",
      });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
        <div className="text-center">
          <p>Loading orders...</p>
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
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>My Orders</span>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => navigate("/")}>
                    Back to Home
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                View your orders and their current status.
              </p>
            </CardContent>
          </Card>

          {/* Orders Section */}
          <Card>
            <CardHeader>
              <CardTitle>My Orders ({orders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                  <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="border-l-4 border-l-primary">
                      <CardContent className="pt-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold">Order #{order.id.slice(0, 8)}</span>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm">
                              <strong>Customer:</strong> {order.customer_name}
                            </p>
                            <p className="text-sm">
                              <strong>Phone:</strong> {order.phone}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Pickup Date: {order.pickup_date} at {order.pickup_time}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Address: {order.address}, {order.landmark}
                            </p>
                            <div className="text-sm">
                              <strong>Materials:</strong>
                              <ul className="ml-4 mt-1">
                                {order.order_items?.map((item: any, index: number) => (
                                  <li key={index}>
                                    {item.scrap_materials?.name || 'Unknown'} - {item.quantity} kg @ ₹{item.unit_price}/kg
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <p className="text-sm">
                              <strong>Payment:</strong> {order.payment_method.replace('_', ' ').toUpperCase()}
                            </p>
                            {order.notes && (
                              <p className="text-sm">
                                <strong>Notes:</strong> {order.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right space-y-2">
                            <p className="text-2xl font-bold text-primary">
                              ₹{parseFloat(order.total_amount).toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Orders;