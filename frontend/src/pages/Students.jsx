import React, { useState, useMemo } from "react";
import PageTitle from '../components/PageTitle';
import studentsData from '../data/studentsData';
import classesData from '../data/classesData';
import { Link } from 'react-router-dom';
import { Mail, Phone, Search, Trash, User } from "lucide-react";
import StudentCard from "../components/StudentCard";

export function Students() {
  const [searchTerm, setSearchTerm] = useState('');

  const [sortOption, setSortOption] = useState('');

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const filteredAndSortedStudents = useMemo(() => {
    const filtered = studentsData.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'class-asc':
          {
            const classA = classesData.find(cls => cls.id === a.classId)?.name || '';
            const classB = classesData.find(cls => cls.id === b.classId)?.name || '';
            return classA.localeCompare(classB);
          }
        case 'class-desc':
          {
            const classA = classesData.find(cls => cls.id === a.classId)?.name || '';
            const classB = classesData.find(cls => cls.id === b.classId)?.name || '';
            return classB.localeCompare(classA);
          }
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return sorted;
  }, [searchTerm, sortOption, studentsData, classesData]);

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Students" />
      
      <div className='flex flex-col sm:flex-row gap-4 flex-wrap mb-6'>
        <div className="flex h-9 w-full sm:w-auto md:w-56 items-center px-3 py-2 bg-white rounded border border-solid border-textBg-200 text-textBg-600">
          <Search size={20} className='mr-2 text-textBg-600' />
          <input
            type='text'
            placeholder='Search by name'
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full focus:outline-none text-sm lg:text-base"
          />
        </div>

        <select
          value={sortOption}
          onChange={handleSortChange}
          className="h-9 w-full sm:w-auto md:w-56 px-3 bg-white rounded border border-solid border-textBg-200 text-textBg-600 focus:outline-none lg:text-base"
        >
          <option value="" disabled hidden>Sort By</option>
          <option value="class-asc">Class Name (A-Z)</option>
          <option value="class-desc">Class Name (Z-A)</option>
          <option value="name-asc">Student Name (A-Z)</option>
          <option value="name-desc">Student Name (Z-A)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredAndSortedStudents.map(student => {
          const studentClass = classesData.find(cls => cls.id === student.classId);
          return (
            <Link 
              to={`/students/${student.id}`} 
              key={student.id} 
              className="block"
            >
              <StudentCard 
                name={student.name} 
                phone={student.phoneNumber} 
                email={student.email} 
                pesel={student.pesel} 
                stClass={studentClass ? studentClass.name : 'N/A'}
              />
            </Link>
          );
        })}
      </div>
    </main>
  );
}
