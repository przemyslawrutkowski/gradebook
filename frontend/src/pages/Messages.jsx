import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import PageTitle from '../components/PageTitle';
import { Search, Send, User } from "lucide-react";
import Button from "../components/Button";
import { getToken, getUserId, getUserRole } from "../utils/UserRoleUtils";
import UserRoles from '../data/userRoles';
import '../customCSS/customScrollbar.css';

export function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [usersToSearch, setUsersToSearch] = useState([]);
  const [userRole, setUserRole] = useState(null); 
  const [currentUserId, setCurrentUserId] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);

  const token = getToken();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const fetchTeachers = async () => {
    try {
      const response = await fetch('http://localhost:3000/teacher', {
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
      setTeachers(result.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:3000/student', {
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
      setStudents(result.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchMessages = async (otherUser) => {
    if (!currentUserId) {
      console.error('Current user ID is not set.');
      return [];
    }
    try {
      const response = await fetch(`http://localhost:3000/message/${currentUserId}/${otherUser}`, {
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
      return result.data;
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  const fetchRecentMessages = async () => {
    if (!currentUserId) {
      console.error('Current user ID is not set.');
      return [];
    }
    try {
      const response = await fetch(`http://localhost:3000/message/recent/${currentUserId}`, {
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
      console.log('Ostatnie wiadomości:', result.data);
      const sortedMessages = result.data.sort((a, b) => new Date(b.lastMessage.dateTime) - new Date(a.lastMessage.dateTime));
      setRecentMessages(sortedMessages);
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const role = getUserRole();
        setUserRole(role);

        const userId = getUserId();
        setCurrentUserId(userId);

        if (userId) {
          await Promise.all([fetchTeachers(), fetchStudents()]);
          
          if (role === UserRoles.Student) {
            setUsersToSearch(teachers);
          } else {
            setUsersToSearch(students);
          }
        } else {
          throw new Error("User ID is not available."); 
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    initializeData();
  }, []);

  useEffect(() => {
    if (userRole === UserRoles.Student) {
      setUsersToSearch(teachers);
    } else {
      setUsersToSearch(students);
    }
  }, [userRole, teachers, students]);

  useEffect(() => {
    if (currentUserId) {
      fetchRecentMessages();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    socketRef.current = io("http://localhost:3000"); 

    socketRef.current.emit("join", currentUserId);

    socketRef.current.on("receive_message", (message) => {
      if (
        selectedConversation &&
        (message.senderId === selectedConversation.id ||
          message.receiverId === currentUserId)
      ) {
        setSelectedConversation((prev) => ({
          ...prev,
          messages: [...prev.messages, message],
        }));
      }

      fetchRecentMessages();
    });

    socketRef.current.on("error", (errorMessage) => {
      setError(errorMessage);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [currentUserId, selectedConversation]);

  const handleUserSelect = async (user) => {
    setSearchTerm("");
    const conversation = { id: user.id, name: `${user.first_name} ${user.last_name}`, messages: [] };
    setSelectedConversation(conversation);
    try {
      const messagesData = await fetchMessages(user.id);
      setSelectedConversation(prev => ({ ...prev, messages: messagesData }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
  
    const messageData = {
      subject: "New Message",
      content: newMessage,
      senderId: currentUserId,
      senderTypeId: userRole === UserRoles.Student 
        ? "7d8462e8-b280-11ef-920d-3a47b4b364d8" 
        : "8bbd68fd-b280-11ef-920d-3a47b4b364d8",
      receiverId: selectedConversation.id,
      receiverTypeId: userRole === UserRoles.Student 
        ? "8bbd68fd-b280-11ef-920d-3a47b4b364d8" 
        : "7d8462e8-b280-11ef-920d-3a47b4b364d8",
    };
  
    try {
      socketRef.current.emit("send_message", messageData, (response) => {
        if (response.status === 'ok') {
          fetchRecentMessages();
        } else {
          setError(response.message);
        }
      });
  
      const optimisticMessage = {
        ...messageData,
        id: Date.now(),
        dateTime: new Date().toISOString(),
        wasRead: true,
        senderId: currentUserId,
      };
  
      setSelectedConversation((prev) => ({
        ...prev,
        messages: [...prev.messages, optimisticMessage],
      }));


      setRecentMessages((prev) => {
        const existingIndex = prev.findIndex(
          (msg) => msg.otherUserId === selectedConversation.id
        );
        if (existingIndex !== -1) {
          const updatedConversations = [...prev];
          updatedConversations.splice(existingIndex, 1);
          return [
            {
              ...prev[existingIndex],
              lastMessage: optimisticMessage,
            },
            ...updatedConversations,
          ];
        } else {
          return [
            {
              otherUserId: selectedConversation.id,
              firstName: selectedConversation.name.split(' ')[0],
              lastName: selectedConversation.name.split(' ')[1],
              lastMessage: optimisticMessage,
            },
            ...prev,
          ];
        }
      });
  
      setNewMessage("");
    } catch (err) {
      setError("Nie udało się wysłać wiadomości. Spróbuj ponownie.");
    }
  };

  const filteredUsers = usersToSearch.filter(user => 
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8 flex flex-col">
      <PageTitle text="Messages"/>
      <div className="w-full h-max flex flex-col xl:flex-row gap-8">
        <div className="w-full h-full xl:w-fit bg-white border border-solid border-textBg-200 rounded p-8 flex flex-col"> 
          <div className="relative">
            <div className="h-9 flex items-center px-3 py-3 bg-white rounded border border-solid border-textBg-300 text-textBg-700 mb-4">
              <Search size={16} className='mr-2 text-textBg-700'/>
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
                      <User size={16} className="text-textBg-700"/>
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
            {recentMessages.length > 0 ? (
              recentMessages.map((msg) => {
                const isLastMessageFromCurrentUser = msg.lastMessage.senderId === currentUserId;

                return (
                  <div
                    key={msg.lastMessage.id}
                    className={`flex items-center py-2 px-3 mb-2 rounded cursor-pointer ${
                      selectedConversation?.id === msg.otherUserId ? 'bg-textBg-100' : 'hover:bg-textBg-200'
                    }`}
                    onClick={() => handleUserSelect({ id: msg.otherUserId, first_name: msg.firstName, last_name: msg.lastName })}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-500 mr-3">
                      <User size={20} className="text-textBg-100" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-textBg-900">{`${msg.firstName} ${msg.lastName}`}</span>
                        <span className="text-xs text-textBg-600">
                          {new Date(msg.lastMessage.dateTime).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-textBg-600 truncate hidden sm:block">
                        {isLastMessageFromCurrentUser ? `You: ${msg.lastMessage.content.length > 32
                          ? `${msg.lastMessage.content.slice(0, 32)}...`
                          : msg.lastMessage.content}` 
                          : msg.lastMessage.content.length > 32
                            ? `${msg.lastMessage.content.slice(0, 32)}...`
                            : msg.lastMessage.content}
                      </div>
                      <div className="text-sm text-textBg-600 truncate block sm:hidden">
                        {isLastMessageFromCurrentUser ? `You: ${msg.lastMessage.content.length > 20
                          ? `${msg.lastMessage.content.slice(0, 20)}...`
                          : msg.lastMessage.content}` 
                          : msg.lastMessage.content.length > 20
                            ? `${msg.lastMessage.content.slice(0, 20)}...`
                            : msg.lastMessage.content}
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
                  <User size={20} className="text-textBg-100"/>
                </div>
                <h2 className="text-lg font-medium text-textBg-700">{selectedConversation.name}</h2>
              </div>

              <div className="flex-1 overflow-y-auto mb-4 custom-scrollbar">
                {selectedConversation.messages.map((msg, index) => {
                  const isSentByCurrentUser = msg.senderId === currentUserId;
                  const formattedDate = new Date(msg.dateTime).toLocaleString('pl-PL', {
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