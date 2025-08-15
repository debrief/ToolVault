import React, { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Rating,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Speed,
  Lightbulb,
  BugReport,
} from '@mui/icons-material';
import type { ExecutionState } from '../../types/execution';

export interface ExecutionFeedback {
  executionId: string;
  rating: number | null;
  feedback: string;
  reportIssue: boolean;
  categories: string[];
  timestamp: Date;
  wouldRecommend?: boolean;
  executionSpeed?: number;
  resultQuality?: number;
  suggestions?: string;
}

export interface ExecutionFeedbackProps {
  execution: ExecutionState;
  onFeedbackSubmit: (feedback: ExecutionFeedback) => void;
}

const feedbackCategories = [
  { id: 'performance', label: 'Performance', icon: <Speed /> },
  { id: 'accuracy', label: 'Result Accuracy', icon: <ThumbUp /> },
  { id: 'usability', label: 'Ease of Use', icon: <Lightbulb /> },
  { id: 'reliability', label: 'Reliability', icon: <ThumbUp /> },
];

export function ExecutionFeedback({
  execution,
  onFeedbackSubmit,
}: ExecutionFeedbackProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [reportIssue, setReportIssue] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [executionSpeed, setExecutionSpeed] = useState<number | null>(null);
  const [resultQuality, setResultQuality] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = () => {
    if (rating === null) {
      return;
    }

    const feedbackData: ExecutionFeedback = {
      executionId: execution.id,
      rating,
      feedback,
      reportIssue,
      categories: selectedCategories,
      timestamp: new Date(),
      wouldRecommend: wouldRecommend || undefined,
      executionSpeed: executionSpeed || undefined,
      resultQuality: resultQuality || undefined,
      suggestions: suggestions || undefined,
    };

    onFeedbackSubmit(feedbackData);
    setSubmitted(true);
  };

  const formatExecutionDuration = () => {
    if (!execution.endTime) return 'In progress';
    const duration = execution.endTime.getTime() - execution.startTime.getTime();
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
    return `${(duration / 60000).toFixed(1)}m`;
  };

  const getRatingLabel = (value: number) => {
    switch (value) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  if (submitted) {
    return (
      <Alert severity="success" sx={{ mt: 2 }}>
        <Typography variant="h6">Thank you for your feedback!</Typography>
        <Typography variant="body2">
          Your feedback helps us improve the tool execution experience.
        </Typography>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader title="How was your experience?" />
      <CardContent>
        {/* Execution Summary */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Execution Summary
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={`Status: ${execution.status}`} 
              color={execution.status === 'completed' ? 'success' : 'default'}
              size="small" 
            />
            <Chip label={`Duration: ${formatExecutionDuration()}`} size="small" />
            <Chip label={`Tool: ${execution.toolId}`} size="small" />
          </Box>
        </Box>

        {/* Overall Rating */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Overall Rating *
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Rating
              value={rating}
              onChange={(_, value) => setRating(value)}
              size="large"
            />
            {rating && (
              <Typography variant="body2" color="text.secondary">
                {getRatingLabel(rating)}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Category-specific Ratings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Specific Aspects
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Execution Speed
            </Typography>
            <Rating
              value={executionSpeed}
              onChange={(_, value) => setExecutionSpeed(value)}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Result Quality
            </Typography>
            <Rating
              value={resultQuality}
              onChange={(_, value) => setResultQuality(value)}
            />
          </Box>
        </Box>

        {/* Would Recommend */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Would you recommend this tool to others?
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={wouldRecommend === true ? 'contained' : 'outlined'}
              onClick={() => setWouldRecommend(true)}
              startIcon={<ThumbUp />}
              color="success"
            >
              Yes
            </Button>
            <Button
              variant={wouldRecommend === false ? 'contained' : 'outlined'}
              onClick={() => setWouldRecommend(false)}
              startIcon={<ThumbDown />}
              color="error"
            >
              No
            </Button>
          </Box>
        </Box>

        {/* Feedback Categories */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            What aspects would you like to comment on?
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {feedbackCategories.map(category => (
              <Chip
                key={category.id}
                icon={category.icon}
                label={category.label}
                onClick={() => handleCategoryToggle(category.id)}
                color={selectedCategories.includes(category.id) ? 'primary' : 'default'}
                variant={selectedCategories.includes(category.id) ? 'filled' : 'outlined'}
                clickable
              />
            ))}
          </Box>
        </Box>

        {/* Written Feedback */}
        <Box sx={{ mb: 3 }}>
          <TextField
            multiline
            rows={4}
            placeholder="Tell us about your experience..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            fullWidth
            label="Additional Comments"
          />
        </Box>

        {/* Suggestions */}
        <Box sx={{ mb: 3 }}>
          <TextField
            multiline
            rows={3}
            placeholder="How could we improve this tool?"
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            fullWidth
            label="Suggestions for Improvement"
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Issue Reporting */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={reportIssue}
                onChange={(e) => setReportIssue(e.target.checked)}
                icon={<BugReport />}
                checkedIcon={<BugReport />}
              />
            }
            label="Report an issue with this execution"
          />
          {reportIssue && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Your feedback will be flagged for technical review to address potential issues.
            </Typography>
          )}
        </Box>

        {/* Submit Button */}
        <Box sx={{ textAlign: 'right' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={rating === null}
            size="large"
          >
            Submit Feedback
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          * Overall rating is required. All other fields are optional.
        </Typography>
      </CardContent>
    </Card>
  );
}

export default ExecutionFeedback;