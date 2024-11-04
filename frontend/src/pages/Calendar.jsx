/* eslint-disable no-unused-vars */
import React from "react";
import PageTitle from '../components/PageTitle';
import CalendarMonth from "../components/CalendarMonth";

export function Calendar() {
  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Calendar"/>
      <div className="flex flex-col 2xl:flex-row justify-between sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8 gap-8 2xl:gap-16">
        <CalendarMonth />
      </div>
    </main>
  );
}
