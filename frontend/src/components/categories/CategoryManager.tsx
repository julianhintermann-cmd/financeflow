import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { createCategory, updateCategory, deleteCategory } from '@/api/client';
import { formatCurrency } from '@/lib/utils';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

const ICON_OPTIONS = [
  'ShoppingCart', 'Car', 'Home', 'Gamepad2', 'Heart', 'MoreHorizontal',
  'Utensils', 'Plane', 'GraduationCap', 'Shirt', 'Smartphone', 'Gift',
  'Dumbbell', 'Coffee', 'Music', 'Briefcase', 'Zap', 'Wifi',
];

const COLOR_OPTIONS = [
  '#22C55E', '#3B82F6', '#8B5CF6', '#F97316', '#EF4444', '#6B7280',
  '#EC4899', '#14B8A6', '#F59E0B', '#06B6D4', '#84CC16', '#A855F7',
];

interface CategoryManagerProps {
  categories: any[];
  onRefresh: () => void;
}

export default function CategoryManager({ categories, onRefresh }: CategoryManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [icon, setIcon] = useState('Tag');
  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setEditId(null);
    setName('');
    setColor('#3B82F6');
    setIcon('Tag');
    setDialogOpen(true);
  };

  const openEdit = (cat: any) => {
    setEditId(cat.id);
    setName(cat.name);
    setColor(cat.color);
    setIcon(cat.icon);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      if (editId) {
        await updateCategory(editId, { name, color, icon });
      } else {
        await createCategory({ name, color, icon });
      }
      onRefresh();
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? All associated expenses will also be deleted.')) return;
    try {
      await deleteCategory(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Card key={cat.id} className="hover:shadow-md transition-shadow group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(cat.total_expenses || 0)} spent
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(cat.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card
          className="border-2 border-dashed hover:border-primary/50 cursor-pointer transition-colors"
          onClick={openCreate}
        >
          <CardContent className="p-5 flex items-center justify-center h-full min-h-[88px]">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Plus className="w-5 h-5" />
              <span className="font-medium">New Category</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Category' : 'New Category'}</DialogTitle>
            <DialogDescription>
              {editId ? 'Change the name, color, or icon.' : 'Create a new expense category.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                placeholder="e.g. Restaurants"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    className={`w-8 h-8 rounded-full transition-all ${
                      color === c ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {ICON_OPTIONS.map((ic) => (
                  <button
                    key={ic}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      icon === ic
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                    onClick={() => setIcon(ic)}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={handleSave} disabled={loading || !name.trim()}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editId ? 'Save' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
