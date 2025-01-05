import React, { useState, useEffect, useMemo } from "react"
import PageTitle from '../components/PageTitle'
import HomeworkCard from '../components/HomeworkCard'
import { CheckCircle, Hourglass, XCircle, Clock, User } from 'lucide-react'
import { getUserId, getToken, getUserRole } from '../utils/UserRoleUtils'
import UserRoles from "../data/userRoles"

export function Homework() {
  const [homeworks, setHomeworks] = useState([])
  const [loading, setLoading] = useState(false)
  const [teacherId, setTeacherId] = useState(null)
  const [error, setError] = useState(null)
  const [studentId, setStudentId] = useState(null)

  
  const parentId = getUserId();
  const userRole = getUserRole()
  const token = getToken()

  useEffect(() => {
    if(userRole === UserRoles.Student) {
      setStudentId(getUserId())
    } else if(userRole === UserRoles.Teacher) {
      setTeacherId(getUserId())
    }
  }, [userRole])

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

  const fetchStudentHomework = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`http://localhost:3000/homework/student/${studentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }
      const result = await response.json()
      setHomeworks(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeacherHomework = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`http://localhost:3000/homework/teacher/${teacherId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }
      const result = await response.json()
      setHomeworks(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdminHomework = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`http://localhost:3000/homework`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }
      const result = await response.json()
      setHomeworks(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if((userRole === UserRoles.Student || userRole === UserRoles.Parent) && studentId) {
      fetchStudentHomework()
    }
    if(userRole === UserRoles.Teacher && teacherId) {
      fetchTeacherHomework()
    }
    if(userRole === UserRoles.Administrator) {
      fetchAdminHomework()
    }
  }, [userRole, studentId, teacherId])

  const categorizedHomeworks = useMemo(() => {
    const today = new Date()
    const categories = {
      completed: [],
      pending: [],
      notDone: [],
      afterTime: [],
      current: [],
      all: []
    }

    homeworks.forEach(hw => {
      const deadline = new Date(hw.deadline)

      if(userRole === UserRoles.Student || userRole === UserRoles.Parent){
        if(hw.isCompleted) categories.completed.push(hw);
        if(deadline >= today) categories.pending.push(hw);
        if(deadline < today && !hw.isCompleted) categories.notDone.push(hw);
      }

      if(userRole === UserRoles.Teacher){
        if(deadline >= today) categories.current.push(hw);
        if(deadline < today) categories.afterTime.push(hw);
      }

      if(userRole === UserRoles.Administrator){
        categories.all.push(hw)
        if(hw.isCompleted) categories.completed.push(hw);
        if(deadline < today && !hw.isCompleted) categories.notDone.push(hw);
      }
    })
    return categories
  }, [homeworks, userRole])

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Homework"/>
      {error && <p className="text-red-500">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && !error && (
        <div className="flex flex-col justify-between sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8 gap-8">
          <div className="flex flex-col md:flex-row sm:justify-between sm:items-center mb-8 gap-4 xl:gap-8">
            {(userRole === UserRoles.Student || userRole === UserRoles.Parent) && (
              <>
                <div className='flex items-center gap-2 w-full bg-[#eefdf3] p-4 rounded-md'>
                  <CheckCircle className='text-green-500 mr-2' size={36} />
                  <div>
                    <p className='text-lg font-semibold'>
                      {categorizedHomeworks.completed.length}
                    </p>
                    <p className='text-sm text-green-600'>Completed</p>
                  </div>
                </div>
                <div className='flex items-center gap-2 w-full bg-[#fef9ed] p-4 rounded-md'>
                  <Hourglass className='text-yellow-500 mr-2' size={36} />
                  <div>
                    <p className='text-lg font-semibold'>
                      {categorizedHomeworks.pending.length}
                    </p>
                    <p className='text-sm text-yellow-600'>Pending</p>
                  </div>
                </div>
                <div className='flex items-center gap-2 w-full bg-[#fdecea] p-4 rounded-md'>
                  <XCircle className='text-red-500 mr-2' size={36} />
                  <div>
                    <p className='text-lg font-semibold'>
                      {categorizedHomeworks.notDone.length}
                    </p>
                    <p className='text-sm text-red-600'>Not Done</p>
                  </div>
                </div>
              </>
            )}

            {userRole === UserRoles.Teacher && (
              <>
                <div className='flex items-center gap-2 w-full bg-[#fef9ed] p-4 rounded-md'>
                  <Clock className='text-yellow-500 mr-2' size={36} />
                  <div>
                    <p className='text-lg font-semibold'>
                      {categorizedHomeworks.current.length}
                    </p>
                    <p className='text-sm text-yellow-500'>Pending</p>
                  </div>
                </div>
                <div className='flex items-center gap-2 w-full bg-[#fdecea] p-4 rounded-md'>
                  <CheckCircle className='text-red-500 mr-2' size={36} />
                  <div>
                    <p className='text-lg font-semibold'>
                      {categorizedHomeworks.afterTime.length}
                    </p>
                    <p className='text-sm text-red-600'>Overdue</p>
                  </div>
                </div>
              </>
            )}

            {userRole === UserRoles.Administrator && (
              <>
                <div className='flex items-center gap-2 w-full bg-blue-50 p-4 rounded-md'>
                  <User className='text-blue-500 mr-2' size={36} />
                  <div>
                    <p className='text-lg font-semibold'>
                      {categorizedHomeworks.all.length}
                    </p>
                    <p className='text-sm text-blue-600'>All Homeworks</p>
                  </div>
                </div>
                <div className='flex items-center gap-2 w-full bg-[#eefdf3] p-4 rounded-md'>
                  <CheckCircle className='text-green-500 mr-2' size={36} />
                  <div>
                    <p className='text-lg font-semibold'>
                      {categorizedHomeworks.completed.length}
                    </p>
                    <p className='text-sm text-green-600'>Completed</p>
                  </div>
                </div>
                <div className='flex items-center gap-2 w-full bg-[#fdecea] p-4 rounded-md'>
                  <XCircle className='text-red-500 mr-2' size={36} />
                  <div>
                    <p className='text-lg font-semibold'>
                      {categorizedHomeworks.notDone.length}
                    </p>
                    <p className='text-sm text-red-600'>Overdue</p>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-col gap-8">
            {(userRole === UserRoles.Student || userRole === UserRoles.Parent) && (
              <>
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
                  <h2 className="text-xl font-semibold mb-4">Completed</h2>
                  {categorizedHomeworks.completed.length > 0 ? (
                    categorizedHomeworks.completed.map(hw => (
                      <HomeworkCard
                        key={hw.id}
                        id={hw.id}
                        subject={hw.subject_name}
                        title={hw.description}
                        dueDate={hw.deadline}
                        status="completed"
                      />
                    ))
                  ) : (
                    <p className="text-textBg-900 text-lg">No completed homework.</p>
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
                        status="overdue"
                      />
                    ))
                  ) : (
                    <p className="text-textBg-900 text-lg">No homework missed.</p>
                  )}
                </div>
              </>
            )}
            {userRole === UserRoles.Teacher && (
              <>
                <div>
                  <h2 className="text-xl font-semibold mb-4">Pending</h2>
                  {categorizedHomeworks.current.length > 0 ? (
                    categorizedHomeworks.current.map(hw => (
                      <HomeworkCard
                        key={hw.id}
                        id={hw.id}
                        subject={hw.subject_name}
                        title={hw.description}
                        dueDate={hw.deadline}
                        status="pending"
                      />
                    ))
                  ) : (
                    <p className="text-textBg-900 text-lg">No pending homework.</p>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4">Overdue</h2>
                  {categorizedHomeworks.afterTime.length > 0 ? (
                    categorizedHomeworks.afterTime.map(hw => (
                      <HomeworkCard
                        key={hw.id}
                        id={hw.id}
                        subject={hw.subject_name}
                        title={hw.description}
                        dueDate={hw.deadline}
                        status="Overdue"
                      />
                    ))
                  ) : (
                    <p className="text-textBg-900 text-lg">No overdue homework.</p>
                  )}
                </div>
              </>
            )}

            {userRole === UserRoles.Administrator && (
              <>
                <div>
                  <h2 className="text-xl font-semibold mb-4">All Homeworks</h2>
                  {categorizedHomeworks.all.length > 0 ? (
                    categorizedHomeworks.all.map(hw => (
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
                    <p className="text-textBg-900 text-lg">No homework available.</p>
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
                        status="completed"
                      />
                    ))
                  ) : (
                    <p className="text-textBg-900 text-lg">No completed homework.</p>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4">Overdue</h2>
                  {categorizedHomeworks.notDone.length > 0 ? (
                    categorizedHomeworks.notDone.map(hw => (
                      <HomeworkCard
                        key={hw.id}
                        id={hw.id}
                        subject={hw.subject_name}
                        title={hw.description}
                        dueDate={hw.deadline}
                        status="overdue"
                      />
                    ))
                  ) : (
                    <p className="text-textBg-900 text-lg">No overdue homework.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

export default Homework
