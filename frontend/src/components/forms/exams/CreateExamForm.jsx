import React, { useState } from 'react';
import Modal from '../../Modal';
import Button from '../../Button';
import { getToken } from '../../../utils/UserRoleUtils';
import { toast } from 'react-toastify';

function CreateExamForm({ isOpen, onClose, onSuccess, lessonId }) {
  const [topic, setTopic] = useState('');
  const [scope, setScope] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = getToken();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!topic || !scope) {
      toast.error('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic,
          scope,
          lessonId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      const data = await response.json();

      onSuccess();
      handleClose();
      toast.success(data.message || 'Exam created successfully.');
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTopic('');
    setScope('');
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} widthHeightClassname="max-w-md">
      <h2 className="text-xl font-bold mb-4">Create Exam</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="topic">Exam Topic</label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
            placeholder="Enter exam topic"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="scope">Scope</label>
          <textarea
            id="scope"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border min-h-16 border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
            placeholder="Enter exam scope..."
          />
        </div>

        {loading && <div className="text-blue-500">Creating exam...</div>}

        <div className="flex justify-end gap-2">
          <Button type="secondary" text="Cancel" onClick={handleClose} />
          <Button type="primary" text="Create" disabled={loading} />
        </div>
      </form>
    </Modal>
  );
}

export default CreateExamForm;
