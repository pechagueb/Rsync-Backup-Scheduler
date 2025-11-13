
import React from 'react';
import { BackupJob } from '../types';
import BackupItem from './BackupItem';

interface BackupListProps {
  jobs: BackupJob[];
  onEdit: (job: BackupJob) => void;
  onDelete: (id: string) => void;
}

const BackupList: React.FC<BackupListProps> = ({ jobs, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      {jobs.map(job => (
        <BackupItem
          key={job.id}
          job={job}
          onEdit={() => onEdit(job)}
          onDelete={() => onDelete(job.id)}
        />
      ))}
    </div>
  );
};

export default BackupList;
