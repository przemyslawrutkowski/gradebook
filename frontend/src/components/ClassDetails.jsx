import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from '../components/PageTitle';
import Button from "../components/Button";
import classesData from '../data/classesData';
import studentsData from '../data/studentsData';
import Tag from "./Tag";
import { GraduationCap, Mail, MessageCircle, Pen, Phone, Plus, Trash, User, Users } from "lucide-react";

function ClassDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const classId = parseInt(id);
  const selectedClass = classesData.find(cl => cl.id === classId);

  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState("");

  useEffect(() => {
    if (selectedClass) {
      setClassInfo(selectedClass);
      const classStudents = studentsData.filter(student => student.classId === classId);
      setStudents(classStudents);
    }
  }, [selectedClass, classId]);

  const handleAddStudent = () => {
    if (newStudent.trim() === "") return;
    const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    const student = { id: newId, name: newStudent, classId: classId };
    setStudents([...students, student]);
    setClassInfo(prev => ({ ...prev, studentCount: prev.studentCount + 1 }));
    setNewStudent("");
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

        <p className="text-lg text-textBg-700 font-medium mb-4">Students List ({students.length})</p>

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
    </main>
  );
}

export default ClassDetails;
