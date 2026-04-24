import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReceiptUpload from './ReceiptUpload';
import { getCategories, createExpense } from '@/api/client';
import { Loader2 } from 'lucide-react';

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddExpenseDialog({ open, onOpenChange, onSuccess }: AddExpenseDialogProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptPath, setReceiptPath] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      getCategories().then(setCategories).catch(console.error);
    }
  }, [open]);

  const handleReceiptResult = (data: any) => {
    if (data.amount) setAmount(String(data.amount));
    if (data.description) setDescription(data.description);
    if (data.date) setDate(data.date);
    if (data.receiptPath) setReceiptPath(data.receiptPath);
    if (data.suggestedCategory) {
      const cat = categories.find(
        (c) => c.name.toLowerCase() === data.suggestedCategory.toLowerCase()
      );
      if (cat) setCategoryId(String(cat.id));
    }
  };

  const handleSubmit = async () => {
    if (!amount || !categoryId || !date) return;
    setLoading(true);
    try {
      await createExpense({
        amount: parseFloat(amount),
        description,
        category_id: parseInt(categoryId),
        date,
        receipt_path: receiptPath || undefined,
      });
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategoryId('');
    setDate(new Date().toISOString().split('T')[0]);
    setReceiptPath('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>Enter a new expense manually or upload a receipt.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="receipt">Upload Receipt</TabsTrigger>
          </TabsList>

          <TabsContent value="receipt" className="mt-4">
            <ReceiptUpload onResult={handleReceiptResult} />
          </TabsContent>

          <TabsContent value="manual" className="mt-0">
            <div />
          </TabsContent>
        </Tabs>

        <div className="space-y-4 mt-2">
          <div>
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5 text-2xl font-bold h-14 text-center"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g. Weekly groceries"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={loading || !amount || !categoryId}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Expense'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
