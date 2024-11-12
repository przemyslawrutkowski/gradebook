/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import PageTitle from '../components/PageTitle';
import Button from "../components/Button";

const mockGrades = {
  1: [
    {
      subject: "Matematyka",
      grade: "5",
      date: "2024-03-15",
      reason: "Sprawdzian końcowy",
      teacher: "Pan Kowalski",
    },
    {
      subject: "Język Polski",
      grade: "4+",
      date: "2024-02-10",
      reason: "Kartkówka",
      teacher: "Pani Nowak",
    },
    {
      subject: "Historia",
      grade: "5-",
      date: "2024-01-20",
      reason: "Projekt grupowy",
      teacher: "Pan Wiśniewski",
    },
    {
      subject: "Biologia",
      grade: "4",
      date: "2024-03-05",
      reason: "Laboratorium",
      teacher: "Pani Zielińska",
    },
    {
      subject: "Fizyka",
      grade: "5",
      date: "2024-02-25",
      reason: "Egzamin",
      teacher: "Pan Lewandowski",
    },
  ],
  2: [
    {
      subject: "Matematyka",
      grade: "4",
      date: "2024-07-18",
      reason: "Sprawdzian",
      teacher: "Pan Kowalski",
    },
    {
      subject: "Język Polski",
      grade: "5",
      date: "2024-06-22",
      reason: "Esej",
      teacher: "Pani Nowak",
    },
    {
      subject: "Historia",
      grade: "4+",
      date: "2024-08-10",
      reason: "Prezentacja",
      teacher: "Pan Wiśniewski",
    },
    {
      subject: "Chemia",
      grade: "5-",
      date: "2024-07-30",
      reason: "Laboratorium",
      teacher: "Pani Kwiatkowska",
    },
    {
      subject: "Geografia",
      grade: "4",
      date: "2024-08-05",
      reason: "Kartkówka",
      teacher: "Pan Majewski",
    },
  ],
};

export function Grades() {
  const [semester, setSemester] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState("");

  const handleSemesterChange = (sem) => {
    setSemester(sem);
    setSelectedSubject("");
  };

  const subjects = Array.from(
    new Set(mockGrades[semester].map((item) => item.subject))
  );

  const filteredGrades = selectedSubject
    ? mockGrades[semester].filter((item) => item.subject === selectedSubject)
    : [];

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Grades" />
      <div className="flex flex-col 2xl:flex-row justify-between sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8 gap-8 2xl:gap-16">
        <div className="w-full">

          <div className="flex justify-between mb-4">
            <div>
              <p className="text-textBg-700 text-2xl font-semibold">Wybierz przedmiot</p>
            </div>
            <div className='flex items-center'>
              <Button
                size="s"
                text="Semestr 1"
                type={semester === 1 ? "primary" : "link"}
                className="min-w-[6rem] no-underline mr-2"
                onClick={() => handleSemesterChange(1)}
              />
              <Button
                size="s"
                text="Semestr 2"
                type={semester === 2 ? "primary" : "link"}
                className="min-w-[6rem] no-underline hidden md:block"
                onClick={() => handleSemesterChange(2)}
              />
            </div>
          </div>

          <div className="mb-6">
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
                  text="Wyczyść"
                  type="link"
                  onClick={() => setSelectedSubject("")}
                />
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGrades.length > 0 ? (
              filteredGrades.map((item, index) => (
                <div
                  key={index}
                  className="bg-white shadow-md rounded p-4 border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold mb-2">{item.subject}</h3>
                  <p><strong>Ocena:</strong> {item.grade}</p>
                  <p><strong>Data:</strong> {new Date(item.date).toLocaleDateString('pl-PL')}</p>
                  <p><strong>Za co:</strong> {item.reason}</p>
                  <p><strong>Nauczyciel:</strong> {item.teacher}</p>
                </div>
              ))
            ) : selectedSubject ? (
              <p className="text-textBg-700">Brak ocen dla wybranego przedmiotu.</p>
            ) : (
              <p className="text-textBg-700">Wybierz przedmiot, aby wyświetlić oceny.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
