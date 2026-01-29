import React, { useState } from 'react';
import { Clock, Tag, Star, Calendar, User, Flag, Trash2, MessageCircle, AlertTriangle } from 'lucide-react';
import ChatDialog from './ChatDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

import { useAuth } from '../../context/AuthContext';
import { jobAPI, reportAPI } from '../../utils/api';
import { toast } from 'sonner';

const statusVariants = {
  open: 'success',
  'in-progress': 'warning',
  completed: 'purple',
};

const JobDetailsDialog = ({ job, isOpen, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [rating, setRating] = useState(0);

  // Delete Job State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Local job state to handle full data fetching if needed
  const [jobData, setJobData] = useState(job);

  // Fetch full details if acceptedBy is not fully populated
  React.useEffect(() => {
    setJobData(job); // Reset when prop changes
    const fetchFullJob = async () => {
      if (job && job.acceptedBy && !job.acceptedBy.name) {
        try {
          const res = await jobAPI.getJob(job._id);
          setJobData(res.data);
        } catch (err) {
          console.error("Failed to fetch full job details", err);
        }
      }
    };
    if (job) fetchFullJob();
  }, [job]);

  if (!jobData) return null;

  const isOwner = user?._id === (jobData.postedBy?._id || jobData.postedBy);
  const isWorker = user?._id === (jobData.acceptedBy?._id || jobData.acceptedBy);
  const canAccept = jobData.status === 'open' && !isOwner;
  const canComplete = jobData.status === 'in-progress' && isWorker;
  const canReview = jobData.status === 'completed' && isOwner && !jobData.workerRating;
  const canDelete = isOwner && jobData.status === 'open';

  // Chat is available if job is NOT open (accepted/in-progress/completed)
  // AND user is either owner or worker
  const canChat = jobData.status !== 'open' && (isOwner || isWorker);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await jobAPI.acceptJob(jobData._id);
      toast.success('Job accepted! Start working on it.');
      onUpdate?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to accept job');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await jobAPI.completeJob(jobData._id);
      toast.success('Job marked as completed!');
      onUpdate?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to complete job');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setLoading(true);
    try {
      await jobAPI.reviewJob(jobData._id, rating);
      toast.success('Review submitted!');
      onUpdate?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await jobAPI.deleteJob(jobData._id);
      toast.success('Job deleted');
      onUpdate?.();
      setDeleteDialogOpen(false);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to delete job');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    setLoading(true);
    try {
      await reportAPI.submitReport('job', jobData._id, reportReason);
      toast.success('Report submitted');
      setShowReport(false);
      setReportReason('');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-full h-[100dvh] sm:h-auto sm:max-w-lg p-0 gap-0 overflow-y-auto sm:rounded-lg">
          <div className="p-6">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-xl">{jobData.title}</DialogTitle>
                  <DialogDescription className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4" />
                    Posted by {jobData.postedBy?.name || 'Unknown'}
                    {jobData.postedBy?.rating > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {jobData.postedBy.rating.toFixed(1)}
                      </span>
                    )}
                  </DialogDescription>
                </div>
                <Badge variant={statusVariants[jobData.status]}>{jobData.status}</Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              {jobData.description && (
                <p className="text-sm text-muted-foreground">{jobData.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">₹{jobData.paymentAmount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{jobData.expectedDuration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span className="capitalize">{jobData.category}</span>
                </div>
                {jobData.deadline && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(jobData.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {jobData.acceptedBy && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <span className="text-muted-foreground">Accepted by: </span>
                  <span className="font-medium">{jobData.acceptedBy.name || 'Worker'}</span>
                </div>
              )}

              {/* Review section */}
              {canReview && (
                <div className="border-t pt-4 space-y-3">
                  <Label>Rate the worker</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                            }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Report section */}
              {showReport && (
                <div className="border-t pt-4 space-y-3">
                  <Label>Report reason</Label>
                  <Textarea
                    placeholder="Why are you reporting this job?"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleReport} disabled={loading}>
                      Submit Report
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowReport(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              {!showReport && (
                <>
                  {canAccept && (
                    <Button onClick={handleAccept} disabled={loading} className="flex-1">
                      {loading ? 'Accepting...' : 'Accept Job'}
                    </Button>
                  )}
                  {canComplete && (
                    <Button onClick={handleComplete} disabled={loading} className="flex-1">
                      {loading ? 'Completing...' : 'Mark Complete'}
                    </Button>
                  )}
                  {canReview && (
                    <Button onClick={handleReview} disabled={loading} className="flex-1">
                      {loading ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="destructive"
                      onClick={handleDeleteClick}
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  )}
                  {!isOwner && !showReport && (
                    <Button
                      variant="outline"
                      onClick={() => setShowReport(true)}
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Report
                    </Button>
                  )}
                </>
              )}

              {canChat && (
                <Button
                  onClick={() => setShowChat(true)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </Button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <ChatDialog
        jobId={jobData._id}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete Job
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JobDetailsDialog;
