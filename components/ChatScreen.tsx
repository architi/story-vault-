import React, { useState, useEffect, useRef } from 'react';
import { MOCK_APP_USERS, MOCK_PHONE_CONTACTS } from '../constants';
import type { ChatContact, ChatMessage, Story } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import Icon from './Icon';
import Button from './Button';

const ChatScreen: React.FC = () => {
  const { stories } = useAppContext();
  const [activeTab, setActiveTab] = useState<'app' | 'phone'>('app');
  const [allContacts, setAllContacts] = useState<ChatContact[]>([...MOCK_APP_USERS, ...MOCK_PHONE_CONTACTS]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  
  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const appUsers = allContacts.filter(c => c.isAppUser).sort((a, b) => (a.name > b.name ? 1 : -1));
  const phoneContacts = allContacts.filter(c => !c.isAppUser).sort((a, b) => (a.name > b.name ? 1 : -1));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedContact?.messages]);

  const addMessageToContact = (newMessage: ChatMessage) => {
    if (!selectedContact) return;
    
    const updatedContacts = allContacts.map(contact => {
      if (contact.id === selectedContact.id) {
        const updatedMessages = [...contact.messages, newMessage];
        return {
          ...contact,
          messages: updatedMessages,
          lastMessage: newMessage.type === 'text' ? newMessage.text : newMessage.type === 'story' ? `Shared a story` : 'Audio message',
          lastMessageTime: newMessage.timestamp,
        };
      }
      return contact;
    });

    setAllContacts(updatedContacts);
    setSelectedContact(prev => prev ? updatedContacts.find(c => c.id === prev.id) || null : null);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'text',
      text: messageInput.trim(),
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    addMessageToContact(newMessage);
    setMessageInput('');
  };

  const handleSendStory = (story: Story) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'story',
      story: story,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    addMessageToContact(newMessage);
    setShowShareModal(false);
  };
  
  const handleInvite = (contact: ChatContact) => {
    setInviteLink(`https://storyvault.example.com/invite?name=${encodeURIComponent(contact.name)}&phone=${contact.phoneNumber}`);
    setShowInviteModal(true);
  };
  
  // --- Audio Recording Handlers ---
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          type: 'audio',
          audioUrl,
          duration: recordingTime,
          sender: 'me',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        addMessageToContact(newMessage);

        stream.getTracks().forEach(track => track.stop());
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      recordingIntervalRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);

    } catch (err) {
      console.error("Error starting recording:", err);
      alert("Could not start recording. Please ensure you have given microphone permissions.");
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    setIsRecording(false);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => new Date(seconds * 1000).toISOString().substr(14, 5);

  const togglePlayAudio = (msg: ChatMessage) => {
    if (playingAudioId === msg.id && audioRef.current) {
      audioRef.current.pause();
      setPlayingAudioId(null);
    } else if (msg.audioUrl) {
      if (audioRef.current) audioRef.current.pause();
      const newAudio = new Audio(msg.audioUrl);
      audioRef.current = newAudio;
      newAudio.play();
      setPlayingAudioId(msg.id);
      newAudio.onended = () => setPlayingAudioId(null);
    }
  };

  const renderMessageContent = (msg: ChatMessage) => {
    switch (msg.type) {
      case 'text':
        return <p>{msg.text}</p>;
      case 'story':
        return (
          <div className="border border-[var(--border-color)]/30 rounded-lg p-3 bg-[var(--background-secondary)]/50">
            <h4 className="font-bold text-sm mb-1 truncate">{msg.story?.question}</h4>
            <p className="text-xs line-clamp-2 italic">"{msg.story?.content}"</p>
          </div>
        );
      case 'audio':
        return (
          <div className="flex items-center gap-2">
            <button onClick={() => togglePlayAudio(msg)}>
              <Icon name={playingAudioId === msg.id ? 'pause' : 'play'} className="w-6 h-6" />
            </button>
            <div className="w-24 h-1 bg-gray-300 rounded-full"></div>
            <span className="text-xs font-mono">{formatTime(msg.duration ?? 0)}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-220px)] border border-[var(--border-color)] rounded-lg bg-[var(--background-primary)] shadow-lg overflow-hidden">
      {/* Contact List */}
      <div className={`w-full md:w-2/5 lg:w-1/3 border-r border-[var(--border-color)] flex flex-col transition-transform duration-300 ${selectedContact ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
        <div className="p-4 border-b border-[var(--border-color)]">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>Chats</h2>
          <div className="flex mt-4 rounded-md bg-[var(--background-secondary)] p-1">
            <button onClick={() => setActiveTab('app')} className={`w-1/2 p-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'app' ? 'bg-[var(--accent-primary)] text-white shadow' : 'text-[var(--text-secondary)] hover:bg-[var(--background-primary)]'}`}>App Users</button>
            <button onClick={() => setActiveTab('phone')} className={`w-1/2 p-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'phone' ? 'bg-[var(--accent-primary)] text-white shadow' : 'text-[var(--text-secondary)] hover:bg-[var(--background-primary)]'}`}>Phone Contacts</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {(activeTab === 'app' ? appUsers : phoneContacts).map(contact => (
            <div key={contact.id} onClick={() => contact.isAppUser && setSelectedContact(contact)} className={`flex items-center p-4 cursor-pointer hover:bg-[var(--background-secondary)] border-b border-[var(--border-color)]/50 ${selectedContact?.id === contact.id ? 'bg-[var(--background-secondary)]' : ''}`}>
              <img src={contact.avatarUrl || `https://ui-avatars.com/api/?name=${contact.name}&background=random`} alt={contact.name} className="w-12 h-12 rounded-full mr-4" />
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center"><h3 className="font-bold truncate">{contact.name}</h3>{contact.isAppUser && <p className="text-xs text-[var(--text-secondary)]">{contact.lastMessageTime}</p>}</div>
                {contact.isAppUser ? (<p className="text-sm text-[var(--text-secondary)] truncate">{contact.lastMessage}</p>) : (<Button onClick={(e) => { e.stopPropagation(); handleInvite(contact); }} variant="secondary" className="px-3 py-1 text-xs mt-1">Invite</Button>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`w-full md:w-3/5 lg:w-2/3 flex flex-col absolute md:static top-0 right-0 h-full bg-[var(--background-primary)] transition-transform duration-300 ${selectedContact ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        {selectedContact ? (
          <>
            <div className="p-3 flex items-center border-b border-[var(--border-color)] bg-[var(--background-secondary)] shadow-sm">
              <button onClick={() => setSelectedContact(null)} className="md:hidden mr-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><Icon name="back" className="w-6 h-6" /></button>
              <img src={selectedContact.avatarUrl} alt={selectedContact.name} className="w-10 h-10 rounded-full mr-3" />
              <h3 className="font-bold text-lg">{selectedContact.name}</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-repeat" style={{ backgroundImage: "url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')", backgroundSize: 'contain' }}>
              {selectedContact.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow ${msg.sender === 'me' ? 'bg-[#dcf8c6] text-black rounded-br-none' : 'bg-white text-black rounded-bl-none'}`}>
                    {renderMessageContent(msg)}
                    <p className="text-xs text-right mt-1 opacity-50">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-[var(--background-secondary)] border-t border-[var(--border-color)]">
              {isRecording ? (
                <div className="flex items-center justify-between bg-white rounded-full p-2 shadow-inner">
                  <span className="text-red-500 font-mono pl-4">{formatTime(recordingTime)}</span>
                  <p className="text-gray-500">Recording...</p>
                  <button onClick={handleStopRecording} className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center"><Icon name="stop" className="w-5 h-5"/></button>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex items-center bg-white rounded-full p-2 shadow-inner">
                  <button type="button" onClick={() => setShowShareModal(true)} className="text-gray-500 hover:text-[var(--accent-primary)] p-2"><Icon name="book-open" className="w-6 h-6" /></button>
                  <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-transparent px-4 focus:outline-none text-black" />
                  {messageInput ? (
                    <button type="submit" className="bg-[var(--accent-primary)] text-white rounded-full w-10 h-10 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086L2.28 16.761a.75.75 0 00.826.95l14.433-6.414a.75.75 0 000-1.405L3.105 2.289z" /></svg></button>
                  ) : (
                    <button type="button" onClick={handleStartRecording} className="bg-gray-200 text-gray-600 rounded-full w-10 h-10 flex items-center justify-center"><Icon name="mic" className="w-5 h-5"/></button>
                  )}
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="h-full hidden md:flex flex-col items-center justify-center text-center p-8 text-[var(--text-secondary)]">
            <Icon name="chat" className="w-24 h-24 mb-4" /><h2 className="text-2xl font-bold" style={{fontFamily: 'var(--font-serif)'}}>Your Messages</h2><p>Select a chat to start messaging.</p>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowInviteModal(false)}>
          <div 
            className="relative w-[90vw] max-w-md rounded-lg flex flex-col justify-center items-center p-8 md:p-10 popup-card-animate bg-[var(--background-secondary)] shadow-2xl border border-[var(--border-color)] notebook-lines text-center"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-3 right-3 text-[var(--accent-primary)]/50 hover:text-[var(--accent-primary)] transition-colors z-10"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-3xl md:text-4xl text-[var(--accent-primary)] mb-6" style={{ fontFamily: 'var(--font-serif)', fontWeight: 'bold' }}>Invite to StoryVault</h3>
            <p className="text-[var(--text-secondary)] mb-6">Share this link to invite them:</p>
            <input 
              type="text" 
              readOnly 
              value={inviteLink} 
              className="w-full p-3 rounded-md border-2 border-[var(--accent-primary)]/20 bg-transparent text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] text-center text-sm mb-6 placeholder:text-[var(--text-secondary)]/80"
              style={{fontFamily: 'var(--font-typewriter)'}}
            />
            <Button onClick={() => { navigator.clipboard.writeText(inviteLink); alert('Link Copied!'); }} className="w-full"><Icon name="copy" className="w-5 h-5"/> Copy Link</Button>
          </div>
        </div>
      )}

      {/* Share Story Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowShareModal(false)}>
          <div 
            className="relative p-6 rounded-lg shadow-2xl w-full max-w-lg h-[80vh] flex flex-col popup-card-animate bg-[var(--background-secondary)] border border-[var(--border-color)] notebook-lines"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-4 mb-4">
              <h3 className="text-4xl md:text-5xl text-[var(--accent-primary)]" style={{ fontFamily: 'var(--font-script)' }}>Share a Story</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-[var(--accent-primary)]/50 hover:text-[var(--accent-primary)] transition-colors z-10"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
              {stories.length > 0 ? stories.map(story => (
                <button 
                  key={story.id} 
                  onClick={() => handleSendStory(story)} 
                  className="w-full text-left p-4 rounded-md bg-[var(--background-primary)] hover:bg-[var(--accent-primary)]/10 border border-[var(--border-color)] transition-colors"
                >
                  <h4 className="font-bold truncate text-[var(--text-primary)]">{story.question}</h4>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2" style={{fontFamily: 'var(--font-serif)'}}>{story.content}</p>
                </button>
              )) : <p className="text-center text-[var(--text-secondary)] pt-8">Your vault is empty. Write a story to share it!</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatScreen;