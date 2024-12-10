import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import PageTitle from '../components/PageTitle';
import { Search, Send, User } from "lucide-react";
import Button from "../components/Button";
import { getToken, getUserId, getUserRole, decodeToken } from "../utils/UserRoleUtils";
import UserRoles from '../data/userRoles';
import '../customCSS/customScrollbar.css';

export async function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(null); //wybrana konwersacja - wiadomosci
  const [recentConversations, setRecentConversations] = useState([]); //top 10 najnowszych rozmow
  const [unreadMessages, setUnreadMessages] = useState([]); //nieprzeczytane wiadomosci

  const [usersToSearch, setUsersToSearch] = useState([]); //uzytkownicy do ktorych mozemy napisac

  const [searchTerm, setSearchTerm] = useState("");

  const [newMessage, setNewMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUser = decodeToken();
  const userTypes = await fetchUserTypes();
  const token = getToken();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const administrators = [];
  const teachers = [];
  const parents = [];
  const students = [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const administratorsUrl = 'http://localhost:3000/administrator';
  const teachersUrl = 'http://localhost:3000/teacher';
  const parentsUrl = 'http://localhost:3000/parent';
  const studentsUrl = 'http://localhost:3000/student';

  const fetchUserTypes = async () => {
    try {
      const response = await fetch('http://localhost:3000/user-type', {
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
      setError(err.message);
    }
  };

  const fetchUsers = async (url) => {
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
      setError(err.message);
    }
  };

  const fetchConversationMessages = async (interlocutorId) => {
    if (!currentUser.id) {
      console.error('Current user ID is not set.');
      return [];
    }

    try {
      const response = await fetch(`http://localhost:3000/message/${interlocutorId}`, {
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
      return sortedMessages;
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  const fetchUnreadMessages = async () => {
    if (!currentUser.id) {
      console.error('Current user ID is not set.');
      return [];
    }

    try {
      const response = await fetch('http://localhost:3000/unread', {
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
      setError(err.message);
      return [];
    }
  };

  const fetchRecentConversations = async () => {
    if (!currentUser.id) {
      console.error('Current user ID is not set.');
      return [];
    }

    try {
      const response = await fetch('http://localhost:3000/message/recent', {
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
      setRecentConversations(sortedMessages);
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        if (currentUser.id) {
          socketRef.current = io("http://localhost:3000", {
            auth: {
              token: token
            }
          });

          socketRef.current.on("connect", () => {
            socketRef.current.emit("join", currentUser.id);
          });

          socketRef.current.on("receive_message", async (message) => {
            if (message.sender_id == currentUser.id && selectedConversation) {
              setSelectedConversation(prev => ({
                ...prev,
                messages: [message, ...prev.message]
              }));
            } else {
              setUnreadMessages((prev) => [...prev, message]);
            }
            fetchRecentConversations();
          });

          socketRef.current.on("error", (errorMessage) => {
            console.error('Socket error:', errorMessage);
            setError(errorMessage);
          });

          const administratorsUsers = await fetchUsers(administratorsUrl);
          const teachersUsers = await fetchUsers(teachersUrl);
          const parentsUsers = await fetchUsers(parentsUrl);
          const studentsUsers = await fetchUsers(studentsUrl);

          administrators.push(...administratorsUsers);
          administrators.push(...teachersUsers);
          administrators.push(...parentsUsers);
          administrators.push(...studentsUsers);

          setUsersToSearch([...administrators, ...teachers, ...parents, ...students]);

          fetchUnreadMessages();
          fetchRecentConversations();
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
  }, [token]);

  const handleUserSelect = async (interlocutor) => {
    try {
      const messages = await fetchConversationMessages(user.id);
      setSelectedConversation({
        interlocutor: interlocutor,
        messages: messages
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const findUserTypeId = (role) => {
    return userTypes.find(userType => userType.role === role).id;
  };

  const findUserTypeName = (userTypeId) => {
    return userTypes.find(userType => userType.id === userTypeId).name;
  };

  const findInteroluctor = async (interlocutorId, userTypeId) => {
    const interlocutorUserTypeName = findUserTypeName(userTypeId);
    let interlocutor = null;

    switch (interlocutorUserTypeName) {
      case UserRoles.Administrator:
        interlocutor = administrators.find(administrator => administrator.id == interlocutorId);
        break;
      case UserRoles.Teacher:
        interlocutor = teachers.find(teacher => teacher.id == interlocutorId);
        break;
      case UserRoles.Parent:
        interlocutor = parents.find(parent => parent.id == interlocutorId);
        break;
      case UserRoles.Student:
        interlocutor = students.find(student => student.id == interlocutorId);
        break;
    }

    return interlocutor
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    let senderTypeId = findUserTypeId(currentUser.role);
    let receiverTypeId = findUserTypeId(selectedConversation.interlocutor.role);

    const messageData = {
      subject: "New Message",
      content: newMessage,
      senderId: currentUser.id,
      senderTypeId: senderTypeId,
      receiverId: selectedConversation.id,
      receiverTypeId: receiverTypeId
    };

    try {
      socketRef.current.emit("send_message", messageData);
      setNewMessage("");
    } catch (err) {
      setError("Failed to send message. Please try again.");
    }
  };

  const filteredUsers = usersToSearch.filter(user =>
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                *                {filteredUsers.map(user => (
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

                const interlocutorId = selectedConversation.interlocutor.id === msg.sender_id ? msg.sender_id : msg.receiver_id;
                const userTypeId = selectedConversation.interlocutor.id === msg.sender_id ? msg.sender_type_id : msg.receiver_type_id;
                const interlocutor = findInteroluctor(interlocutorId, userTypeId);
                return (
                  <div
                    key={msg.id}                                                        //selectedConversation.interlocutor.id == msg.sender_id LUB msg.receiver_id
                    className={`flex items-center py-2 px-3 mb-2 rounded cursor-pointer ${(selectedConversation.interlocutor.id === interlocutorId) ? 'bg-textBg-100' : 'hover:bg-textBg-200'
                      }`}
                    onClick={() => handleUserSelect(interlocutor)} //{id, first_name, last_name, role} => znajdujemy typ uzytkowna za pomoca funkcji pomocniczej, a nastepnie przeszukujemy odpowiednia kolekcje uzytkownikow - admin/teacher/parent/student
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-500 mr-3">
                      <User size={20} className="text-textBg-100" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-textBg-900">{`${interlocutor.first_name} ${interlocutor.last_name}`
                          // znalezienie id uzytkownika w kolekcjach - w zaleznosci od tego czy jest to sender czy receiver
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