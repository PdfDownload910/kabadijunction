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
      className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-green hover:scale-105 animate-fade-in"
      onClick={onClick}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={`${name} scrap material`}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="text-xl font-semibold text-foreground mb-1">{name}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
        )}
        <p className="text-primary font-bold text-lg">{price}</p>
      </CardContent>
    </Card>
  );
};

export default ScrapCard;