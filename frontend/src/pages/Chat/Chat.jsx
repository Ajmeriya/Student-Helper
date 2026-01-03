import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaPaperPlane, FaUser } from 'react-icons/fa'
import { motion } from 'framer-motion'

const Chat = () => {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [showConversations, setShowConversations] = useState(false)
  const messagesEndRef = useRef(null)

  const targetUserId = searchParams.get('user')
  const propertyId = searchParams.get('property')
  const type = searchParams.get('type')

  useEffect(() => {
    // TODO: Replace with actual API call to fetch conversations
    const mockConversations = [
      {
        id: '1',
        userId: 'user1',
        userName: 'John Doe',
        lastMessage: 'Hello, is this PG still available?',
        timestamp: new Date(),
        unread: 2
      }
    ]
    setConversations(mockConversations)

    if (targetUserId && propertyId) {
      setActiveConversation({
        userId: targetUserId,
        propertyId,
        type
      })
    }
  }, [targetUserId, propertyId, type])

  useEffect(() => {
    if (activeConversation) {
      // TODO: Replace with actual API call to fetch messages
      const mockMessages = [
        {
          id: '1',
          senderId: activeConversation.userId,
          senderName: 'John Doe',
          text: 'Hello, is this PG still available?',
          timestamp: new Date(Date.now() - 3600000)
        },
        {
          id: '2',
          senderId: user.id,
          senderName: user.name,
          text: 'Yes, it is available. Would you like to schedule a visit?',
          timestamp: new Date(Date.now() - 1800000)
        }
      ]
      setMessages(mockMessages)
    }
  }, [activeConversation, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return

    const message = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      text: newMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // TODO: Replace with actual API call to send message
    // await sendMessage(activeConversation.userId, newMessage)
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Header */}
        <div className="bg-white shadow-sm md:hidden sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            {!activeConversation && (
              <button
                onClick={() => setShowConversations(true)}
                className="text-primary-600"
              >
                <FaUser />
              </button>
            )}
            {activeConversation && (
              <button
                onClick={() => {
                  setActiveConversation(null)
                  setShowConversations(true)
                }}
                className="text-gray-600"
              >
                ← Back
              </button>
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block px-4 sm:px-6 lg:px-8 pt-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden md:mx-4 lg:mx-8">
          <div className="flex h-[calc(100vh-120px)] md:h-[600px]">
            {/* Conversations List - Hidden on mobile when chat is active */}
            <div className={`${
              showConversations || !activeConversation 
                ? 'block' 
                : 'hidden'
            } md:block w-full md:w-1/3 border-r border-gray-200 overflow-y-auto bg-white ${
              showConversations ? 'fixed inset-0 z-20 md:relative md:inset-auto' : ''
            }`}>
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-semibold">Conversations</h2>
                <button
                  onClick={() => setShowConversations(false)}
                  className="md:hidden text-gray-600"
                >
                  ✕
                </button>
              </div>
              {conversations.length > 0 ? (
                <div>
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setActiveConversation({ userId: conv.userId })
                        setShowConversations(false)
                      }}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        activeConversation?.userId === conv.userId ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary-600 text-white rounded-full p-2 flex-shrink-0">
                          <FaUser />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{conv.userName}</p>
                          <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                        </div>
                        {conv.unread > 0 && (
                          <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1 flex-shrink-0">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-600">
                  No conversations yet
                </div>
              )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
              {activeConversation ? (
                <>
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <h3 className="font-semibold">Chat</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${
                          message.senderId === user.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === user.id
                              ? 'bg-primary-600 text-white rounded-br-none'
                              : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                          }`}
                        >
                          <p className="text-sm break-words">{message.text}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.senderId === user.id
                                ? 'text-primary-100'
                                : 'text-gray-500'
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="bg-primary-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-primary-700 transition flex-shrink-0"
                      >
                        <FaPaperPlane />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-600 p-4">
                  <div className="text-center">
                    <FaUser className="mx-auto text-4xl text-gray-400 mb-2" />
                    <p className="text-sm sm:text-base">Select a conversation to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat

