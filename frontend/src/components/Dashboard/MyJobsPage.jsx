import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import JobCard from '../Jobs/JobCard';
import JobDetailsDialog from '../Jobs/JobDetailsDialog';
import { jobAPI } from '../../utils/api';
import { toast } from 'sonner';

const MyJobsPage = () => {
  const [postedJobs, setPostedJobs] = useState([]);
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchJobs = async () => {
    try {
      const response = await jobAPI.getMyJobs();
      setPostedJobs(response.data.posted || []);
      setAcceptedJobs(response.data.accepted || []);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const renderJobList = (jobs, emptyMessage) => {
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
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            onClick={setSelectedJob}
            showStatus
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="posted" className="w-full">
        <TabsList>
          <TabsTrigger value="posted">
            Posted Jobs ({postedJobs.length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted Jobs ({acceptedJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posted">
          {renderJobList(postedJobs, "You haven't posted any jobs yet")}
        </TabsContent>

        <TabsContent value="accepted">
          {renderJobList(acceptedJobs, "You haven't accepted any jobs yet")}
        </TabsContent>
      </Tabs>

      <JobDetailsDialog
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        onUpdate={fetchJobs}
      />
    </div>
  );
};

export default MyJobsPage;
