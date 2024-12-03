import React, { useEffect, useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import Select from 'react-select'; 
import { X } from 'lucide-react';
import { getToken } from '../../utils/UserRoleUtils';

function AssignParentForm({ onSuccess, isOpen, closeModal, studentId, studentName }) {
  const [availableParents, setAvailableParents] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = getToken();
  
  useEffect(() => {
    if (isOpen) {
      fetchAvailableParents();
    }
  }, [isOpen]);

  const fetchAvailableParents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/parent/available-parents`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`, 
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      const parentsData = result.data.map(parent => ({
        value: parent.id,
        label: `${parent.first_name} ${parent.last_name} (${parent.email})`,
      }));
      setAvailableParents(parentsData);
    } catch (err) {
      setError('Nie udało się pobrać dostępnych rodziców.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignParent = async () => {
    if (!selectedParent) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/student-parent/', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          studentId: studentId,
          parentId: selectedParent.value,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Nie udało się przypisać rodzica.');
      }

      const result = await response.json();
      onSuccess();
      closeModal();
    } catch (err) {
      setError(err.message || 'Wystąpił błąd podczas przypisywania rodzica.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} widthHeightClassname="max-w-md max-h-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Przypisz rodzica do {studentName}</h2>
        <X size={24} className="hover:cursor-pointer" onClick={closeModal} />
      </div>
      <div>
        {loading && <p>Ładowanie...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <Select
            options={availableParents}
            onChange={setSelectedParent}
            placeholder="Wybierz rodzica do przypisania"
            className="w-full mb-4"
            isClearable
          />
        )}
        <div className="mt-6 flex justify-end gap-4">
          <Button text="Anuluj" type="secondary" onClick={closeModal} />
          <Button 
            text="Przypisz" 
            type="primary" 
            onClick={handleAssignParent} 
            disabled={!selectedParent || loading}
          />
        </div>
      </div>
    </Modal> 
  );
}

export default AssignParentForm;
