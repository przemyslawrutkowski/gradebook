import React, { useState, useEffect } from 'react';
import Modal from '../../Modal'; // Adjust the import path as necessary
import Button from '../../Button';
import { toast } from 'react-toastify';
import { getToken } from '../../../utils/UserRoleUtils';

const UpdateProblemStatusForm = ({ isOpen, onClose, problem, statuses, onSuccess }) => {
  const [selectedStatus, setSelectedStatus] = useState(problem.statuses?.id || '');
  const [loading, setLoading] = useState(false);
  const token = getToken();

  useEffect(() => {
    if (isOpen && problem) {
      setSelectedStatus(problem.statuses?.id || '');
    }
  }, [isOpen, problem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:3000/problem/${problem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ statusId: selectedStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data = await response.json();
      toast.success(data.message || 'Status updated successfully.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      widthHeightClassname="w-full max-w-md h-auto"
    >
      <h2 className="text-xl font-semibold mb-4">Update Status</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="status" className="font-medium">Status</label>
          <select
            id="status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" hidden disabled>Select a status</option>
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-4">
          <Button 
            text="Cancel" 
            type="secondary" 
            onClick={onClose}
          />
          <Button 
            text={loading ? "Updating..." : "Update"} 
            type="primary" 
            disabled={loading}
          />
        </div>
      </form>
    </Modal>
  );
};

export default UpdateProblemStatusForm;