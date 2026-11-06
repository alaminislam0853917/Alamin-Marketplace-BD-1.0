import React from 'react';
import { Layers, ChevronRight, Package } from 'lucide-react';
import { Category, Product } from '../types';
import { toBengaliNumber } from '../utils/formatters';

interface CategoriesViewProps {
  categories: Category[];
  products: Product[];
  onSelectCategory: (categoryId: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  products,
  onSelectCategory
}) => {
  // Count products per category
  const getProductCount = (catId: string, catName: string) => {
    return products.filter((p) => p.category === catId || p.category === catName).length;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800">পণ্য ক্যাটাগরি</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          আপনার প্রয়োজনীয় পণ্য সহজে খুঁজে পেতে বিভাগ নির্বাচন করুন
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {/* All Products Option */}
        <div
          onClick={() => onSelectCategory('all')}
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 group-hover:text-teal-700 transition">
                সব পণ্য
              </h3>
              <span className="text-xs text-slate-400">
                {toBengaliNumber(products.length)}টি পণ্য
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition" />
        </div>

        {/* Dynamic Categories */}
        {categories.map((cat) => {
          const count = getProductCount(cat.id, cat.name);
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-teal-700 transition">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {toBengaliNumber(count)}টি পণ্য
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
