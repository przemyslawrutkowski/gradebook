import React, { useState, useEffect } from "react";
import PageTitle from '../components/PageTitle';
import { Search, Plus } from 'lucide-react';
import Button from "../components/Button";
import ClassCard from "../components/ClassCard";
import CreateClassForm from "../components/forms/CreateClassForm";
import { getToken } from "../utils/UserRoleUtils";

export function Classes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = getToken();

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/class', 
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        }
      });
      if(!response.ok){
        throw new Error(`Error: ${response.status}`);
      }
      const result = await response.json();
      setClasses(result.data);
    } catch(err){
      setError(err.message);
    } finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const filteredClasses = classes.filter(cls => {
    const className = cls.class_names?.name || "";
    return className.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Classes"/>
      <div className='flex flex-wrap justify-between mb-8'>
        <div className='w-full md:w-auto mb-4 md:mb-0'>
          <div className='flex gap-4 flex-wrap'>
            <div className="flex h-9 w-full md:w-96 items-center px-3 py-3 bg-white rounded border border-solid border-textBg-200 text-textBg-600">
              <Search size={20} className='mr-2 text-textBg-600' />
              <input
                type='text'
                placeholder='Search by Class Name'
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
            text="Create Class"
            className='w-full md:w-auto'
            type="primary"
            onClick={openModal}
          />
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {loading && <p>Loading...</p>}

      <div className="grid grid-cols-1 gap-4">
        {filteredClasses.length > 0 ? (
          filteredClasses.map(cls => (
            <ClassCard
              key={cls.id}
              id={cls.id}
              name={cls.class_names?.name || "Unnamed Class"}
              schoolYear={cls.school_years?.name || "Unknown Year"}
              teacher={cls.teachers?.name || "No Teacher Assigned"}
              studentCount={cls.studentCount} 
            />
          ))
        ) : (
          <p className="text-textBg-900 text-lg">No classes found.</p>
        )}
      </div>
 
      <CreateClassForm
        isOpen={isModalOpen}
        onSuccess={fetchClasses}
        closeModal={closeModal}
      />
  
    </main>
  );
}
