
import React, { useState } from 'react';
import { BackupJob } from '../types';
import { generateCronString, getScheduleDescription } from '../utils/cronUtils';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CopyIcon } from './icons/CopyIcon';

interface BackupItemProps {
  job: BackupJob;
  onEdit: () => void;
  onDelete: () => void;
}

const BackupItem: React.FC<BackupItemProps> = ({ job, onEdit, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const { name, source, destination, rsyncOptions } = job;
  
  const scheduleDesc = getScheduleDescription(job.schedule);
  const cronString = generateCronString(job.schedule);
  
  const rsyncFlags = [
    rsyncOptions.archive ? '-a' : '',
    rsyncOptions.verbose ? '-v' : '',
    rsyncOptions.compress ? '-z' : '',
    rsyncOptions.delete ? '--delete' : '',
    rsyncOptions.custom,
  ].filter(Boolean).join(' ');

  const fullCommand = `${cronString} rsync ${rsyncFlags} ${source} ${destination}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCommand).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-md p-5 transition-all hover:shadow-lg hover:border-indigo-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h3 className="text-xl font-bold text-indigo-400">{name}</h3>
          <p className="text-sm text-gray-400 mt-1">
            <span className="font-semibold text-gray-300">Source:</span> {source}
          </p>
          <p className="text-sm text-gray-400">
            <span className="font-semibold text-gray-300">Destination:</span> {destination}
          </p>
          <p className="text-sm text-gray-400 mt-2">
             <span className="font-semibold text-gray-300">Schedule:</span> {scheduleDesc}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <button onClick={onEdit} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors">
            <EditIcon />
          </button>
          <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-full transition-colors">
            <TrashIcon />
          </button>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <label className="block text-sm font-medium text-gray-400 mb-1">Generated Crontab Entry</label>
        <div className="flex items-center gap-2 bg-gray-900 p-3 rounded-md">
          <code className="text-sm text-green-400 flex-grow overflow-x-auto whitespace-nowrap">{fullCommand}</code>
          <button onClick={handleCopy} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
            {copied ? 'Copied!' : <CopyIcon />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupItem;
