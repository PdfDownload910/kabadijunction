import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

const paymentMethods = [
  {
    id: "upi",
    name: "UPI Payment",
    description: "Pay using UPI ID",
    requiresDetails: true,
    detailsType: "upi",
  },
  {
    id: "cash",
    name: "Cash on Pickup",
    description: "Pay cash when we collect your scrap",
    requiresDetails: false,
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    description: "NEFT/IMPS transfer to your account",
    requiresDetails: true,
    detailsType: "bank",
  },
];

const SellNow = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [scrapMaterials, setScrapMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<{ materialId: string; quantity: number }[]>([]);
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    address: "",
    landmark: "",
    ward: "",
    pickupDate: "",
    pickupTime: "",
    paymentMethod: "",
    paymentDetails: {
      upiId: "",
      bankAccount: "",
    },
  });

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Fetch scrap materials
    fetchScrapMaterials();

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const materialParam = searchParams.get("material");
    if (materialParam && scrapMaterials.find(m => m.id === materialParam)) {
      setSelectedMaterials([{ materialId: materialParam, quantity: 0 }]);
    }
  }, [searchParams, scrapMaterials]);

  const fetchScrapMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('scrap_materials')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setScrapMaterials(data || []);
    } catch (error) {
      console.error('Error fetching scrap materials:', error);
      toast({
        title: "Error",
        description: "Failed to load scrap materials. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  const addMaterial = () => {
    setSelectedMaterials([...selectedMaterials, { materialId: "", quantity: 0 }]);
  };

  const removeMaterial = (index: number) => {
    setSelectedMaterials(selectedMaterials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, materialId: string, quantity: number) => {
    const updated = [...selectedMaterials];
    updated[index] = { materialId, quantity };
    setSelectedMaterials(updated);
  };

  const calculateTotal = () => {
    return selectedMaterials.reduce((total, item) => {
      const material = scrapMaterials.find(m => m.id === item.materialId);
      return total + (material ? material.price * item.quantity : 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validation
      if (selectedMaterials.length === 0 || selectedMaterials.some(m => !m.materialId || m.quantity <= 0)) {
        toast({
          title: "Error",
          description: "Please select at least one material with valid quantity.",
          variant: "destructive",
        });
        return;
      }

      const wardNum = parseInt(formData.ward);
      if (isNaN(wardNum) || wardNum < 1 || wardNum > 43) {
        toast({
          title: "Error",
          description: "Ward number must be between 1 and 43.",
          variant: "destructive",
        });
        return;
      }

      // Check minimum quantities
      for (const item of selectedMaterials) {
        const material = scrapMaterials.find(m => m.id === item.materialId);
        if (material && item.quantity < material.min_quantity) {
          toast({
            title: "Error",
            description: `${material.name} minimum quantity is ${material.min_quantity} kg.`,
            variant: "destructive",
          });
          return;
        }
      }

      const totalAmount = calculateTotal();
      
      // Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          customer_name: formData.customerName,
          phone: formData.phone,
          address: formData.address,
          landmark: formData.landmark,
          ward: wardNum,
          pickup_date: formData.pickupDate,
          pickup_time: formData.pickupTime,
          total_amount: totalAmount,
          payment_method: formData.paymentMethod,
          payment_details: formData.paymentDetails,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = selectedMaterials.map(item => {
        const material = scrapMaterials.find(m => m.id === item.materialId)!;
        return {
          order_id: orderData.id,
          scrap_material_id: item.materialId,
          quantity: item.quantity,
          unit_price: material.price,
          total_price: material.price * item.quantity,
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Success!",
        description: "Your pickup has been scheduled successfully. We will contact you soon.",
      });

      navigate("/");
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPaymentMethod = paymentMethods.find(pm => pm.id === formData.paymentMethod);

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-primary mb-8 text-center">
            Schedule a Pickup
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle>Pickup Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Pickup Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="landmark">Landmark *</Label>
                    <Input
                      id="landmark"
                      value={formData.landmark}
                      onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ward">Ward No. (1-43) *</Label>
                    <Input
                      id="ward"
                      type="number"
                      min="1"
                      max="43"
                      value={formData.ward}
                      onChange={(e) => setFormData({...formData, ward: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pickup Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Pickup Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pickupDate">Pickup Date *</Label>
                    <Input
                      id="pickupDate"
                      type="date"
                      value={formData.pickupDate}
                      onChange={(e) => setFormData({...formData, pickupDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pickupTime">Pickup Time *</Label>
                    <Select
                      value={formData.pickupTime}
                      onValueChange={(value) => setFormData({...formData, pickupTime: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pickup time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09:00-11:00">9:00 AM - 11:00 AM</SelectItem>
                        <SelectItem value="11:00-13:00">11:00 AM - 1:00 PM</SelectItem>
                        <SelectItem value="13:00-15:00">1:00 PM - 3:00 PM</SelectItem>
                        <SelectItem value="15:00-17:00">3:00 PM - 5:00 PM</SelectItem>
                        <SelectItem value="17:00-19:00">5:00 PM - 7:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scrap Materials */}
            <Card>
              <CardHeader>
                <CardTitle>Scrap Materials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedMaterials.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <Select
                      value={item.materialId}
                      onValueChange={(value) => updateMaterial(index, value, item.quantity)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {scrapMaterials.map((material) => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.name} - ₹{material.price}/{material.unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Quantity (kg)"
                      step="0.1"
                      min="0"
                      value={item.quantity || ""}
                      onChange={(e) => updateMaterial(index, item.materialId, parseFloat(e.target.value) || 0)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeMaterial(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addMaterial}>
                  Add Material
                </Button>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({...formData, paymentMethod: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name} - {method.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedPaymentMethod?.requiresDetails && (
                  <div>
                    {selectedPaymentMethod.detailsType === "upi" && (
                      <div>
                        <Label htmlFor="upiId">UPI ID *</Label>
                        <Input
                          id="upiId"
                          placeholder="your-upi-id@bank"
                          value={formData.paymentDetails.upiId}
                          onChange={(e) => setFormData({
                            ...formData,
                            paymentDetails: { ...formData.paymentDetails, upiId: e.target.value }
                          })}
                          required
                        />
                      </div>
                    )}
                    {selectedPaymentMethod.detailsType === "bank" && (
                      <div>
                        <Label htmlFor="bankAccount">Bank Account Details *</Label>
                        <Textarea
                          id="bankAccount"
                          placeholder="Account Number, IFSC Code, Account Holder Name"
                          value={formData.paymentDetails.bankAccount}
                          onChange={(e) => setFormData({
                            ...formData,
                            paymentDetails: { ...formData.paymentDetails, bankAccount: e.target.value }
                          })}
                          required
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Total Amount */}
            {selectedMaterials.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      Total Amount: ₹{calculateTotal().toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? "Processing..." : "Schedule Pickup"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellNow;