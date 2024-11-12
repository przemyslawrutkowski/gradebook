import React, { useState } from "react";
import PageTitle from '../components/PageTitle';
import { Search, Plus, X } from 'lucide-react';
import Button from "../components/Button";
import ClassCard from "../components/ClassCard";
import classesData from '../data/classesData';
// import CreateClassForm from "../components/CreateClassForm";
import Modal from "../components/Modal";

export function Classes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("All Teachers");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilter = (e) => {
    setFilterTeacher(e.target.value);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const filteredClasses = classesData.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeacher = filterTeacher === "All Teachers" || cls.teacher === filterTeacher;
    return matchesSearch && matchesTeacher;
  });

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Classes"/>
      <div className='flex flex-wrap justify-between mb-8'>
        <div className='w-full md:w-auto mb-4 md:mb-0'>
          <div className='flex gap-4 flex-wrap'>
            <div className="flex h-9 w-full sm:w-[calc(50%-8px)] md:w-56 items-center px-3 py-3 bg-white rounded border border-solid border-textBg-200 text-textBg-600">
              <Search size={20} className='mr-2 text-textBg-600' />
              <input
                type='text'
                placeholder='Search'
                value={searchTerm}
                onChange={handleSearch}
                className="w-full focus:outline-none text-sm lg:text-base"
              />
            </div>
            <select
              value={filterTeacher}
              onChange={handleFilter}
              className="h-9 w-full sm:w-[calc(50%-8px)] md:w-56 px-3 bg-white rounded border border-solid border-textBg-200 text-textBg-600 focus:outline-none lg:text-base"
            >
              <option>All Teachers</option>
              <option>Mr. Smith</option>
              <option>Ms. Johnson</option>
              <option>Dr. Brown</option>
            </select>
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

      <div className="grid grid-cols-1 gap-4">
        {filteredClasses.length > 0 ? (
          filteredClasses.map(cls => (
            <ClassCard
              key={cls.id}
              id={cls.id}
              name={cls.name}
              studentCount={cls.studentCount}
              teacher={cls.teacher}
            />
          ))
        ) : (
          <p className="text-textBg-900 text-lg">No classes found.</p>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} widthHeightClassname="max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-textBg-700">Create New Class</h2>
          <X size={24} className="hover:cursor-pointer" onClick={closeModal}/>
        </div>
        
        <CreateClassForm  onClose={closeModal}/>
      </Modal>
    </main>
  );
}


function CreateClassForm({ onSuccess, onClose }) {
  const [name, setName] = useState('');
  const [yearbook, setYearbook] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

//   const handleCreate = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch('http://localhost:3000/api/classes', { // Upewnij się, że endpoint jest poprawny
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({ name, yearbook, teacherId }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Nie udało się utworzyć klasy.');
//       }

//       // Po pomyślnym utworzeniu, odśwież listę klas
//       onSuccess();
//       onClose();
//     } catch (err) {
//       console.error('Błąd podczas tworzenia klasy:', err);
//       setError(err.message || 'Wystąpił błąd podczas tworzenia klasy.');
//     } finally {
//       setLoading(false);
//     }
//   };

  return (
    <form className="flex flex-col gap-6">
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex flex-col gap-2">
        <label className="text-base text-textBg-700" htmlFor="name">Exam Title</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
          placeholder="IA"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-base text-textBg-700" htmlFor="yearbook">Yearbook</label>
        <input
          id="yearbook"
          type="text"
          value={yearbook}
          onChange={(e) => setYearbook(e.target.value)}
          required
          className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
          placeholder="2024/2025"
        />
      </div>
      <div className="flex flex-col gap-2 mb-2">
        <label className="text-base text-textBg-700" htmlFor="name">Teacher</label>
        <select
          className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-500"
        >
          <option disabled hidden className="text-textBg-500">Select Teacher</option>
          <option className="text-textBg-900">Mr. Smith</option>
          <option className="text-textBg-900">Ms. Johnson</option>
          <option className="text-textBg-900">Dr. Brown</option>
        </select>
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
        //   onClick={handleCreate}
        />
      </div>
    </form>
  );
}