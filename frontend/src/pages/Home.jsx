/* eslint-disable no-unused-vars */
import React from "react";
import PageTitle from '../components/PageTitle';
import Calendar from "../components/Calendar";
import ExamCard from "../components/ExamCard";
import {Atom, Calculator, ChevronRight, CircleAlert, Dna, SquareSigma} from 'lucide-react'
import GradeCard from "../components/GradeCard";
import AttendanceChart from "../components/BarChart";
import HomeworkCard from "../components/HomeworkCard";

export function Home() {
  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Home"/>
        <div className="flex justify-between border border-solid rounded border-textBg-200 p-6 sm:p-8 gap-8">
          
          <div className="flex flex-col w-full justify-between">
            <div className="flex gap-16 w-full h-fit">
              <div className="w-fit">
                <p className="text-textBg-700 font-bold text-2xl mb-6">Upcoming Exams</p>
                <div className="flex flex-col gap-4 mb-4">
                  <ExamCard title="Physics" date="20 Nov 2023 | 10.00 AM" className="bg-[#d3cafa]" icon={<Atom size={40} color="#7051EE"/>}/>
                  <ExamCard title="Biology" date="20 Nov 2023 | 10.00 AM" className="bg-[#b8f5cd]" icon={<Dna size={40} color="#1dd75b"/>}/>
                  <ExamCard title="Math" date="20 Nov 2023 | 10.00 AM" className="bg-[#bbe1fa]" icon={<SquareSigma size={40} color="#1A99EE"/>}/>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-textBg-700 text-sm hover:cursor-pointer">See More</p>
                  <ChevronRight color="#323743" size={20}/>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-8 flex-grow">
                <div>
                  <p className="text-textBg-700 font-bold text-2xl mb-6">Last Grades</p>
                  <div className="flex w-full gap-4">
                    <GradeCard title="Physics" subtitle="Second Exam" grade={4} bgColor="bg-[#f1f9fe]" textColor="text-[#1A99EE]" />
                    <GradeCard title="Math" subtitle="Second Exam" grade={5} bgColor="bg-[#f1f9fe]" textColor="text-[#1A99EE]" />
                    <GradeCard title="Biology" subtitle="Second Exam" grade={3} bgColor="bg-[#f1f9fe]" textColor="text-[#1A99EE]" />
                  </div>
                </div>

                <div className="flex gap-16">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-textBg-700 font-bold text-2xl">Homework</p>
                      <p className="text-textBg-700 text-sm underline hover:cursor-pointer">See All Homework</p>
                    </div>
                    <HomeworkCard />
                  </div>

                  <div>
                    <p className="text-textBg-700 font-bold text-2xl mb-6">Study</p>
                    <div className="flex items-center justify-center border border-textBg-300 rounded px-6 py-3">
                      <p className="text-textBg-700 font-medium">103 days left</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-textBg-700 font-bold text-2xl">Homework</p>
              <AttendanceChart />
            </div>
          </div>
     
          <div className="flex justify-end ml-20">
            <Calendar />
          </div>
          
        </div>
    </main>
  );
}