/* eslint-disable no-unused-vars */
import React from "react";
import PageTitle from '../components/PageTitle';
import ExamCard from "../components/ExamCard";
import {Atom, Calculator, ChevronRight, CircleAlert, Dna, SquareSigma} from 'lucide-react';
import GradeCard from "../components/GradeCard";
import AttendanceChart from "../components/BarChart";
import HomeworkCard from "../components/HomeworkCard";
import DashboardSchedule from "../components/DashboardSchedule";

export function Home() {
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
              <div className="flex items-center justify-center gap-2 pt-2 lg:pt-0">
                <p className="text-textBg-700 text-sm hover:cursor-pointer">See More</p>
                <ChevronRight color="#323743" size={20}/>
              </div>
            </div>

            {/* Last Grades and Homework */}
            <div className="flex flex-col flex-grow gap-8">
              {/* Last Grades */}
              <div>
                <p className="text-textBg-700 font-bold text-2xl mb-6">Last Grades</p>
                <div className="flex flex-col sm:flex-row w-full gap-4">
                  <GradeCard title="Physics" subtitle="Second Exam" grade={4} bgColor="bg-[#f1f9fe]" textColor="text-[#1A99EE]" />
                  <GradeCard title="Math" subtitle="Second Exam" grade={5} bgColor="bg-[#f1f9fe]" textColor="text-[#1A99EE]" />
                  <GradeCard title="Biology" subtitle="Second Exam" grade={3} bgColor="bg-[#f1f9fe]" textColor="text-[#1A99EE]" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-8">
                {/* Homework */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-textBg-700 font-bold text-2xl">Homework</p>
                    <p className="text-textBg-700 text-sm underline hover:cursor-pointer">See All Homework</p>
                  </div>
                  <HomeworkCard />
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Chart */}
          <div className="">
            <p className="text-textBg-700 font-bold text-2xl">Attendance</p>
            <AttendanceChart />
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
