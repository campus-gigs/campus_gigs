import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { jobAPI } from '../../utils/api';
import { toast } from 'sonner';

const categories = [
  { value: 'tech', label: 'Tech' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'design', label: 'Design' },
  { value: 'writing', label: 'Writing' },
  { value: 'tutoring', label: 'Tutoring' },
  { value: 'other', label: 'Other' },
];

const durations = [
  { value: '1-2 hours', label: '1-2 hours' },
  { value: '2-4 hours', label: '2-4 hours' },
  { value: '4-8 hours', label: '4-8 hours' },
  { value: '1-2 days', label: '1-2 days' },
  { value: '2-5 days', label: '2-5 days' },
  { value: '1+ week', label: '1+ week' },
];

const PostJobSheet = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'other',
    expectedDuration: '2-4 hours',
    deadline: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.price) {
      toast.error('Title and price are required');
      return;
    }

    setLoading(true);

    try {
      await jobAPI.postJob({
        ...formData,
        price: Number(formData.price),
      });
      toast.success('Job posted successfully!');
      setFormData({
        title: '',
        description: '',
        price: '',
        category: 'other',
        expectedDuration: '2-4 hours',
        deadline: '',
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-background border-l shadow-xl z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold font-display">Post a New Job</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Help me move furniture"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the job in detail..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Payment (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="1"
                  placeholder="500"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select
                  value={formData.expectedDuration}
                  onValueChange={(value) => setFormData({ ...formData, expectedDuration: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((dur) => (
                      <SelectItem key={dur.value} value={dur.value}>
                        {dur.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Posting...' : 'Post Job'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default PostJobSheet;
