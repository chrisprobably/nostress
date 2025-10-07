import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Briefcase, Heart, DollarSign, Home, Users, Gamepad2 } from 'lucide-react';

interface CategoryTaggerProps {
  onCategorySelected: (category: string, subcategory?: string) => void;
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
    icon: <Briefcase className="w-5 h-5" />,
    color: 'bg-blue-100 hover:bg-blue-200 text-blue-700'
  },
  {
    name: 'Family',
    icon: <Home className="w-5 h-5" />,
    color: 'bg-orange-100 hover:bg-orange-200 text-orange-700'
  },
  {
    name: 'Friends/Social',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-purple-100 hover:bg-purple-200 text-purple-700'
  },
  {
    name: 'Health',
    icon: <Heart className="w-5 h-5" />,
    color: 'bg-red-100 hover:bg-red-200 text-red-700'
  },
  {
    name: 'Leisure',
    icon: <Gamepad2 className="w-5 h-5" />,
    color: 'bg-green-100 hover:bg-green-200 text-green-700'
  },
  {
    name: 'Finances',
    icon: <DollarSign className="w-5 h-5" />,
    color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
  }
];

export const CategoryTagger: React.FC<CategoryTaggerProps> = ({ onCategorySelected }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
  };

  const handleContinue = () => {
    if (selectedCategory) {
      onCategorySelected(selectedCategory);
    }
  };

  // Remove subcategory functionality since new categories don't have subcategories

  return (
    <div className="space-y-6 pb-20">
      <Card className="p-6">
        <h2 className="mb-2">What's the source?</h2>
        <p className="text-muted-foreground mb-6">
          Help us understand what might be contributing to how you're feeling
        </p>

        {/* Primary Categories */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategorySelect(category.name)}
              className={`
                p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2
                ${selectedCategory === category.name 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
                }
                ${category.color}
              `}
            >
              {category.icon}
              <span className="text-xs font-medium text-center">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Selection Summary */}
        {selectedCategory && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span>Selected:</span>
              <Badge>{selectedCategory}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Great! Now let's do a breathing exercise to help you process this feeling.
            </p>
            <Button 
              onClick={handleContinue} 
              className="w-full"
            >
              Start Breathing Exercise
            </Button>
          </div>
        )}
      </Card>

      {/* Category Descriptions */}
      <Card className="p-6">
        <h3 className="mb-3">Category Guide</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Work/School:</span>
            <span className="text-muted-foreground"> Job tasks, deadlines, studies, exams</span>
          </div>
          <div>
            <span className="font-medium">Family:</span>
            <span className="text-muted-foreground"> Parents, siblings, children, family dynamics</span>
          </div>
          <div>
            <span className="font-medium">Friends/Social:</span>
            <span className="text-muted-foreground"> Social situations, friendships, peer pressure</span>
          </div>
          <div>
            <span className="font-medium">Health:</span>
            <span className="text-muted-foreground"> Physical symptoms, medical concerns, fitness</span>
          </div>
          <div>
            <span className="font-medium">Leisure:</span>
            <span className="text-muted-foreground"> Hobbies, entertainment, personal time</span>
          </div>
          <div>
            <span className="font-medium">Finances:</span>
            <span className="text-muted-foreground"> Financial concerns, bills, investments</span>
          </div>

        </div>
      </Card>
    </div>
  );
};