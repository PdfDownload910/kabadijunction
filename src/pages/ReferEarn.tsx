import { useState, useEffect } from "react";
import { Copy, Share2, Facebook, Instagram, MessageCircle, ExternalLink, Gift, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import referEarnImage from "@/assets/refer-earn-image.jpg";

interface ReferralData {
  userCode: string;
  pendingReferrals: number;
  successfulReferrals: number;
  totalEarnings: number;
}

const ReferEarn = () => {
  const [referralData, setReferralData] = useState<ReferralData>({
    userCode: "",
    pendingReferrals: 0,
    successfulReferrals: 0,
    totalEarnings: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's referral code
      const { data: codeData } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', user.id)
        .single();

      // Get referral statistics
      const { data: referrals } = await supabase
        .from('referrals')
        .select('status, reward_amount')
        .eq('referrer_user_id', user.id);

      const pending = referrals?.filter(r => r.status === 'pending').length || 0;
      const successful = referrals?.filter(r => r.status === 'completed').length || 0;
      const totalEarnings = referrals?.filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.reward_amount || 0), 0) || 0;

      setReferralData({
        userCode: codeData?.code || '',
        pendingReferrals: pending,
        successfulReferrals: successful,
        totalEarnings
      });
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  const shareToSocial = (platform: string) => {
    const message = `Join KabadiJunction using my referral code ${referralData.userCode} and earn ₹21 when you sell 20kg of scrap! 🌱♻️`;
    const url = `${window.location.origin}?ref=${referralData.userCode}`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`;
        break;
      case 'instagram':
        copyToClipboard(message + ' ' + url);
        toast({
          title: "Text copied!",
          description: "Share this on your Instagram story or post",
        });
        return;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`;
        break;
      default:
        copyToClipboard(url);
        return;
    }
    
    window.open(shareUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your referral data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="relative mx-auto mb-6 max-w-2xl">
            <img 
              src={referEarnImage} 
              alt="Refer and Earn" 
              className="w-full h-64 object-cover rounded-xl shadow-lg"
            />
            <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
              <div className="text-center text-white">
                <Gift className="h-12 w-12 mx-auto mb-4" />
                <h1 className="text-3xl md:text-5xl font-bold mb-2">Refer & Earn</h1>
              </div>
            </div>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Refer a friend and earn <span className="font-bold text-primary">₹21</span> for every successful referral when they sell 20kg of scrap!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-blue-900">₹{referralData.totalEarnings}</div>
                <p className="text-blue-600 text-sm">Total Earnings</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-green-900">{referralData.successfulReferrals}</div>
                <p className="text-green-600 text-sm">Successful Referrals</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6 text-center">
                <Gift className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-orange-900">{referralData.pendingReferrals}</div>
                <p className="text-orange-600 text-sm">Pending Referrals</p>
              </CardContent>
            </Card>
          </div>

          {/* Your Referral Code */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Your Referral Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="referral-code">Share this code with friends</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="referral-code"
                    value={referralData.userCode}
                    readOnly
                    className="font-mono text-lg"
                  />
                  <Button
                    onClick={() => copyToClipboard(referralData.userCode)}
                    variant="outline"
                    size="icon"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Share on Social Media</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    onClick={() => shareToSocial('whatsapp')}
                    variant="outline"
                    className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button
                    onClick={() => shareToSocial('facebook')}
                    variant="outline"
                    className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                  >
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </Button>
                  <Button
                    onClick={() => shareToSocial('instagram')}
                    variant="outline"
                    className="bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
                  >
                    <Instagram className="h-4 w-4 mr-2" />
                    Instagram
                  </Button>
                  <Button
                    onClick={() => shareToSocial('twitter')}
                    variant="outline"
                    className="bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How it Works */}
          <Card>
            <CardHeader>
              <CardTitle>How it Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">1</Badge>
                <div>
                  <h4 className="font-medium">Share your code</h4>
                  <p className="text-sm text-muted-foreground">Send your referral code to friends</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">2</Badge>
                <div>
                  <h4 className="font-medium">Friend signs up</h4>
                  <p className="text-sm text-muted-foreground">They use your code during registration</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">3</Badge>
                <div>
                  <h4 className="font-medium">They sell 20kg scrap</h4>
                  <p className="text-sm text-muted-foreground">Minimum 20kg sale to qualify</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">4</Badge>
                <div>
                  <h4 className="font-medium">Earn ₹21</h4>
                  <p className="text-sm text-muted-foreground">Get paid for successful referrals</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Terms */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• You earn ₹21 for each successful referral when they sell minimum 20kg of scrap.</p>
            <p>• Referral reward is credited after the referred user completes their first successful sale.</p>
            <p>• Self-referrals and fake accounts are strictly prohibited.</p>
            <p>• KabadiJunction reserves the right to modify or terminate this program at any time.</p>
            <p>• Earnings will be processed within 1-2 business days after successful referral completion.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReferEarn;