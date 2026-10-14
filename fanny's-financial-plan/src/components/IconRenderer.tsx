import React from 'react';
import {
  CreditCard,
  Banknote,
  Smartphone,
  Wallet as WalletIcon,
  Utensils,
  ShoppingBag,
  Car,
  Zap,
  Home,
  Sparkles,
  HeartPulse,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  Coins,
  Plane,
  ShieldCheck,
  Coffee,
  BookOpen,
  DollarSign,
  ArrowRightLeft,
  Calendar,
  Layers,
  LucideProps,
} from 'lucide-react';

interface IconRendererProps extends LucideProps {
  name: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, ...props }) => {
  switch (name) {
    case 'CreditCard':
      return <CreditCard {...props} />;
    case 'Banknote':
      return <Banknote {...props} />;
    case 'Smartphone':
      return <Smartphone {...props} />;
    case 'Wallet':
    case 'wallet':
      return <WalletIcon {...props} />;
    case 'Utensils':
      return <Utensils {...props} />;
    case 'ShoppingBag':
      return <ShoppingBag {...props} />;
    case 'Car':
      return <Car {...props} />;
    case 'Zap':
      return <Zap {...props} />;
    case 'Home':
      return <Home {...props} />;
    case 'Sparkles':
      return <Sparkles {...props} />;
    case 'HeartPulse':
      return <HeartPulse {...props} />;
    case 'Briefcase':
      return <Briefcase {...props} />;
    case 'Laptop':
      return <Laptop {...props} />;
    case 'TrendingUp':
      return <TrendingUp {...props} />;
    case 'Gift':
      return <Gift {...props} />;
    case 'Coins':
      return <Coins {...props} />;
    case 'Plane':
      return <Plane {...props} />;
    case 'ShieldCheck':
      return <ShieldCheck {...props} />;
    case 'Coffee':
      return <Coffee {...props} />;
    case 'BookOpen':
      return <BookOpen {...props} />;
    case 'ArrowRightLeft':
      return <ArrowRightLeft {...props} />;
    case 'Calendar':
      return <Calendar {...props} />;
    case 'Layers':
      return <Layers {...props} />;
    default:
      return <DollarSign {...props} />;
  }
};
