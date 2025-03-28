import React, { useState, useEffect, useMemo } from "react";
import PageTitle from '../components/PageTitle';
import { Search, Plus } from 'lucide-react';
import Button from "../components/Button";
import ClassNameCard from "../components/ClassNameCard";
import CreateClassNameForm from "../components/forms/classnames/CreateClassNameForm";
import EditClassNameForm from "../components/forms/classnames/EditClassNameForm";
import { validate as validateUUID } from 'uuid'; 
import { getToken } from '../utils/UserRoleUtils';
import ConfirmForm from '../components/forms/ConfirmForm';
import { toast } from "react-toastify";

export function ClassNames() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingClassName, setEditingClassName] = useState(null);
  const [classToDelete, setClassToDelete] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [classNames, setClassNames] = useState([]);
  const token = getToken();

  const fetchClassNames = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/class-name', {
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
      setClassNames(result.data);
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchClassNames();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const filteredAndSortedClassNames = useMemo(() => {
    const filtered = classNames.filter(className =>
      className.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
  }, [searchTerm, sortOption, classNames]);

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openEditModal = (id, name) => {
    if (!validateUUID(id)) {
      return;
    }
    setEditingClassName({ id, name });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingClassName(null);
    setIsEditModalOpen(false);
  };

  const openDeleteModal = (id) => {
    if (validateUUID(id)) {
      setClassToDelete(id);
      setIsDeleteModalOpen(true);
    }
  };

  const closeDeleteModal = () => {
    setClassToDelete(null);
    setIsDeleteModalOpen(false);
  };


  const handleConfirmDelete = async () => {
    if (!classToDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/class-name/${classToDelete}`, {
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

      setClassNames(prev => prev.filter(cls => cls.id !== classToDelete));
      toast.success(data.message || 'Class name deleted successfully.');
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      closeDeleteModal();
    }
  };

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Class Names"/>
      <div className='flex flex-col md:flex-row gap-4 flex-wrap mb-6 justify-between'>
              <div className="flex flex-col tn:flex-row items-center gap-4">
                <div className="flex h-9 w-full md:w-64 items-center px-3 py-2 bg-white rounded border border-solid border-textBg-200 text-textBg-600">
                  <Search size={20} className='mr-2 text-textBg-600' />
                  <input
                    type='text'
                    placeholder='Search Event Types'
                    value={searchTerm}
                    onChange={handleSearchChange}
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
                  text="Create Event Type"
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
          {filteredAndSortedClassNames.length > 0 ? (
            filteredAndSortedClassNames.map(cls => (
              <ClassNameCard
                key={cls.id}
                id={cls.id}
                name={cls.name}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            ))
          ) : (
            <p className="text-textBg-900 text-lg">No class names found.</p>
          )}
        </div>
      )}

      <CreateClassNameForm
        isOpen={isCreateModalOpen}
        onSuccess={() => {
          fetchClassNames(); 
          closeCreateModal();
        }}
        onClose={closeCreateModal}
      />

      {editingClassName && (
        <EditClassNameForm
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          id={editingClassName.id}
          currentName={editingClassName.name}
          onSuccess={() => {
            fetchClassNames();
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

export default ClassNames;
