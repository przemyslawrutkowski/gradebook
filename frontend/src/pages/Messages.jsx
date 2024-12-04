/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import PageTitle from '../components/PageTitle';
import { Search, Send, User } from "lucide-react";
import Button from "../components/Button";

const allUsers = [
  { id: 1, name: "Jan Kowalski" },
  { id: 2, name: "Anna Nowak" },
  { id: 3, name: "Piotr Wiśniewski" },
  { id: 4, name: "Maria Kowalczyk" },
  { id: 5, name: "Krzysztof Zieliński" },
  { id: 6, name: "Ewa Jabłońska" },
  { id: 7, name: "Michał Lewandowski" },
  { id: 8, name: "Natalia Szymańska" },
  { id: 9, name: "Tomasz Mazur" },
  { id: 10, name: "Agata Wójcik" },
  { id: 11, name: "Paweł Dąbrowski" }
];

export function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const filteredConversations = conversations.filter(convo =>
    convo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !conversations.some(convo => convo.id === user.id)
  );

  const handleUserSelect = (user) => {
    const existingConversation = conversations.find(convo => convo.id === user.id);
    if (existingConversation) {
      setSelectedConversation(existingConversation);
    } else {
      const newConversation = {
        id: user.id,
        name: user.name,
        lastMessage: "",
        lastDate: "",
        messages: [],
      };
      setConversations([newConversation, ...conversations]);
      setSelectedConversation(newConversation);
    }
    setSearchTerm("");
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const currentDate = new Date().toISOString();

    const updatedConversations = conversations.map(convo => {
      if (convo.id === selectedConversation.id) {
        const updatedMessages = [
          ...convo.messages,
          {
            sender: "You",
            text: newMessage,
            date: currentDate,
          },
        ];
        return {
          ...convo,
          lastMessage: newMessage,
          lastDate: currentDate,
          messages: updatedMessages,
        };
      }
      return convo;
    });

    setConversations(updatedConversations);
    setSelectedConversation({
      ...selectedConversation,
      lastMessage: newMessage,
      lastDate: currentDate,
      messages: [
        ...selectedConversation.messages,
        {
          sender: "You",
          text: newMessage,
          date: currentDate,
        },
      ],
    });
    setNewMessage("");
  };

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
                placeholder='Search'
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
                    <span className="text-sm text-textBg-700">{user.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map(convo => (
              <div
                key={convo.id}
                className={`flex items-center py-3 mb-2 rounded cursor-pointer ${
                  selectedConversation?.id === convo.id ? 'bg-textBg-100' : 'hover:bg-textBg-200'
                }`}
                onClick={() => setSelectedConversation(convo)}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-textBg-300 mr-3">
                  <User size={20} className="text-textBg-700"/>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-textBg-900">{convo.name}</span>
                    <span className="text-xs text-textBg-600">
                      {convo.lastDate && !isNaN(new Date(convo.lastDate).getTime())
                        ? new Date(convo.lastDate).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                  <div className="text-sm text-textBg-600 truncate block sm:hidden">
                    {convo.lastMessage.length > 20
                      ? `${convo.lastMessage.slice(0, 20)}...`
                      : convo.lastMessage}
                  </div>
                  
                  <div className="text-sm text-textBg-600 truncate hidden sm:block">
                    {convo.lastMessage.length > 32
                      ? `${convo.lastMessage.slice(0, 32)}...`
                      : convo.lastMessage}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white border border-solid border-textBg-200 rounded p-4 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="flex items-center mb-4 border-b pb-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-textBg-300 mr-3">
                  <User size={20} className="text-textBg-700"/>
                </div>
                <h2 className="text-lg font-medium text-textBg-700">{selectedConversation.name}</h2>
              </div>
              <div className="flex-1 overflow-y-auto mb-4">
                {selectedConversation.messages.map((msg, index) => (
                  <div key={index} className={`mb-2 ${msg.sender === "You" ? "flex justify-end" : "flex justify-start"}`}>
                    <div className={`xs:max-w-48 max-w-64 sm:max-w-sm md:max-w-md lg:max-w-lg px-4 py-2 rounded ${
                      msg.sender === "You" 
                        ? "bg-primary-500 text-white rounded-tr-none" 
                        : "bg-textBg-200 text-textBg-700 rounded rounded-tl-none"
                    } break-words whitespace-normal`}>
                      <p className="break-words whitespace-normal">{msg.text}</p>
                      <span className="text-xs block text-right mt-1">
                        {new Date(msg.date).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
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
                  <Button text="Send" icon={<Send size={20}/>} size="m" onClick={handleSendMessage}/>
                </div>
                <div className="block sm:hidden">
                  <Button icon={<Send size={16}/>} size="m" className="w-9 px-0 py-0" onClick={handleSendMessage}/>
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
