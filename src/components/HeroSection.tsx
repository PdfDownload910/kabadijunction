import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-card rounded-lg shadow-md p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4 leading-tight animate-slide-up">
            Turn Your Scrap Into Cash
          </h1>
          <p className="text-lg text-muted-foreground mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            Join the eco-friendly revolution! Sell your recyclable materials at
            the best prices with convenient doorstep pickup service.
          </p>
          <Button
            variant="hero"
            size="xl"
            onClick={() => navigate("/sell-now")}
            className="animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            Sell Your Scrap Easily & Help Save The Planet
          </Button>
        </div>
        <div className="md:w-1/2 flex justify-center md:justify-end">
          <img
            src={heroImage}
            alt="Eco-friendly recycling service illustration"
            className="rounded-lg shadow-lg max-w-full h-auto animate-scale-in"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;