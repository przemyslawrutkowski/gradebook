import React, { useState, useEffect } from "react";
import PageTitle from '../components/PageTitle';
import { Search, Plus } from 'lucide-react';
import Button from "../components/Button";
import SubjectCard from "../components/SubjectCard";
import { validate as validateUUID } from 'uuid'; 
import { getToken } from '../utils/UserRoleUtils';
import ConfirmDeletionForm from "../components/forms/ConfirmDeletionForm";
import CreateSubjectForm from "../components/forms/subjects/CreateSubjectForm"
import EditSubjectForm from "../components/forms/subjects/EditSubjectForm"

export function Subjects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const token = getToken();

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/subject', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const result = await response.json();
      setSubjects(result.data);
    } catch (err) {
      setError(err.message); 
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredData = subjects.filter(sub =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openEditModal = (id, name) => {
    if (!validateUUID(id)) {
      return;
    }
    setEditingSubject({ id, name });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingSubject(null);
    setIsEditModalOpen(false);
  };

  const openDeleteModal = (id) => {
    if (validateUUID(id)) {
      setSubjectToDelete(id);
      setIsDeleteModalOpen(true);
    }
  };

  const closeDeleteModal = () => {
    setSubjectToDelete(null);
    setIsDeleteModalOpen(false);
  };


  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/subject/${subjectToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      setSubjects(prev => prev.filter(cls => cls.id !== subjectToDelete));
    } catch (err) {
      setError(err.message);
    } finally {
      closeDeleteModal();
    }
  };

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Class Names"/>
      <div className='flex flex-wrap justify-between mb-8'>
        <div className='w-full md:w-auto mb-4 md:mb-0'>
          <div className='flex gap-4 flex-wrap'>
            <div className="flex h-9 w-full md:w-96 items-center px-3 py-3 bg-white rounded border border-solid border-textBg-200 text-textBg-600">
              <Search size={20} className='mr-2 text-textBg-600' />
              <input
                type='text'
                placeholder='Search Class Names'
                value={searchTerm}
                onChange={handleSearch}
                className="w-full focus:outline-none text-sm lg:text-base"
              />
            </div>
          </div>
        </div>
        <div className='w-full md:w-auto'>
          <Button
            size="m"
            icon={<Plus size={16} />}
            text="Create Class Name"
            className='w-full md:w-auto'
            type="primary"
            onClick={openCreateModal}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-textBg-900 text-lg">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredData.length > 0 ? (
            filteredData.map(sub => (
              <SubjectCard
                key={sub.id}
                id={sub.id}
                name={sub.name}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            ))
          ) : (
            <p className="text-textBg-900 text-lg">No subjects found.</p>
          )}
        </div>
      )}

      <CreateSubjectForm
        isOpen={isCreateModalOpen}
        onSuccess={() => {
          fetchSubjects(); 
          closeCreateModal();
        }}
        onClose={closeCreateModal}
      />

      {editingSubject && (
        <EditSubjectForm
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          id={editingSubject.id}
          currentName={editingSubject.name}
          onSuccess={() => {
            fetchSubjects();
            closeEditModal();
          }}
        />
      )}

      <ConfirmDeletionForm
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description="Are you sure you want to delete this class name? This action is irreversible."
      />
    </main>
  );
}

export default Subjects;
