
import React, { useState, useEffect } from 'react';
import { BackupJob, RsyncOptions, Schedule, ScheduleType } from '../types';
import { parseBackupRequest } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';

interface BackupFormProps {
  job: BackupJob | null;
  onSave: (job: BackupJob) => void;
  onCancel: () => void;
}

const DEFAULT_SCHEDULE: Schedule = {
  type: ScheduleType.DAILY,
  minute: 0,
  hour: 2,
  dayOfMonth: 1,
  dayOfWeek: 0,
};

const DEFAULT_RSYNC_OPTIONS: RsyncOptions = {
  archive: true,
  verbose: false,
  compress: true,
  delete: false,
  custom: '',
};

const BackupForm: React.FC<BackupFormProps> = ({ job, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<BackupJob, 'id'>>({
    name: '',
    source: '',
    destination: '',
    rsyncOptions: DEFAULT_RSYNC_OPTIONS,
    schedule: DEFAULT_SCHEDULE,
  });
  const [geminiPrompt, setGeminiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (job) {
      setFormData(job);
    } else {
      setFormData({
        name: '',
        source: '',
        destination: '',
        rsyncOptions: DEFAULT_RSYNC_OPTIONS,
        schedule: DEFAULT_SCHEDULE,
      });
    }
  }, [job]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name in formData.schedule) {
      setFormData(prev => ({
        ...prev,
        schedule: { ...prev.schedule, [name]: name === 'type' ? value : parseInt(value, 10) },
      }));
    } else if (name in formData.rsyncOptions) {
        setFormData(prev => ({
            ...prev,
            rsyncOptions: {...prev.rsyncOptions, [name]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : value}
        }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: job?.id || '' });
  };
  
  const handleGeminiGenerate = async () => {
      if (!geminiPrompt) return;
      setIsGenerating(true);
      setError('');
      try {
          const result = await parseBackupRequest(geminiPrompt);
          setFormData(prev => ({
              ...prev,
              name: result.jobName || prev.name,
              source: result.source || prev.source,
              destination: result.destination || prev.destination,
              rsyncOptions: {
                ...prev.rsyncOptions,
                ...(result.rsyncFlags || {})
              },
              schedule: {
                  ...prev.schedule,
                  type: result.schedule?.type as ScheduleType || prev.schedule.type,
                  minute: result.schedule?.minute ?? prev.schedule.minute,
                  hour: result.schedule?.hour ?? prev.schedule.hour,
                  dayOfMonth: result.schedule?.dayOfMonth ?? prev.schedule.dayOfMonth,
                  dayOfWeek: result.schedule?.dayOfWeek ?? prev.schedule.dayOfWeek,
              }
          }));
      } catch (e) {
          setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      } finally {
          setIsGenerating(false);
      }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-white mb-4">{job ? 'Edit' : 'Create'} Backup Job</h2>
        
        {/* Gemini AI Assistant */}
        <div className="p-4 bg-gray-800 rounded-lg border border-indigo-500/50">
            <label htmlFor="gemini-prompt" className="flex items-center gap-2 text-lg font-semibold text-indigo-300">
                <SparklesIcon/> Gemini Assistant
            </label>
            <p className="text-sm text-gray-400 mt-1 mb-3">Describe your backup plan in plain English to get started.</p>
            <div className="flex gap-2">
                <input
                    type="text"
                    id="gemini-prompt"
                    value={geminiPrompt}
                    onChange={(e) => setGeminiPrompt(e.target.value)}
                    placeholder="e.g., backup my photos to my external drive every Sunday at 2am"
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isGenerating}
                />
                <button
                    type="button"
                    onClick={handleGeminiGenerate}
                    disabled={!geminiPrompt || isGenerating}
                    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                    {isGenerating ? 'Generating...' : 'Generate'}
                </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">Job Name</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-2"/>
            </div>
        </div>
        <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-300">Source Directory</label>
            <input type="text" name="source" id="source" value={formData.source} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-2"/>
        </div>
        <div>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-300">Destination Directory</label>
            <input type="text" name="destination" id="destination" value={formData.destination} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-2"/>
        </div>
        
        {/* Rsync Options */}
        <fieldset>
            <legend className="text-lg font-medium text-white">Rsync Options</legend>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {['archive', 'verbose', 'compress', 'delete'].map(opt => (
                     <div key={opt} className="flex items-center">
                        <input id={opt} name={opt} type="checkbox" checked={formData.rsyncOptions[opt as keyof RsyncOptions] as boolean} onChange={handleChange} className="h-4 w-4 text-indigo-600 bg-gray-700 border-gray-500 rounded focus:ring-indigo-500"/>
                        <label htmlFor={opt} className="ml-2 block text-sm text-gray-300 capitalize">{opt === 'delete' ? 'Delete extraneous' : opt}</label>
                    </div>
                ))}
            </div>
             <div>
                <label htmlFor="custom" className="block text-sm font-medium text-gray-300 mt-4">Custom Flags</label>
                <input type="text" name="custom" id="custom" value={formData.rsyncOptions.custom} onChange={handleChange} placeholder="--exclude='*.tmp'" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-2"/>
            </div>
        </fieldset>

        {/* Schedule */}
        <fieldset>
            <legend className="text-lg font-medium text-white">Schedule</legend>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-300">Frequency</label>
                    <select id="type" name="type" value={formData.schedule.type} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-2">
                        {Object.values(ScheduleType).map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                    </select>
                </div>
                {formData.schedule.type !== ScheduleType.HOURLY && (
                     <div>
                        <label htmlFor="hour" className="block text-sm font-medium text-gray-300">Hour (0-23)</label>
                        <input type="number" name="hour" id="hour" value={formData.schedule.hour} onChange={handleChange} min="0" max="23" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-2"/>
                    </div>
                )}
                <div>
                    <label htmlFor="minute" className="block text-sm font-medium text-gray-300">Minute (0-59)</label>
                    <input type="number" name="minute" id="minute" value={formData.schedule.minute} onChange={handleChange} min="0" max="59" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-2"/>
                </div>
                {formData.schedule.type === ScheduleType.WEEKLY && (
                    <div>
                        <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-300">Day of Week</label>
                        <select id="dayOfWeek" name="dayOfWeek" value={formData.schedule.dayOfWeek} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-2">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => <option key={i} value={i}>{day}</option>)}
                        </select>
                    </div>
                )}
                {formData.schedule.type === ScheduleType.MONTHLY && (
                    <div>
                        <label htmlFor="dayOfMonth" className="block text-sm font-medium text-gray-300">Day of Month (1-31)</label>
                        <input type="number" name="dayOfMonth" id="dayOfMonth" value={formData.schedule.dayOfMonth} onChange={handleChange} min="1" max="31" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-2"/>
                    </div>
                )}
            </div>
        </fieldset>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors">Save Job</button>
        </div>
    </form>
  );
};

export default BackupForm;
