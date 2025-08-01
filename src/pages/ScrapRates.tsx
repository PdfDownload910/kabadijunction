import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ScrapCard from "@/components/ScrapCard";
import { supabase } from "@/integrations/supabase/client";

const ScrapRates = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [scrapMaterials, setScrapMaterials] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchScrapMaterials = async () => {
      const { data, error } = await supabase
        .from('scrap_materials')
        .select('*')
        .eq('is_active', true);
      
      if (data && !error) {
        setScrapMaterials(data);
        
        // Extract unique categories from materials
        const uniqueCategories = [...new Set(data.map(material => material.category))];
        const categoryOptions = [
          { id: 'all', name: 'All Categories' },
          ...uniqueCategories.map(cat => ({ id: cat, name: cat.charAt(0).toUpperCase() + cat.slice(1) }))
        ];
        setCategories(categoryOptions);
      }
    };

    fetchScrapMaterials();
  }, []);

  const filteredAndSortedMaterials = useMemo(() => {
    let filtered = scrapMaterials;

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((material) => material.category === categoryFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((material) =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort materials
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "rate-asc":
          return a.price - b.price;
        case "rate-desc":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return sorted;
  }, [searchTerm, categoryFilter, sortBy, scrapMaterials]);

  const handleScrapCardClick = (materialId: string) => {
    navigate(`/sell-now?material=${materialId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Mobile-optimized container with safe area padding */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="animate-fade-in">
          {/* Mobile-optimized heading */}
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-6 sm:mb-8 text-center px-2">
            Scrap Materials & Rates
          </h1>

          {/* Mobile-first search and filter controls */}
          <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-0 sm:max-w-4xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-4">
            {/* Search input - full width on mobile */}
            <div className="w-full">
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 sm:h-10 text-base sm:text-sm"
              />
            </div>
            
            {/* Filter controls - stacked on mobile, side by side on tablet+ */}
            <div className="grid grid-cols-2 gap-3 sm:contents">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-base sm:text-sm">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default" className="text-base sm:text-sm">Default</SelectItem>
                  <SelectItem value="name-asc" className="text-base sm:text-sm">A to Z</SelectItem>
                  <SelectItem value="name-desc" className="text-base sm:text-sm">Z to A</SelectItem>
                  <SelectItem value="rate-asc" className="text-base sm:text-sm">Price: Low</SelectItem>
                  <SelectItem value="rate-desc" className="text-base sm:text-sm">Price: High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mobile-optimized materials grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {filteredAndSortedMaterials.map((material, index) => (
              <div
                key={material.id}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
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

          {/* Mobile-optimized empty state */}
          {filteredAndSortedMaterials.length === 0 && (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="max-w-md mx-auto">
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                  No scrap materials found matching your criteria.
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  Try adjusting your search or filter settings.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScrapRates;