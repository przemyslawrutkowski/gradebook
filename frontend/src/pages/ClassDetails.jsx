import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from '../components/PageTitle';
import Button from "../components/Button";
import classesData from '../data/classesData';
import studentsData from '../data/studentsData';
import { GraduationCap, Mail, MessageCircle, Pen, Phone, Plus, Trash, User, Users, X } from "lucide-react";
import Modal from '../components/Modal'; // Upewnij się, że masz komponent Modal
import Select from 'react-select';

function ClassDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const classId = parseInt(id);
  const selectedClass = classesData.find(cl => cl.id === classId);

  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    if (selectedClass) {
      setClassInfo(selectedClass);
      const classStudents = studentsData.filter(student => student.classId === classId);
      setStudents(classStudents);
    }
  }, [selectedClass, classId]);

  useEffect(() => {
    // Filtruj studentów, którzy nie są jeszcze w klasie
    const available = studentsData.filter(student => student.classId !== classId);
    setAvailableStudents(available);
  }, [classId]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudents([]);
  };

  const handleAddStudents = () => {
    if (selectedStudents.length === 0) return;

    const newStudents = selectedStudents.map(student => ({
      ...student.value,
      classId: classId
    }));

    setStudents([...students, ...newStudents]);
    setClassInfo(prev => ({ ...prev, studentCount: prev.studentCount + newStudents.length }));
    closeModal();
  };

  const handleRemoveStudent = (studentId) => {
    const updatedStudents = students.filter(s => s.id !== studentId);
    setStudents(updatedStudents);
    setClassInfo(prev => ({ ...prev, studentCount: prev.studentCount - 1 }));
  };

  if (!classInfo) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Class Details"/>
      <div className="flex flex-col justify-between sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8">
        <div className="flex justify-between mb-4">
            <p className="text-2xl text-textBg-900 font-semibold mb-4">Class {classInfo.name}</p>
            <p>{classInfo.teacher}</p>
        </div>

        <div className="flex justify-between items-center mb-4">
          <p className="text-lg text-textBg-700 font-medium">Students List ({students.length})</p>
          <Button text="Add Students" icon={<Plus size={18}/>} size="s" onClick={openModal}/>
        </div>
        
        {students.length > 0 ? (
        <div className="flex flex-col gap-3">
            {students.map(student => (
                <div
                    key={student.id}
                    className="flex justify-between items-center border border-textBg-200 hover:cursor-pointer rounded-lg p-3 w-full"
                >
                    <div className="flex flex-col gap-2 w-full">
                        <p className="text-base font-semibold text-textBg-700">{student.name}</p>
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 xl:gap-4 w-full">
                            <div className="flex text-textBg-500 gap-1 items-center">
                                <Mail size={16} strokeWidth={1.25} />
                                <p className="text-sm text-textBg-500 col-span-1 overflow-hidden whitespace-nowrap truncate">
                                    {student.email}
                                </p>
                            </div>
                            <div className="flex text-textBg-500 gap-1 items-center">
                                <Phone size={16} strokeWidth={1.25}/>
                                <p className="text-sm text-textBg-500 col-span-1">{student.phoneNumber}</p>
                            </div>
                            <div className="flex text-textBg-500 gap-1 items-center">
                                <User size={16} strokeWidth={1.25}/>
                                <p className="text-sm text-textBg-500 col-span-1">{student.pesel}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-textBg-700">
                        <Button type="link" size="s" icon={<Trash />} onClick={() => handleRemoveStudent(student.id)} />
                    </div>
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
            options={availableStudents.map((student) => ({ value: student, label: student.name }))}
            onChange={setSelectedStudents}
            isMulti
            placeholder="Select students to add"
            className="w-full mb-4"
          />
          
          <div className="mt-6 flex justify-end gap-4">
            <Button text="Cancel" type="secondary" onClick={closeModal} />
            <Button text="Add" type="primary" onClick={handleAddStudents} />
          </div>
        </div>
      </Modal>
    </main>
  );
}

export default ClassDetails;
