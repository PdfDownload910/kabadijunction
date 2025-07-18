import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Order } from "@/types";
import { scrapMaterials } from "@/data/scrapMaterials";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = JSON.parse(localStorage.getItem("kabadiJunctionUser") || "null");
    if (!loggedInUser) {
      navigate("/login");
      return;
    }
    setUser(loggedInUser);

    // Load orders
    const allOrders = JSON.parse(localStorage.getItem("kabadiJunctionOrders") || "[]");
    setOrders(allOrders.reverse()); // Show latest first
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("kabadiJunctionUser");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "picked": return "bg-purple-100 text-purple-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getMaterialName = (materialId: string) => {
    const material = scrapMaterials.find(m => m.id === materialId);
    return material ? material.name : materialId;
  };

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
                <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Orders Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                  <Button onClick={() => navigate("/sell-now")}>
                    Schedule Your First Pickup
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="border-l-4 border-l-primary">
                      <CardContent className="pt-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold">Order #{order.id}</span>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Pickup Date: {order.pickupDate} at {order.pickupTime}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Address: {order.address}, {order.landmark}
                            </p>
                            <div className="text-sm">
                              <strong>Materials:</strong>
                              <ul className="ml-4 mt-1">
                                {order.scrapMaterials.map((item, index) => (
                                  <li key={index}>
                                    {getMaterialName(item.materialId)} - {item.quantity} kg @ ₹{item.price}/kg
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <p className="text-sm">
                              <strong>Payment:</strong> {order.paymentMethod}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              ₹{order.totalAmount.toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
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

export default Profile;