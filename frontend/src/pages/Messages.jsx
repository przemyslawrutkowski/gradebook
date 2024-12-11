import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import io from "socket.io-client";
import PageTitle from '../components/PageTitle';
import { Search, Send, User } from "lucide-react";
import Button from "../components/Button";
import { getToken, getUserId, getUserRole, decodeToken } from "../utils/UserRoleUtils";
import UserRoles from '../data/userRoles';
import '../customCSS/customScrollbar.css';

const API_URL = 'http://localhost:3000';

export function Messages() {
  const [token, setToken] = useState(getToken());
  const [currentUser, setCurrentUser] = useState(decodeToken(getToken()));

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [recentConversations, setRecentConversations] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [usersToSearch, setUsersToSearch] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [userTypes, setUserTypes] = useState([]);
  const [administrators, setAdministrators] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages, scrollToBottom]);

  useEffect(() => {
    if (token) {
      setCurrentUser(decodeToken(token));
    } else {
      setCurrentUser(null);
    }
  }, [token]);

  const fetchUserTypes = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/user-type`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      setUserTypes(result.data);
    } catch (err) {
      console.error("Error fetching user types:", err);
      setError(err.message);
    }
  }, [token]);

  const fetchUsers = useCallback(async (url) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      console.error(`Error fetching users from ${url}:`, err);
      setError(err.message);
      return [];
    }
  }, [token]);

  const fetchConversationMessages = useCallback(async (interlocutorId) => {
    try {
      const response = await fetch(`${API_URL}/message/${interlocutorId}`, {
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
      const messages = result.data;

      const sortedMessages = messages.sort((msg1, msg2) => new Date(msg1.date_time) - new Date(msg2.date_time));
      return sortedMessages;
    } catch (err) {
      console.error("Error fetching conversation messages:", err);
      setError(err.message);
      return [];
    }
  }, [token]);

  const fetchUnreadMessages = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/message/unread`, {
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
      setUnreadMessages(result.data);
    } catch (err) {
      console.error("Error fetching unread messages:", err);
      setError(err.message);
    }
  }, [token]);

  const fetchRecentConversations = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/message/recent`, {
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
      const messages = result.data;

      const sortedMessages = messages.sort((msg1, msg2) => new Date(msg2.date_time) - new Date(msg1.date_time));
      setRecentConversations(sortedMessages);
    } catch (err) {
      console.error("Error fetching recent conversations:", err);
      setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        if (currentUser.id) {
          socketRef.current = io(API_URL, {
            auth: { token }
          });

          socketRef.current.on("connect", () => {
            socketRef.current.emit("join", currentUser.id);
          });

          socketRef.current.on("receive_message", async (message) => {
            if (selectedConversation && (selectedConversation.interlocutor.id === message.receiver_id || selectedConversation.interlocutor.id === message.sender_id)) {
              setSelectedConversation(prev => ({
                ...prev,
                messages: [...prev.messages, message]
              }));
            } else {
              setUnreadMessages(prev => [message, ...prev]);
            }

            await fetchRecentConversations();
          });

          socketRef.current.on("error", (errorMessage) => {
            console.error('Socket error:', errorMessage);
            setError(errorMessage);
          });

          await fetchUserTypes();

          const [fetchedAdministrators, fetchedTeachers, fetchedParents, fetchedStudents] = await Promise.all([
            fetchUsers(`${API_URL}/administrator`),
            fetchUsers(`${API_URL}/teacher`),
            fetchUsers(`${API_URL}/parent`),
            fetchUsers(`${API_URL}/student`),
          ]);

          setAdministrators(fetchedAdministrators);
          setTeachers(fetchedTeachers);
          setParents(fetchedParents);
          setStudents(fetchedStudents);

          const combinedUsers = [
            ...fetchedAdministrators,
            ...fetchedTeachers,
            ...fetchedParents,
            ...fetchedStudents,
          ];
          setUsersToSearch(combinedUsers);

          await fetchUnreadMessages();
          await fetchRecentConversations();
        } else {
          throw new Error("User ID is not available.");
        }
      } catch (err) {
        console.error('Error initializing component:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [
    token,
    currentUser,
    fetchUserTypes,
    fetchUsers,
    fetchUnreadMessages,
    fetchRecentConversations,
    selectedConversation
  ]);


  const handleUserSelect = useCallback(async (interlocutor) => {
    try {
      const messages = await fetchConversationMessages(interlocutor.id);
      setSelectedConversation({
        interlocutor: interlocutor,
        messages: messages
      });
    } catch (err) {
      console.error("Error selecting user:", err);
      setError(err.message);
    }
  }, [fetchConversationMessages]);

  const findUserTypeId = useCallback((role) => {
    const userType = userTypes.find(userType => userType.name === role);
    return userType ? userType.id : null;
  }, [userTypes]);

  const findUserTypeName = useCallback((userTypeId) => {
    const userType = userTypes.find(userType => userType.id === userTypeId);
    return userType ? userType.name : null;
  }, [userTypes]);

  const findInterlocutor = useCallback((interlocutorId, userTypeId) => {
    const interlocutorUserTypeName = findUserTypeName(userTypeId);
    let interlocutor = null;

    switch (interlocutorUserTypeName) {
      case UserRoles.Administrator:
        interlocutor = administrators.find(administrator => administrator.id === interlocutorId);
        break;
      case UserRoles.Teacher:
        interlocutor = teachers.find(teacher => teacher.id === interlocutorId);
        break;
      case UserRoles.Parent:
        interlocutor = parents.find(parent => parent.id === interlocutorId);
        break;
      case UserRoles.Student:
        interlocutor = students.find(student => student.id === interlocutorId);
        break;
      default:
        break;
    }

    return interlocutor;
  }, [findUserTypeName, administrators, teachers, parents, students]);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !selectedConversation) return;

    const senderTypeId = findUserTypeId(currentUser.role);
    const receiverTypeId = findUserTypeId(selectedConversation.interlocutor.role);

    if (!senderTypeId || !receiverTypeId) {
      setError("Invalid sender or receiver type.");
      return;
    }

    const messageData = {
      subject: "New Message",
      content: newMessage,
      senderId: currentUser.id,
      senderTypeId: senderTypeId,
      receiverId: selectedConversation.interlocutor.id,
      receiverTypeId: receiverTypeId
    };

    try {
      socketRef.current.emit("send_message", messageData);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    }
  }, [newMessage, selectedConversation, findUserTypeId, currentUser.role, currentUser.id]);

  const filteredUsers = useMemo(() => {
    return usersToSearch.filter(user =>
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [usersToSearch, searchTerm]);

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8 flex flex-col">
      <PageTitle text="Messages" />
      <div className="w-full h-max flex flex-col xl:flex-row gap-8">
        <div className="w-full h-full xl:w-fit bg-white border border-solid border-textBg-200 rounded p-8 flex flex-col">
          <div className="relative">
            <div className="h-9 flex items-center px-3 py-3 bg-white rounded border border-solid border-textBg-300 text-textBg-700 mb-4">
              <Search size={16} className='mr-2 text-textBg-700' />
              <input
                type='text'
                placeholder='Search by name'
                className="w-full xl:w-80 focus:outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {searchTerm && filteredUsers.length > 0 && (
              <div className="absolute left-0 right-0 bg-textBg-100 border border-textBg-200 rounded -mt-4 max-h-92 overflow-y-auto z-10">
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center p-2 hover:bg-textBg-200 cursor-pointer"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-textBg-300 mr-2">
                      <User size={16} className="text-textBg-700" />
                    </div>
                    <span className="text-sm text-gray-700">
                      {`${user.first_name} ${user.last_name}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {recentConversations.length > 0 ? (
              recentConversations.map((msg) => {
                const isLastMessageFromCurrentUser = msg.sender_id === currentUser.id;

                const interlocutorId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
                const userTypeId = msg.sender_id === currentUser.id ? msg.receiver_type_id : msg.sender_type_id;
                const interlocutor = findInterlocutor(interlocutorId, userTypeId);

                if (!interlocutor) {
                  return null;
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex items-center py-2 px-3 mb-2 rounded cursor-pointer ${(selectedConversation?.interlocutor.id === interlocutorId) ? 'bg-textBg-100' : 'hover:bg-textBg-200'}`}
                    onClick={() => handleUserSelect(interlocutor)}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-500 mr-3">
                      <User size={20} className="text-textBg-100" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-textBg-900">{`${interlocutor.first_name} ${interlocutor.last_name}`
                        }</span>
                        <span className="text-xs text-textBg-600">
                          {new Date(msg.date_time).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-textBg-600 truncate hidden sm:block">
                        {isLastMessageFromCurrentUser ? `You: ${msg.content.length > 32
                          ? `${msg.content.slice(0, 32)}...`
                          : msg.content}`
                          : msg.content.length > 32
                            ? `${msg.content.slice(0, 32)}...`
                            : msg.content}
                      </div>
                      <div className="text-sm text-textBg-600 truncate block sm:hidden">
                        {isLastMessageFromCurrentUser ? `You: ${msg.content.length > 20
                          ? `${msg.content.slice(0, 20)}...`
                          : msg.content}`
                          : msg.content.length > 20
                            ? `${msg.content.slice(0, 20)}...`
                            : msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500 text-sm text-center mt-4">
                No recent conversations found.
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-white border border-solid border-textBg-200 rounded p-4 flex flex-col h-[48rem]">
          {selectedConversation ? (
            <>
              <div className="flex items-center mb-4 border-b pb-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-500 mr-3">
                  <User size={20} className="text-textBg-100" />
                </div>
                <h2 className="text-lg font-medium text-textBg-700">{`${selectedConversation.interlocutor.first_name} ${selectedConversation.interlocutor.last_name}`}</h2>
              </div>

              <div className="flex-1 overflow-y-auto mb-4 custom-scrollbar">
                {selectedConversation.messages.map((msg, index) => {
                  const isSentByCurrentUser = msg.sender_id === currentUser.id;
                  const formattedDate = new Date(msg.date_time).toLocaleString('pl-PL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div key={index} className={`mb-2 ${isSentByCurrentUser ? "flex justify-end" : "flex justify-start"}`}>
                      <div className={`px-4 py-2 max-w-[60%] ${isSentByCurrentUser ? "bg-primary-500 text-textBg-100 rounded-l-xl rounded-b-xl" : "bg-textBg-200 text-textBg-800 rounded-r-xl rounded-b-xl"}`}>
                        <p className="text-base font-medium">{msg.content}</p>
                        <span className="text-[11px] block text-right mt-1">
                          {formattedDate}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Write a message..."
                  className="w-full border flex-1 border-solid border-textBg-300 rounded px-4 py-2 h-9 focus:outline-none"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />
                <div className="hidden sm:block">
                  <Button
                    text="Send"
                    icon={<Send size={20} />}
                    size="m"
                    onClick={handleSendMessage}
                  />
                </div>
                <div className="block sm:hidden">
                  <Button
                    icon={<Send size={16} />}
                    size="m"
                    className="w-9 px-0 py-0"
                    onClick={handleSendMessage}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a conversation to start chatting.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}