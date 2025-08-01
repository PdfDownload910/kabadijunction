import { Card, CardContent } from "./ui/card";

interface ScrapCardProps {
  name: string;
  price: string;
  image: string;
  category: string;
  description?: string;
  onClick?: () => void;
}

const ScrapCard = ({ name, price, image, category, description, onClick }: ScrapCardProps) => {
  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-green active:scale-95 hover:scale-105 animate-fade-in touch-manipulation"
      onClick={onClick}
    >
      {/* Mobile-optimized image container */}
      <div className="aspect-[4/3] overflow-hidden relative">
        <img
          src={image}
          alt={`${name} scrap material`}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          loading="lazy"
        />
        {/* Category badge for mobile */}
        <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-md backdrop-blur-sm">
          {category}
        </div>
      </div>
      
      {/* Mobile-optimized content */}
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground leading-tight line-clamp-2">
            {name}
          </h3>
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {description}
            </p>
          )}
          <div className="pt-1">
            <p className="text-primary font-bold text-base sm:text-lg">
              {price}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScrapCard;