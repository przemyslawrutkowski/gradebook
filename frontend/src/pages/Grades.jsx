/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import PageTitle from '../components/PageTitle';
import Button from "../components/Button";
import { getToken, getUserId, getUserRole } from '../utils/UserRoleUtils';
import Tooltip from '../components/Tooltip';
import { Edit, Info, Pen, Trash, User } from 'lucide-react';
import UserRoles from "../data/userRoles";
import Select from 'react-select';
import EditGradeForm from "../components/forms/grades/EditGradeForm";
import ConfirmForm from '../components/forms/ConfirmForm';
import { toast } from "react-toastify";
import FinalGradeForm from "../components/forms/grades/FinalGrade";

export function Grades() {
  const [semester, setSemester] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchedClasses, setFetchedClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [semestersList, setSemesters] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingGrade, setEditingGrade] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFinalGradeModalOpen, setIsFinalGradeModalOpen] = useState(false);  
  const [subjectIdFinalGrade, setSubjectIdFinalGrade] = useState(null);
  const [teacherIdFinalGrade, setTeacherIdFinalGrade] = useState(null);
  const [finalGrades, setFinalGrades] = useState([]);
  const [existingFinalGrade, setExistingFinalGrade] = useState(null);

  const [studentId, setStudentId] = useState(null);

  const parentId = getUserId();
  const token = getToken();
  const userRole = getUserRole();
  const currentUserId = getUserId();

  const fetchStudentForParent = async () => {
    try {
      const response = await fetch(`http://localhost:3000/student-parent/${parentId}/students`, {
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
      setStudentId(result.data);
    } catch (err) {
      console.error("Failed to fetch students for parent:", err.message);
      toast.error(err.message || 'An unexpected error occurred.');
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      if (userRole === UserRoles.Student) {
        const id = getUserId();
        setStudentId(id);
      } else if (userRole === UserRoles.Parent) {
        await fetchStudentForParent();
      }
    };

    initializeData();
  }, [userRole]);

  useEffect(() => {
    if (userRole === UserRoles.Student || userRole === UserRoles.Parent) {
      setSelectedStudent(studentId);
    }
  }, [userRole, studentId]);

  const handleSemesterChange = (sem) => {
    setSemester(sem);
  };

  const options = fetchedClasses.map(cls => ({
    value: cls.id,
    label: cls.class_names.name
  }));

  const handleChange = (selectedOption) => {
    if (userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) {
      setSelectedClass(selectedOption ? selectedOption.value : null);
    }
  };

  const selectedOption = options.find(option => option.value === selectedClass) || null;

  const handleStudentChange = (selectedOption) => {
    setSelectedStudent(selectedOption ? selectedOption.value : null);
  };

  const studentOptions = students.map(student => ({
    value: student.id,
    label: `${student.first_name} ${student.last_name}`
  }));

  const selectedStudentOption = studentOptions.find(option => option.value === selectedStudent) || null;

  const determineSemester = (date) => {
    const gradeDate = new Date(date);
    for (let sem of semestersList) {
      const start = new Date(sem.start_date);
      const end = new Date(sem.end_date);
      if (gradeDate >= start && gradeDate <= end) {
        return sem.id;
      }
    }
    return null;
  };

  const getCurrentSemester = () => {
    const now = new Date();
    for (let sem of semestersList) {
      const start = new Date(sem.start_date);
      const end = new Date(sem.end_date);
      if (now >= start && now <= end) {
        return sem.id;
      }
    }
    return semestersList.length > 0 ? semestersList[0].id : null;
  };

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
      setFetchedClasses(result.data);
    } catch(err){
      setError(err.message);
      toast.error(err.message || 'An unexpected error occurred.');
    } finally{
      setLoading(false);
    }
  };

  const fetchGrades = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/grade/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const result = await response.json();

      const gradesWithSemester = result.data.map(grade => ({
        ...grade,
        semester: determineSemester(grade.date_given)
      }));

      setGrades(gradesWithSemester);
    } catch (err) {
      setError(err.message || 'Failed to fetch grades. Please try again later.');
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesters = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/semester/by-school-year`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const result = await response.json();
      setSemesters(result.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch semesters. Please try again later.');
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStudentsFromClass = async () => {
    if (!selectedClass) {
      toast.error('Selected class is null. Skipping fetch.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3000/class/students/${selectedClass}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const result = await response.json();
      setStudents(result.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch students. Please try again later.');
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFinalGrades = async (studentId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/grade/final/${studentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
  
      const result = await response.json();
      setFinalGrades(result.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch final grades. Please try again later.');
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(userRole === UserRoles.Teacher || userRole === UserRoles.Administrator){
      fetchClasses();
    }
  }, [userRole, token]);

  useEffect(() => {
    if(userRole === UserRoles.Teacher || userRole === UserRoles.Administrator){
      if (selectedClass) {
        setSelectedStudent(null);
        fetchStudentsFromClass();
      }
    }
  }, [selectedClass, userRole, token]);

  useEffect(() => {
    fetchSemesters();
  }, [studentId, token]);

  useEffect(() => {
    if (semestersList.length > 0) {
      const idToFetch = (userRole === UserRoles.Student || userRole === UserRoles.Parent) ? studentId : selectedStudent;
      if (idToFetch) {
        fetchGrades(idToFetch);
        fetchFinalGrades(idToFetch);
      }
    }
  }, [semestersList, studentId, token, userRole, selectedStudent]);

  useEffect(() => {
    if (
      (userRole === UserRoles.Administrator || userRole === UserRoles.Teacher) &&
      fetchedClasses.length > 0 &&
      !selectedClass
    ) {
      setSelectedClass(fetchedClasses[0].id);
    }
  }, [userRole, fetchedClasses, selectedClass]);


  useEffect(() => {
    if (semestersList.length > 0) {
      const currentSem = getCurrentSemester();
      setSemester(currentSem);

    }
  }, [semestersList]);

  const openEditModal = (grade) => {
    setEditingGrade(grade);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingGrade(null);
    setIsEditModalOpen(false);
  };

  const openDeleteModal = (grade) => {
    setGradeToDelete(grade);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setGradeToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const openFinalGradeModal = (subjectId, teacherId, existingGrade = null) => {
    setSubjectIdFinalGrade(subjectId);
    setTeacherIdFinalGrade(teacherId);
    setExistingFinalGrade(existingGrade);
    setIsFinalGradeModalOpen(true);
  };
  const closeFinalGradeModal = () => {
    setSubjectIdFinalGrade(null);
    setTeacherIdFinalGrade(null);
    setExistingFinalGrade(null);
    setIsFinalGradeModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!gradeToDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/grade/${gradeToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      const data = await response.json();

      setGrades(prev => prev.filter(cls => cls.id !== gradeToDelete.id));
      toast.success(data.message || 'Grade deleted successfully.');
    } catch (err) {
      setError(err.message || 'Failed to delete grade.');
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      closeDeleteModal();
    }
  };

  const gradesBySemester = useMemo(() => grades.filter(grade => grade.semester === semester), [grades, semester]);

  const filteredGrades = useMemo(() => 
    gradesBySemester, [gradesBySemester]);

  const groupedGrades = useMemo(() => {
    const group = {};
    filteredGrades.forEach(grade => {
      const subjectId = grade.subject_id;
      if (!group[subjectId]) {
        group[subjectId] = {
          subject: grade.subject,
          grades: []
        };
      }
      group[subjectId].grades.push(grade);
    });
    return Object.values(group);
  }, [filteredGrades]);

  const groupedFinalGrades = useMemo(() => {
    const group = {};
    finalGrades.forEach(finalGrade => {
      const subjectId = finalGrade.subject_id;
      if (!group[subjectId]) {
        group[subjectId] = finalGrade;
      }
    });
    return group;
  }, [finalGrades]);

  const getGradeColor = (gradeValue) => {
    switch (true) {
      case gradeValue >= 6:
        return 'text-[#0e642a]'; 
      case gradeValue >= 5:
        return 'text-[#17a948]'; 
      case gradeValue >= 4:
        return 'text-[#856307]';
      case gradeValue >= 3:
        return 'text-[#c8950b]';  
      case gradeValue >= 2:
        return 'text-[#F5C747]';
      default:
        return 'text-primary-600';
    }
  };

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Grades" />
      {(userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) && (
        <div className='flex flex-col gap-4 sm:flex-row sm:gap-8 sm:items-center mb-6 mt-4 sm:mt-0'>
          <Select
            value={selectedOption}
            onChange={handleChange}
            options={options}
            placeholder="Select class"
            className='w-full sm:w-48 focus:outline-none focus:border-none'
            isSearchable
          />
          <Select
            value={selectedStudentOption}
            onChange={handleStudentChange}
            options={studentOptions}
            placeholder="Select student"
            className='w-full sm:w-48 focus:outline-none focus:border-none'
            isSearchable
            isDisabled={!selectedClass}
          />
        </div>
      )}
      <div className="flex flex-col 2xl:flex-row justify-between sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8 gap-8 2xl:gap-16">
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-textBg-700 text-2xl font-semibold">Your Grades</p>
            </div>
            <div className='hidden sm:flex items-center'>
              {semestersList.map((sem) => (
                <Button
                  key={sem.id}
                  size="s"
                  text={`Semester ${sem.semester}`}
                  type={semester === sem.id ? "primary" : "link"}
                  className="min-w-[6rem] no-underline"
                  onClick={() => handleSemesterChange(sem.id)}
                />
              ))}
            </div>

            <div className='sm:hidden flex items-center'>
              {semestersList.map((sem) => (
                <Button
                  key={sem.id}
                  size="s"
                  text={`Sem. ${sem.semester}`}
                  type={semester === sem.id ? "primary" : "link"}
                  className="min-w-[4rem] max-w-[6rem]"
                  onClick={() => handleSemesterChange(sem.id)}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-1">
            {filteredGrades.length > 0 ? (
              <div className='w-full flex flex-col'>
                {groupedGrades.map(({ subject, grades }) => {
                  const finalGrade = groupedFinalGrades[grades[0].subject_id];
                  
                  const isAuthorizedTeacher = 
                    userRole === UserRoles.Teacher && 
                    grades.some(grade => grade.teacher_id === currentUserId);

                  return (
                    <div key={grades[0].subject_id} className='flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-2'>
                      <div className='flex items-center gap-4'>
                        <span className='font-medium text-lg overflow-hidden text-ellipsis'>{subject}</span>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className='flex flex-wrap gap-2'>
                          {grades.map((grade) => (
                            <div
                              key={grade.id}
                              className={`flex items-center gap-1`}
                            >
                              <Tooltip content={
                                <div className='p-2'>
                                  <div className='flex flex-col gap-1'>
                                    <div className='flex gap-2'>
                                      <p className='font-semibold w-[72px]'>Description:</p>
                                      <p>{grade.description}</p>
                                    </div>
                                    <div className='flex gap-2'>
                                      <p className='font-semibold w-[72px]'>Weight:</p>
                                      <p>{grade.weight}</p>
                                    </div>
                                    <div className='flex gap-2'>
                                      <p className='font-semibold w-[72px]'>Date Given:</p>
                                      <p>{new Date(grade.date_given).toLocaleDateString()}</p>
                                    </div>
                                    <div className='flex gap-2'>
                                      <p className='font-semibold w-[72px]'>Teacher:</p>
                                      <p>{`${grade.teacher_first_name} ${grade.teacher_last_name}`}</p>
                                    </div>
                                    {(userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) && (
                                      <div className='flex'>
                                        <Button
                                          size="s"
                                          type="link"
                                          icon={<Pen size={16} color="#fff"/>}
                                          onClick={() => openEditModal(grade)}
                                          className="px-2 py-1"
                                        />
                                        <Button
                                          size="s"
                                          type="link" 
                                          icon={<Trash size={16} color="#fff"/>}
                                          onClick={() => openDeleteModal(grade)}
                                          className="px-2 py-1"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              } position="left">
                                <span
                                  className={`grid font-semibold place-items-center w-7 h-7 bg-textBg-150 rounded ${getGradeColor(grade.grade)} hover:cursor-pointer`}
                                >
                                  {grade.grade} 
                                </span>
                              </Tooltip>
                            </div>
                          ))}
                        </div>
                        

                        <Tooltip position="bottom">
                          <div
                            className={`w-8 h-8 font-bold text-xl bg-textBg-200 rounded grid place-items-center cursor-pointer ${
                              isAuthorizedTeacher ? 'hover:bg-textBg-250' : 'bg-gray-300 cursor-not-allowed'
                            }`}
                            title="Final Grade"
                            onClick={() => {
                              if (isAuthorizedTeacher) {
                                openFinalGradeModal(
                                  grades[0].subject_id, 
                                  currentUserId,
                                  finalGrade
                                );
                              }
                            }}
                          >
                            {finalGrade ? finalGrade.grade : "+"}
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div> 
            ) : (
              <p className='text-textBg-500'>No grades records.</p>
            )}
          </div>
        </div>
      </div>
      
      <FinalGradeForm
        isOpen={isFinalGradeModalOpen}
        onClose={closeFinalGradeModal}
        onSuccess={() => {
          fetchGrades(userRole === UserRoles.Student ? studentId : selectedStudent);
          fetchFinalGrades(userRole === UserRoles.Student ? studentId : selectedStudent);
          closeFinalGradeModal();
        }}
        studentId={selectedStudent}
        semesterId={semester}
        teacherId={teacherIdFinalGrade}
        subjectId={subjectIdFinalGrade}
        existingFinalGrade={existingFinalGrade}
      />

      {editingGrade && (
        <EditGradeForm
          grade={editingGrade}
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onSuccess={() => {
            fetchGrades(userRole === UserRoles.Student ? studentId : selectedStudent);
            closeEditModal();
          }}
        />
      )}

      {gradeToDelete && (
        <ConfirmForm
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleConfirmDelete}
          title="Confirm Deletion"
          description={`Are you sure you want to delete the grade "${gradeToDelete.description}"? This action is irreversible.`}
        />
      )}
    </main>
  );
}

export default Grades; 