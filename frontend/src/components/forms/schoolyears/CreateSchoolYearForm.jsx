import React, { useState } from 'react';
import Button from "../../Button"; 
import Modal from '../../Modal';
import { X } from 'lucide-react';
import { getToken } from '../../../utils/UserRoleUtils';

function CreateSchoolYearForm({isOpen, onSuccess, onClose }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = getToken();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2); 
    const day = (`0${date.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      setError('The start date must be before the end date.');
      setLoading(false);
      return;
    }

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    try {
      const response = await fetch('http://localhost:3000/school-year',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({ 
          name, 
          startDate: formattedStartDate, 
          endDate: formattedEndDate 
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      onSuccess(); 
      onClose();  
    } catch (err) {
      setError(err.response?.data?.message || 'Error')
    } finally {
      setLoading(false);
      setName('');
      setStartDate('');
      setEndDate('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Create School Year</h2>
        <X size={24} className="hover:cursor-pointer" onClick={onClose}/>
      </div>
      <form className="flex flex-col gap-6" onSubmit={handleCreate}>
        {error && <p className="text-red-500">{error}</p>}

        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="schoolYearName">School Year Name</label>
          <input
            id="schoolYearName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
            placeholder="e.g., 2024/2025"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="startDate">Start Date</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
            placeholder="Select start date"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base text-textBg-700" htmlFor="endDate">End Date</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
            placeholder="Select end date"
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            text="Cancel"
            type="secondary"
            onClick={onClose}
            className="px-4 py-2"
          />
          <Button
            text={loading ? "Creating..." : "Create"}
            type="primary"
            disabled={loading}
            className="px-4 py-2"
            btnType="submit" 
          />
        </div>
      </form>
    </Modal>
  );
}

export default CreateSchoolYearForm;