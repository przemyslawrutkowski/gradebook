import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from '../components/PageTitle';
import Button from "../components/Button";
import { Trash, X, Plus } from "lucide-react";
import Modal from '../components/Modal';
import Select from 'react-select';
import StudentCard from "../components/StudentCard";
import { getToken } from "../utils/UserRoleUtils";
import ConfirmDeletionForm from "../components/forms/ConfirmDeletionForm";
import { validate as validateUUID } from 'uuid'; 

function ClassDetails() {
  const { id } = useParams();
  const token = getToken();
  const navigate = useNavigate();

  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClassDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/class/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        }
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const result = await response.json();
      setClassInfo(result.data);
      setStudents(result.data.students);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
        const response = await fetch('http://localhost:3000/student', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const result = await response.json();
        const available = result.data.filter(student => student.class_name === "N/A");
        setAvailableStudents(available);
    } catch (err) {
        console.error('Error fetching available students', err);
    }
};

  useEffect(() => {
    fetchClassDetails();
    fetchAvailableStudents();
  }, [id]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudents([]);
  };

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) return;
  
    try {
      for (const student of selectedStudents) {
        const studentId = student.value;
        const response = await fetch(`http://localhost:3000/class/assign-student/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ studentId }),
        });
  
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
      }
  
      fetchClassDetails();
      fetchAvailableStudents();
      closeModal();
    } catch (err) {
      console.error('Error adding students', err);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
        const response = await fetch(`http://localhost:3000/class/unassign-student/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ studentId }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        await fetchClassDetails();
        await fetchAvailableStudents();
    } catch (err) {
        console.error('Error removing student from class', err);
    }
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

  const handleConfirmDeleteClass = async () => {
    if (!classToDelete) return;

    try {
        const response = await fetch(`http://localhost:3000/class/${classToDelete}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        navigate("/classes");
    } catch (err) {
        setError(err.message);
    } finally{
      closeDeleteModal();
    }
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!classInfo) {
    return <div>No class information available.</div>;
  }

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Class Details"/>
      <div className="flex flex-col justify-between sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8">
        <div className="flex justify-between mb-4">
            <p className="text-2xl text-textBg-900 font-semibold mb-4">Class {classInfo.class_names.name}</p>
            <Button type="link" text="Delete Class" onClick={() => openDeleteModal(id)}/>
        </div>

        <div className="flex justify-between items-center mb-4">
          <p className="text-lg text-textBg-700 font-medium">Students List ({classInfo.studentCount})</p>
          <Button text="Add Students" icon={<Plus size={18}/>} size="s" onClick={openModal}/>
        </div>
        
        {students.length > 0 ? (
        <div className="flex flex-col gap-3">
            {students.map(student => (
              <div key={student.id} >
                <StudentCard 
                  name={student.first_name + " " + student.last_name} 
                  phone={student.phone_number} 
                  email={student.email} 
                  pesel={student.pesel}
                  icon={<Trash />}
                  onClick={() => handleRemoveStudent(student.id)}
                />
              </div>
            ))}
        </div>
        ) : (
            <p>No students in this class.</p>
        )}       
        
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} widthHeightClassname="max-w-xl max-h-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-textBg-700">Add Students to Class</h2>
          <X size={24} className="hover:cursor-pointer" onClick={closeModal}/>
        </div>
        <div>
        <Select
          options={availableStudents.map((student) => ({ value: student.id, label: student.first_name + " " + student.last_name}))}
          onChange={(selected) => { setSelectedStudents(selected)}}
          isMulti
          placeholder="Select students to add"
          className="w-full mb-4"
          getOptionLabel={(e) => e.label}
          getOptionValue={(e) => e.value}
        />
          <div className="mt-6 flex justify-end gap-4">
            <Button text="Cancel" type="secondary" onClick={closeModal} />
            <Button text="Add" type="primary" onClick={handleAddStudents} />
          </div>
        </div>
      </Modal>

      <ConfirmDeletionForm
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDeleteClass}
        title="Confirm Deletion"
        description="Are you sure you want to delete this class? This action is irreversible."
      />

    </main>
  );
}

export default ClassDetails;
