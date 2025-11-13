
import React, { useState, useCallback } from 'react';
import { BackupJob } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import BackupList from './components/BackupList';
import BackupForm from './components/BackupForm';
import Modal from './components/Modal';
import { PlusIcon } from './components/icons/PlusIcon';

const App: React.FC = () => {
  const [jobs, setJobs] = useLocalStorage<BackupJob[]>('backupJobs', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<BackupJob | null>(null);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingJob(null);
  }, []);

  const handleSaveJob = useCallback((job: BackupJob) => {
    setJobs(prevJobs => {
      if (job.id) {
        return prevJobs.map(j => j.id === job.id ? job : j);
      } else {
        return [...prevJobs, { ...job, id: Date.now().toString() }];
      }
    });
    closeModal();
  }, [setJobs, closeModal]);

  const handleEditJob = useCallback((job: BackupJob) => {
    setEditingJob(job);
    openModal();
  }, [openModal]);

  const handleDeleteJob = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this backup job?')) {
      setJobs(prevJobs => prevJobs.filter(job => job.id !== id));
    }
  }, [setJobs]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-300">Your Backup Jobs</h2>
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-colors duration-200"
          >
            <PlusIcon />
            New Backup Job
          </button>
        </div>
        
        <BackupList jobs={jobs} onEdit={handleEditJob} onDelete={handleDeleteJob} />

        {jobs.length === 0 && (
          <div className="text-center py-16 px-6 bg-gray-800 border border-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-300">No backup jobs yet.</h3>
            <p className="text-gray-400 mt-2">Click "New Backup Job" to schedule your first backup.</p>
          </div>
        )}
      </main>
      
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <BackupForm
          job={editingJob}
          onSave={handleSaveJob}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

export default App;
