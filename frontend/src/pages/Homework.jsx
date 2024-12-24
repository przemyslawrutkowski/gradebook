import React, { useState, useEffect, useMemo } from "react";
import PageTitle from '../components/PageTitle';
import HomeworkCard from '../components/HomeworkCard';
import { CheckCircle, Hourglass, XCircle } from 'lucide-react';
import { getUserId, getToken } from '../utils/UserRoleUtils';

export function Homework() {
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const studentId = getUserId();
  const token = getToken();

  const fetchHomeworks = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/homework/student/${studentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log(result.data);
      setHomeworks(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeworks();
  }, []);

  const categorizedHomeworks = useMemo(() => {
    const today = new Date();
    const categories = {
      completed: [],
      pending: [],
      notDone: []
    };

    homeworks.forEach(hw => {
      const deadline = new Date(hw.deadline);
      
      if (hw.isCompleted) {
        categories.completed.push(hw);
      } else if (deadline >= today) {
        categories.pending.push(hw);
      } else {
        categories.notDone.push(hw);
      }
    });

    return categories;
  }, [homeworks]);

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Homework"/>

      {error && <p className="text-red-500">{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && !error && (
        <div className="flex flex-col justify-between sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8 gap-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-8">
            <div className='flex items-center gap-2 w-full bg-[#eefdf3] p-4 rounded-md'>
              <CheckCircle className='text-green-500 mr-2' size={36} />
              <div>
                <p className='text-lg font-semibold'>{categorizedHomeworks.completed.length}</p>
                <p className='text-sm text-green-600'>Completed</p>
              </div>
            </div>
            
            <div className='flex items-center gap-2 w-full bg-[#fef9ed] p-4 rounded-md'>
              <Hourglass className='text-yellow-500 mr-2' size={36} />
              <div>
                <p className='text-lg font-semibold'>{categorizedHomeworks.pending.length}</p>
                <p className='text-sm text-yellow-600'>Pending</p>
              </div>
            </div>

            <div className='flex items-center gap-2 w-full bg-[#fdecea] p-4 rounded-md'>
              <XCircle className='text-red-500 mr-2' size={36} />
              <div>
                <p className='text-lg font-semibold'>{categorizedHomeworks.notDone.length}</p>
                <p className='text-sm text-red-600'>Not Done</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Pending</h2>
              {categorizedHomeworks.pending.length > 0 ? (
                categorizedHomeworks.pending.map(hw => (
                  <HomeworkCard
                    key={hw.id}
                    id={hw.id}
                    subject={hw.subject_name}  
                    title={hw.description}            
                    dueDate={hw.deadline}             
                    status={hw.isCompleted ? 'completed' : (new Date(hw.deadline) >= new Date() ? 'pending' : 'overdue')}
                  />
                ))
              ) : (
                <p className="text-textBg-900 text-lg">No pending homework.</p>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Not Done</h2>
              {categorizedHomeworks.notDone.length > 0 ? (
                categorizedHomeworks.notDone.map(hw => (
                  <HomeworkCard
                    key={hw.id}
                    id={hw.id}
                    subject={hw.subject_name}  
                    title={hw.description}            
                    dueDate={hw.deadline}             
                    status={hw.isCompleted ? 'completed' : (new Date(hw.deadline) >= new Date() ? 'pending' : 'overdue')}
                  />
                ))
              ) : (
                <p className="text-textBg-900 text-lg">No homework missed.</p>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Completed</h2>
              {categorizedHomeworks.completed.length > 0 ? (
                categorizedHomeworks.completed.map(hw => (
                  <HomeworkCard
                    key={hw.id}
                    id={hw.id}
                    subject={hw.subject_name}  
                    title={hw.description}            
                    dueDate={hw.deadline}             
                    status={hw.isCompleted ? 'completed' : (new Date(hw.deadline) >= new Date() ? 'pending' : 'overdue')}
                  />
                ))
              ) : (
                <p className="text-textBg-900 text-lg">No completed homework.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Homework;
