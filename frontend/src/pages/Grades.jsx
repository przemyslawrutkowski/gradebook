/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import PageTitle from '../components/PageTitle';
import Button from "../components/Button";
import { getToken, getUserId } from '../utils/UserRoleUtils';
import Tooltip from '../components/Tooltip';
import { Info } from 'lucide-react';

export function Grades() {
  const [semester, setSemester] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = getToken();
  const studentId = getUserId();

  const handleSemesterChange = (sem) => {
    setSemester(sem);
    setSelectedSubject("");
  };

  const [semestersList, setSemesters] = useState([]);

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

  const fetchGrades = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/grade/${studentId}`, {
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
      console.log(result.data);

      const gradesWithSemester = result.data.map(grade => ({
        ...grade,
        semester: determineSemester(grade.date_given)
      }));

      setGrades(gradesWithSemester);
    } catch (err) {
      console.error('Error fetching grades:', err);
      setError(err.message || 'Failed to fetch grades. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesters = async () => {
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
      console.log(result.data);
      setSemesters(result.data);
    } catch (err) {
      console.error('Error fetching semesters:', err);
      setError(err.message || 'Failed to fetch semesters. Please try again later.');
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, [studentId, token]);

  useEffect(() => {
    if (semestersList.length > 0) {
      fetchGrades();
    }
  }, [semestersList, studentId, token]);

  const gradesBySemester = useMemo(() => grades.filter(grade => grade.semester === semester), [grades, semester]);

  const subjects = useMemo(() => Array.from(new Set(gradesBySemester.map((item) => item.subject))), [gradesBySemester]);

  const filteredGrades = useMemo(() => selectedSubject
    ? gradesBySemester.filter((item) => item.subject === selectedSubject)
    : gradesBySemester, [gradesBySemester, selectedSubject]);

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
    console.log(group);
    return Object.values(group);
  }, [filteredGrades]);

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
      <div className="flex flex-col 2xl:flex-row justify-between sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8 gap-8 2xl:gap-16">
        <div className="w-full">
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-textBg-700 text-2xl font-semibold">Select a subject</p>
            </div>
            <div className='flex items-center'>
              {semestersList.map((sem) => (
                <Button
                  key={sem.id}
                  size="s"
                  text={`Semester ${sem.semester}`}
                  type={semester === sem.id ? "primary" : "link"}
                  className="min-w-[6rem] no-underline mr-2"
                  onClick={() => handleSemesterChange(sem.id)}
                />
              ))}
            </div>
          </div>

          {/* <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject, index) => (
                <Button
                  key={index}
                  size="s"
                  text={subject}
                  type={selectedSubject === subject ? "primary" : "secondary"}
                  onClick={() => setSelectedSubject(subject)}
                />
              ))}
              {selectedSubject && (
                <Button
                  size="s"
                  text="Clear"
                  type="link"
                  onClick={() => setSelectedSubject("")}
                />
              )}
            </div>
          </div> */}

          <div className="grid gap-4 sm:grid-cols-1">
            {filteredGrades.length > 0 ? (
              <div className='w-full flex flex-col gap-2'>
                {groupedGrades.map(({subject, grades}) =>(
                  <div key={grades[0].subject_id} className='flex items-center justify-between py-2'>
                    <div className='flex items-center gap-4'>
                      <span className='font-medium text-lg'>{subject}</span>
                    </div>
                    <div className='flex gap-4'>
                      {grades.map((grade) => (
                        <div
                          key={grade.id}
                          className={`flex items-center gap-1`}
                        >
                          <Tooltip content={
                            <div className='w-fit p-2'>
                              <div className='flex flex-col gap-1'>
                                <div className='flex gap-2'>
                                  <p className='font-semibold'>Date Given:</p>
                                  <p>{new Date(grade.date_given).toLocaleDateString()}</p>
                                </div>
                                <div className='flex gap-2'>
                                  <p className='font-semibold'>Description:</p>
                                  <p>{grade.description}</p>
                                </div>
                                <div className='flex gap-2'>
                                  <p className='font-semibold'>Teacher:</p>
                                  <p>{`${grade.teacher_first_name} ${grade.teacher_last_name}`}</p>
                                </div>
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
                  </div>
                ))}
              </div> 
            ) : (
              <p className='text-textBg-500'>No grades records.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Grades;
