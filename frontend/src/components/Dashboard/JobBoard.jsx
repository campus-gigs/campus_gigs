import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Filter, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import JobCard from '../Jobs/JobCard';
import PostJobSheet from '../Jobs/PostJobSheet';
import JobDetailsDialog from '../Jobs/JobDetailsDialog';
import { jobAPI } from '../../utils/api';
import { toast } from 'sonner';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'tech', label: 'Tech' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'design', label: 'Design' },
  { value: 'writing', label: 'Writing' },
  { value: 'tutoring', label: 'Tutoring' },
  { value: 'other', label: 'Other' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-high', label: 'Highest Pay' },
  { value: 'price-low', label: 'Lowest Pay' },
  { value: 'deadline', label: 'Deadline' },
];

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [showPostJob, setShowPostJob] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await jobAPI.getJobs({
        search: debouncedSearch,
        category: category === 'all' ? '' : category,
        sortBy
      });
      // Backend now returns { jobs: [...], currentPage: ... }
      setJobs(response.data.jobs || []);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, sortBy]);

  const fetchFavorites = useCallback(async () => {
    try {
      const response = await jobAPI.getFavorites();
      setFavorites(response.data.map((job) => job._id));
    } catch (error) {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchFavorites();
  }, [fetchJobs, fetchFavorites]);

  const handleFavorite = async (jobId) => {
    try {
      const response = await jobAPI.toggleFavorite(jobId);
      if (response.data.isFavorite) {
        setFavorites([...favorites, jobId]);
        toast.success('Added to favorites');
      } else {
        setFavorites(favorites.filter((id) => id !== jobId));
        toast.success('Removed from favorites');
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <div className={`flex gap-2 ${showFilters ? 'flex' : 'hidden lg:flex'}`}>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => setShowPostJob(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Post Job
          </Button>
        </div>
      </div>

      {/* Active filters */}
      {(search || category !== 'all') && (
        <div className="flex flex-wrap gap-2">
          {search && (
            <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
              Search: {search}
              <button onClick={() => setSearch('')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {category !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
              Category: {category}
              <button onClick={() => setCategory('all')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Jobs grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No jobs found</p>
          <Button className="mt-4" onClick={() => setShowPostJob(true)}>
            Post the first job
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onClick={setSelectedJob}
              onFavorite={handleFavorite}
              isFavorite={favorites.includes(job._id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <PostJobSheet
        isOpen={showPostJob}
        onClose={() => setShowPostJob(false)}
        onSuccess={fetchJobs}
      />

      <JobDetailsDialog
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        onUpdate={fetchJobs}
      />
    </div>
  );
};

export default JobBoard;
