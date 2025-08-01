import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import HeroSection from "@/components/HeroSection";
import ScrapCard from "@/components/ScrapCard";
import { supabase } from "@/integrations/supabase/client";
import featuresImage from "@/assets/features-image.jpg";

const Home = () => {
  const navigate = useNavigate();
  const [scrapMaterials, setScrapMaterials] = useState<any[]>([]);

  useEffect(() => {
    const fetchScrapMaterials = async () => {
      const { data, error } = await supabase
        .from('scrap_materials')
        .select('*')
        .eq('is_active', true)
        .limit(4);
      
      if (data && !error) {
        setScrapMaterials(data);
      }
    };

    fetchScrapMaterials();
  }, []);

  const mainCategories = scrapMaterials; // Show first 4 categories from database

  const handleScrapCardClick = (materialId: string) => {
    navigate(`/sell-now?material=${materialId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        {/* Hero Section */}
        <HeroSection />

        {/* Features Section */}
        <section className="bg-card rounded-lg shadow-md p-8 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="md:w-1/2 flex justify-center md:justify-start">
              <img
                src={featuresImage}
                alt="KabadiJunction connecting users with trusted pickup agents"
                className="rounded-lg shadow-md max-w-full h-auto"
              />
            </div>
            <div className="md:w-1/2 text-center md:text-left">
              <h2 className="text-3xl font-bold text-primary mb-4">
                Trusted & Convenient
              </h2>
              <p className="text-lg text-muted-foreground">
                KabadiJunction connects you with trusted pickup agents to recycle your scrap
                responsibly. Schedule pickups, check live prices, and track your orders
                all in one place.
              </p>
            </div>
          </div>
        </section>

        {/* Scrap Categories Section */}
        <section className="animate-fade-in">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">
            Scrap Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {mainCategories.map((material, index) => (
              <div
                key={material.id}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ScrapCard
                  name={material.name}
                  price={`₹${material.price} / ${material.unit}`}
                  image={material.image_url || "/placeholder.svg"}
                  category={material.category}
                  description={material.description}
                  onClick={() => handleScrapCardClick(material.id)}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;