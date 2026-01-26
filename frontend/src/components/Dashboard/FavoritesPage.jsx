import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import JobCard from '../Jobs/JobCard';
import JobDetailsDialog from '../Jobs/JobDetailsDialog';
import { jobAPI } from '../../utils/api';
import { toast } from 'sonner';

const FavoritesPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const fetchFavorites = async () => {
    try {
      const response = await jobAPI.getFavorites();
      setJobs(response.data);
      setFavorites(response.data.map((job) => job._id));
    } catch (error) {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavorite = async (jobId) => {
    try {
      await jobAPI.toggleFavorite(jobId);
      setJobs(jobs.filter((job) => job._id !== jobId));
      setFavorites(favorites.filter((id) => id !== jobId));
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No favorite jobs yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Click the heart icon on any job to save it here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            onClick={setSelectedJob}
            onFavorite={handleFavorite}
            isFavorite={true}
          />
        ))}
      </div>

      <JobDetailsDialog
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        onUpdate={fetchFavorites}
      />
    </div>
  );
};

export default FavoritesPage;
