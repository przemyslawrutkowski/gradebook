import React, { useState, useEffect, useMemo } from "react";
import PageTitle from '../components/PageTitle';
import { Search, Plus } from 'lucide-react';
import Button from "../components/Button";
import SubjectOrEventTypeCard from "../components/SubjectOrEventTypeCard";
import { validate as validateUUID } from 'uuid'; 
import { getToken } from '../utils/UserRoleUtils';
import ConfirmForm from '../components/forms/ConfirmForm';
import CreateSubjectForm from "../components/forms/subjects/CreateSubjectForm"
import EditSubjectForm from "../components/forms/subjects/EditSubjectForm"
import { toast } from "react-toastify";

export function Subjects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
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
      toast.error(err.message || 'An unexpected error occurred.');
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

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const filteredAndSortedSubjects = useMemo(() => {
    const filtered = Array.isArray(subjects) ? subjects.filter(sy => 
      sy.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const sorted = [...filtered].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      if (sortOption === 'name-asc') {
        return nameA.localeCompare(nameB);
      } else if (sortOption === 'name-desc') {
        return nameB.localeCompare(nameA);
      } else {
        return 0;
      }
    });

    return sorted;
  }, [searchTerm, sortOption, subjects]);

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
      const data = await response.json();
      
      setSubjects(prev => prev.filter(cls => cls.id !== subjectToDelete));
      toast.success(data.message || 'Class name deleted successfully.');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      closeDeleteModal();
    }
  };

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Subjects"/>
      <div className='flex flex-col md:flex-row gap-4 flex-wrap mb-6 justify-between'>
        <div className="flex flex-col tn:flex-row items-center gap-4">
          <div className="flex h-9 w-full md:w-64 items-center px-3 py-2 bg-white rounded border border-solid border-textBg-200 text-textBg-600">
            <Search size={20} className='mr-2 text-textBg-600' />
            <input
              type='text'
              placeholder='Search Subjects'
              value={searchTerm}
              onChange={handleSearch}
              className="w-full focus:outline-none lg:text-base placeholder:text-textBg-600"
            />
          </div>

          <select
            value={sortOption}
            onChange={handleSortChange}
            className="h-9 w-full md:w-56 px-3 bg-white rounded border border-solid border-textBg-200 text-textBg-600 focus:outline-none"
          >
            <option value="" disabled hidden>Sort By</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
        </div>
        <div className='w-full md:w-auto'>
          <Button
            size="m"
            icon={<Plus size={16} />}
            text="Create Subject"
            className='w-full md:w-auto'
            type="primary"
            onClick={openCreateModal}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-textBg-900 text-lg">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAndSortedSubjects.length > 0 ? (
            filteredAndSortedSubjects.map(sub => (
              <SubjectOrEventTypeCard
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

      <ConfirmForm
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
