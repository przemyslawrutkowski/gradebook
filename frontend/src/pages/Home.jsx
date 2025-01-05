/* eslint-disable no-unused-vars */
import React, {useState, useEffect} from "react";
import PageTitle from '../components/PageTitle';
import ExamCard from "../components/ExamCard";
import {Atom, ChevronRight,  Dna, SquareSigma} from 'lucide-react';
import GradeCard from "../components/GradeCard";
import AttendanceChart from "../components/BarChart";
import HomeworkCard from "../components/HomeworkCard";
import DashboardSchedule from "../components/DashboardSchedule";
import { Link } from "react-router-dom";
import { getToken, getUserId } from "../utils/UserRoleUtils";

export function Home() {
  const [latestHomework, setLatestHomework] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [latestGrades, setLatestGrades] = useState([]);

  const [loadingLatestHomework, setLoadingLatestHomework] = useState(false);
  const [errorLatestHomework, setErrorLatestHomework] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);
  const [latestGradesLoading, setLatestGradesLoading] = useState(false);
  const [latestGradesError, setLatestGradesError] = useState(null);

  const token = getToken();
  const studentId = getUserId();

  const fetchLatestHomework = async () => {
    setLoadingLatestHomework(true);
    setErrorLatestHomework(null);
    try {
      const response = await fetch(`http://localhost:3000/homework/latest/${studentId}`, {
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
      console.log(result.data);
      setLatestHomework(result.data);
    } catch (err) {
      setErrorLatestHomework(err.message); 
    } finally {
      setLoadingLatestHomework(false); 
    }
  };

  const fetchAttendanceData = async () => {
    setAttendanceLoading(true);
    setAttendanceError(null);
    try {
      const response = await fetch(`http://localhost:3000/attendance/statistics/${studentId}`, {
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
      console.log("Attendance Data:", result.data);
      const transformedData = transformAttendanceData(result.data);
      setAttendanceData(transformedData);
    } catch (err) {
      setAttendanceError(err.message);
    } finally {
      setAttendanceLoading(false);
    }
  };
  
  const transformAttendanceData = (data) => {
    const academicMonths = [
      'September', 'October', 'November', 'December',
      'January', 'February', 'March', 'April',
      'May', 'June'
    ];

    return academicMonths.map((month) => {
      const monthData = data[month] || { present: 0, late: 0, absent: 0 };
      const presence = monthData.present + monthData.late;
      const all = presence + monthData.absent;

      return {
        name: month.substring(0, 3),
        Presence: presence,
        All: all,
      };
    });
  };

  const fetchLatestGrades = async () => {
    setAttendanceLoading(true);
    setAttendanceError(null);
    try {
      const response = await fetch(`http://localhost:3000/grade/latest/${studentId}`, {
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
      console.log("Grades:", result.data);
      setLatestGrades(result.data);
    } catch (err) {
      setLatestGradesError(err.message);
    } finally {
      setLatestGradesLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestHomework();
    fetchAttendanceData();
    fetchLatestGrades();
  }, []);


  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Home"/>
      <div className="flex flex-col 2xl:flex-row justify-between sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8 gap-8 2xl:gap-16">
        <div className="flex flex-col w-full justify-between gap-8">
          <div className="flex flex-col lg:flex-row gap-8 2xl:gap-16 w-full">
            {/* Upcoming Exams */}
            <div className="lg:w-auto lg:flex-shrink-0">
              <p className="text-textBg-700 font-bold text-2xl mt-4 sm:mt-0 mb-6">Upcoming Exams</p>
              <div className="flex flex-wrap lg:flex-col gap-y-4 gap-x-8 mb-4">
                <ExamCard title="Physics" date="20 Nov 2023" time="10.00 AM" className="bg-[#d3cafa]" icon={<Atom size={40} color="#7051EE"/>}/>
                <ExamCard title="Biology" date="20 Nov 2023" time="10.00 AM" className="bg-[#b8f5cd]" icon={<Dna size={40} color="#1dd75b"/>}/>
                <ExamCard title="Math" date="20 Nov 2023" time="10.00 AM" className="bg-[#bbe1fa]" icon={<SquareSigma size={40} color="#1A99EE"/>}/>
              </div>
              <Link to={`/calendar`}>
                <div className="flex items-center justify-center gap-2 pt-2 lg:pt-0">
                  <p className="text-textBg-700 text-sm hover:cursor-pointer">See More</p>
                  <ChevronRight color="#323743" size={20}/>
                </div>
              </Link>
            </div>

            {/* Last Grades and Homework */}
            <div className="flex flex-col flex-grow gap-8">
              {/* Last Grades */}
              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-textBg-700 font-bold text-2xl mb-6">Last Grades</p>
                  <Link to={`/grades`}>
                    <p className="text-textBg-700 text-sm underline hover:cursor-pointer">See All Grades</p>
                  </Link>
                </div>
                <div className="flex flex-col sm:flex-row w-full gap-4">
                  {latestGrades.map((grade, index) => {
                    return (
                      <div key={grade.id} className="w-full">
                        <GradeCard 
                          title={grade.description} 
                          subtitle={grade.description} 
                          grade={grade.grade}
                          bgColor="bg-[#f1f9fe]"
                          textColor="text-[#1A99EE]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-8">
                {/* Homework */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-textBg-700 font-bold text-2xl">Homework</p>
                    <Link to={`/homework`}>
                      <p className="text-textBg-700 text-sm underline hover:cursor-pointer">See All Homework</p>
                    </Link>
                  </div>
                  {loadingLatestHomework ? (
                    <p>Loading homework...</p>
                  ) : errorLatestHomework ? (
                    <p className="text-red-500">Error: {errorLatestHomework}</p>
                  ) : latestHomework ? (                  
                      <HomeworkCard 
                        key={latestHomework.id} 
                        id={latestHomework.id} 
                        subject={latestHomework.subject_name} 
                        title={latestHomework.description} 
                        dueDate={latestHomework.deadline}
                      />
                  ) : (
                    <p>No homework available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Chart */}
          <div className="">
            <p className="text-textBg-700 font-bold text-2xl">Attendance</p>
            {attendanceLoading ? (
              <p>Loading attendance data...</p>
            ) : attendanceError ? (
              <p className="text-red-500">Error: {attendanceError}</p>
            ) : attendanceData.length > 0 ? (
              <AttendanceChart data={attendanceData} />
            ) : (
              <p>No attendance data available.</p>
            )}
          </div>
        </div>

        {/* Calendar */}
        <div className="flex justify-end">
          <DashboardSchedule />
        </div>
      </div>
    </main>
  );
}
