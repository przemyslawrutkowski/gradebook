import React, { useState, useMemo, useEffect } from "react";
import PageTitle from '../components/PageTitle';
import { Link } from 'react-router-dom';
import { Search } from "lucide-react";
import StudentCard from "../components/StudentCard";
import { getToken } from "../utils/UserRoleUtils";
import { toast } from "react-toastify";

export function Students() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = getToken();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/student', {
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
      setStudents(result.data);
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const filteredAndSortedStudents = useMemo(() => {
    const filtered = students.filter(student =>
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
      const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();

      if (sortOption === 'name-asc') {
        return nameA.localeCompare(nameB);
      } else if (sortOption === 'name-desc') {
        return nameB.localeCompare(nameA);
      } else {
        return 0;
      }
    });

    return sorted;
  }, [searchTerm, sortOption, students]);

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Students" />

      <div className="flex flex-col tn:flex-row items-center gap-4 mb-4">
        <div className="flex h-9 w-full md:w-64 items-center px-3 py-2 bg-white rounded border border-solid border-textBg-200 text-textBg-600">
          <Search size={20} className='mr-2 text-textBg-600' />
          <input
            type='text'
            placeholder='Search by name'
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full focus:outline-none lg:text-base placeholder:text-textBg-600"
          />
        </div>

        <select
          value={sortOption}
          onChange={handleSortChange}
          className="h-9 w-full md:w-56 px-3 bg-white rounded border border-solid border-textBg-200 text-textBg-600 focus:outline-none lg:text-base"
        >
          <option value="" disabled hidden>Sort By</option>
          <option value="name-asc">Student Name (A-Z)</option>
          <option value="name-desc">Student Name (Z-A)</option>
        </select>
      </div>  

      {loading && <p>Loading...</p>}

      {!loading && filteredAndSortedStudents.length === 0 && (
        <p className="text-gray-500">No students found.</p>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredAndSortedStudents.map(student => (
          <Link 
            to={`/students/${student.id}`} 
            key={student.id} 
            className="block"
          >
            <StudentCard
              id={student.id} 
              name={`${student.first_name} ${student.last_name}`} 
              phone={student.phone_number} 
              email={student.email} 
              pesel={student.pesel} 
              stClass={student.class_name || 'N/A'}
            />
          </Link>
        ))}
      </div>
    </main>
  );
}
