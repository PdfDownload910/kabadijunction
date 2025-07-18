import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ScrapCard from "@/components/ScrapCard";
import { scrapMaterials, scrapCategories } from "@/data/scrapMaterials";

const ScrapRates = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

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
  }, [searchTerm, categoryFilter, sortBy]);

  const handleScrapCardClick = (materialId: string) => {
    navigate(`/sell-now?material=${materialId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-primary mb-8 text-center">
            Scrap Materials & Rates
          </h1>

          {/* Search and Filter Controls */}
          <div className="max-w-4xl mx-auto mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              placeholder="Search scrap materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {scrapCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Sort by Default</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
                <SelectItem value="rate-asc">Rate: Low to High</SelectItem>
                <SelectItem value="rate-desc">Rate: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scrap Materials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedMaterials.map((material, index) => (
              <div
                key={material.id}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ScrapCard
                  name={material.name}
                  price={`₹${material.price} / ${material.unit}`}
                  image={material.image}
                  category={material.category}
                  description={material.description}
                  onClick={() => handleScrapCardClick(material.id)}
                />
              </div>
            ))}
          </div>

          {filteredAndSortedMaterials.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No scrap materials found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScrapRates;