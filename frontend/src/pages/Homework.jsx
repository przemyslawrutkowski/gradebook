import React, { useMemo } from "react";
import PageTitle from '../components/PageTitle';
import HomeworkCard from '../components/HomeworkCard';
import { CheckCircle, Hourglass, XCircle } from 'lucide-react';
import homeworkData from '../data/homeworkData';

export function Homework() {
  const today = new Date();

  const completedCount = homeworkData.filter(hw => hw.status === 'completed').length;
  const pendingCount = homeworkData.filter(hw => hw.status === 'pending').length;
  const overdueCount = homeworkData.filter(hw => hw.status === 'overdue').length;

  const completedHomework = homeworkData.filter(hw => hw.status === 'completed');
  const pendingHomework = homeworkData.filter(hw => hw.status === 'pending');
  const notDoneHomework = homeworkData.filter(hw => hw.status === 'overdue');

  const sortedPendingHomework = useMemo(() => {
    return [...pendingHomework].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [pendingHomework]);

  const sortedNotDoneHomework = useMemo(() => {
    return [...notDoneHomework].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [notDoneHomework]);

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Homework"/>

      <div className="flex flex-col justify-between sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8 gap-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className='flex items-center gap-2 bg-[#eefdf3] p-4 rounded-md'>
            <CheckCircle className='text-green-500 mr-2' size={36} />
            <div>
              <p className='text-lg font-semibold'>{completedCount}</p>
              <p className='text-sm text-green-600'>Completed</p>
            </div>
          </div>
          
          <div className='flex items-center gap-2 bg-[#fef9ed] p-4 rounded-md'>
            <Hourglass className='text-yellow-500 mr-2' size={36} />
            <div>
              <p className='text-lg font-semibold'>{pendingCount}</p>
              <p className='text-sm text-yellow-600'>Pending</p>
            </div>
          </div>

          <div className='flex items-center gap-2 bg-[#fdecea] p-4 rounded-md'>
            <XCircle className='text-red-500 mr-2' size={36} />
            <div>
              <p className='text-lg font-semibold'>{overdueCount}</p>
              <p className='text-sm text-red-600'>Not Done</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Pending</h2>
            {sortedPendingHomework.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {sortedPendingHomework.map(hw => {
                  const dueDate = new Date(hw.dueDate);
                  
                  const timeDiff = dueDate - today;
                  const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

                  let urgency = 'normal';
                  if (dayDiff < 7 && dayDiff >= 0) {
                    urgency = 'urgent';
                  }

                  return (
                    <HomeworkCard
                      key={hw.id}
                      id={hw.id}
                      subject={hw.subject}
                      title={hw.title}
                      dueDate={hw.dueDate}
                      status={hw.status}
                      urgency={urgency}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-textBg-500">No pending homework!</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Not Done</h2>
            {sortedNotDoneHomework.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {sortedNotDoneHomework.map(hw => (
                  <HomeworkCard
                    key={hw.id}
                    id={hw.id} 
                    subject={hw.subject}
                    title={hw.title}
                    dueDate={hw.dueDate}
                    status={hw.status}
                    urgency="overdue"
                  />
                ))}
              </div>
            ) : (
              <p className="text-textBg-500">No overdue homework!</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Completed</h2>
            {completedHomework.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {completedHomework.map(hw => (
                  <HomeworkCard
                    key={hw.id}
                    id={hw.id}
                    subject={hw.subject}
                    title={hw.title}
                    dueDate={hw.dueDate}
                    status={hw.status}
                  />
                ))}
              </div>
            ) : (
              <p className="text-textBg-500">No completed homework!</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Homework;
