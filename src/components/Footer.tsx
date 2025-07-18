import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import logoImage from "@/assets/logo.jpg";

const Footer = () => {
  const socialLinks = [
    { name: "Facebook", href: "https://facebook.com", icon: Facebook },
    { name: "Instagram", href: "https://instagram.com", icon: Instagram },
    { name: "Twitter", href: "https://twitter.com", icon: Twitter },
    { name: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  ];

  return (
    <footer className="bg-background border-t border-border py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <img src={logoImage} alt="KabadiJunction Logo" className="h-8 w-8 rounded" />
            <span className="text-xl font-bold text-primary select-none">
              KabadiJunction
            </span>
          </div>

          {/* Social Media Links */}
          <div className="flex space-x-6">
            {socialLinks.map((social) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 transform hover:scale-110"
                  aria-label={social.name}
                >
                  <IconComponent className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2023 KabadiJunction. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;