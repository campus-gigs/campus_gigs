import React from 'react';
import { Clock, Tag, Star, Heart } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const categoryColors = {
  tech: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  delivery: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  design: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  writing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  tutoring: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
};

const statusVariants = {
  open: 'success',
  'in-progress': 'warning',
  completed: 'purple',
};

const JobCard = ({ job, onClick, onFavorite, isFavorite, showStatus = false }) => {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all group"
      onClick={() => onClick(job)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold font-display text-lg truncate group-hover:text-primary transition-colors">
              {job.title}
            </h3>
            {job.postedBy && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                by {job.postedBy.name}
                {job.postedBy.rating > 0 && (
                  <span className="flex items-center gap-0.5 ml-2">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {job.postedBy.rating.toFixed(1)}
                  </span>
                )}
              </p>
            )}
          </div>
          {onFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onFavorite(job._id);
              }}
            >
              <Heart
                className={cn(
                  'w-5 h-5 transition-colors',
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                )}
              />
            </Button>
          )}
        </div>

        {job.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {job.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={categoryColors[job.category] || categoryColors.other}>
            <Tag className="w-3 h-3 mr-1" />
            {job.category}
          </Badge>
          {showStatus && (
            <Badge variant={statusVariants[job.status] || 'secondary'}>
              {job.status}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-primary font-semibold">
            ₹{job.paymentAmount}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            {job.expectedDuration}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(JobCard);
