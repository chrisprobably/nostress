import React, { useState } from 'react';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { ChevronLeft, Check, Briefcase, Heart, DollarSign, Home, Users, Gamepad2 } from 'lucide-react';

interface WatchCategoryTaggerProps {
  onCategorySelected: (category: string, subcategory?: string) => void;
  onBack: () => void;
}

interface Category {
  name: string;
  icon: React.ReactNode;
  color: string;
  subcategories?: string[];
}

const categories: Category[] = [
  {
    name: 'Work/School',
    icon: <Briefcase className="w-4 h-4" />,
    color: 'text-blue-400'
  },
  {
    name: 'Family',
    icon: <Home className="w-4 h-4" />,
    color: 'text-orange-400'
  },
  {
    name: 'Friends/Social',
    icon: <Users className="w-4 h-4" />,
    color: 'text-purple-400'
  },
  {
    name: 'Health',
    icon: <Heart className="w-4 h-4" />,
    color: 'text-red-400'
  },
  {
    name: 'Leisure',
    icon: <Gamepad2 className="w-4 h-4" />,
    color: 'text-green-400'
  },
  {
    name: 'Finances',
    icon: <DollarSign className="w-4 h-4" />,
    color: 'text-yellow-400'
  }
];

export const WatchCategoryTagger: React.FC<WatchCategoryTaggerProps> = ({ 
  onCategorySelected, 
  onBack 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [showSubcategories, setShowSubcategories] = useState(false);

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    
    // Auto-proceed since no subcategories
    setTimeout(() => {
      onCategorySelected(categoryName);
    }, 500);
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    
    setTimeout(() => {
      onCategorySelected(selectedCategory!, subcategory);
    }, 500);
  };

  const handleSkipSubcategory = () => {
    onCategorySelected(selectedCategory!);
  };

  // Remove subcategory functionality since new categories don't have subcategories

  return (
    <div className="min-h-screen bg-black text-white p-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-1 text-white/60 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-sm font-medium">What's the source?</h2>
        <div className="w-6" />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 gap-2">
        {categories.map((category, index) => (
          <motion.button
            key={category.name}
            onClick={() => handleCategorySelect(category.name)}
            className={`
              aspect-square rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-1 relative
              ${selectedCategory === category.name 
                ? 'border-white bg-white/20 scale-95' 
                : 'border-gray-600 hover:border-gray-400 hover:bg-white/5'
              }
            `}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: selectedCategory ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className={category.color}>
              {category.icon}
            </div>
            <span className="text-xs font-medium text-center leading-tight px-1">{category.name}</span>
            
            {selectedCategory === category.name && (
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Check className="w-2 h-2 text-white" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Selection Feedback */}
      {selectedCategory && (
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm font-medium mb-1">{selectedCategory}</p>
          <p className="text-xs text-gray-400">
            Starting breathing exercise...
          </p>
        </motion.div>
      )}

      {/* Progress Dots */}
      <div className="flex justify-center gap-1 mt-6">
        <div className="w-2 h-2 bg-white rounded-full" />
        <div className="w-2 h-2 bg-white rounded-full" />
        <div className="w-2 h-2 bg-gray-600 rounded-full" />
        <div className="w-2 h-2 bg-gray-600 rounded-full" />
      </div>
    </div>
  );
};