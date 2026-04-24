import { useEffect, useState } from 'react';
import { getCategories } from '@/api/client';
import CategoryManager from '@/components/categories/CategoryManager';
import { Tags } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, [refreshKey]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Tags className="w-6 h-6" />
          Categories
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your expense categories
        </p>
      </div>
      <CategoryManager categories={categories} onRefresh={() => setRefreshKey((k) => k + 1)} />
    </div>
  );
}
