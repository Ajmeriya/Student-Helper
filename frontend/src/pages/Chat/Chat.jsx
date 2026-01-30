import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaPaperPlane, FaUser, FaTrash, FaEllipsisV } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { API_BASE_URL } from '../../utils/constants'
import toast from 'react-hot-toast'

const Chat = () => {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [showConversations, setShowConversations] = useState(false)
  const [hoveredMessageId, setHoveredMessageId] = useState(null)
  const messagesEndRef = useRef(null)

  const targetUserId = searchParams.get('user')
  const propertyId = searchParams.get('property')
  const type = searchParams.get('type')

  useEffect(() => {
    fetchConversations()

    if (targetUserId) {
      setActiveConversation({
        userId: targetUserId.toString(), // Ensure it's a string
        propertyId: propertyId ? propertyId.toString() : null,
        type: type || null
      })
    }
  }, [targetUserId, propertyId, type])

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login again')
        return
      }

      const response = await fetch(`${API_BASE_URL}/message/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.success) {
        // Map backend conversations to frontend format
        const mappedConversations = result.conversations.map(conv => ({
          id: conv.user.id || conv.user._id,
          userId: conv.user.id || conv.user._id,
          userName: conv.user.name,
          lastMessage: conv.lastMessage || 'No messages yet',
          timestamp: conv.lastMessageTime || new Date(),
          unread: conv.unreadCount || 0,
          relatedTo: conv.relatedTo
        }))
        setConversations(mappedConversations)
      } else {
        toast.error(result.message || 'Failed to fetch conversations')
        setConversations([])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      toast.error('Failed to fetch conversations: ' + (error.message || 'Unknown error'))
      setConversations([])
    }
  }

  useEffect(() => {
    if (activeConversation && activeConversation.userId) {
      // Initial fetch with errors shown
      fetchMessages(activeConversation.userId, true)
      
      // Poll for new messages every 3 seconds (silent, no error toasts)
      const interval = setInterval(() => {
        fetchMessages(activeConversation.userId, false)
      }, 3000)
      
      return () => clearInterval(interval)
    } else {
      setMessages([])
    }
  }, [activeConversation])

  const fetchMessages = async (otherUserId, showErrors = true) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        if (showErrors) toast.error('Please login again')
        return
      }

      // Ensure otherUserId is a string
      const userId = otherUserId?.toString()
      if (!userId) {
        return
      }

      const response = await fetch(`${API_BASE_URL}/message/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }))
        if (showErrors) {
          toast.error(errorData.message || 'Failed to fetch messages')
        }
        return
      }

      const result = await response.json()

      if (result.success) {
        // Map backend messages to frontend format
        const mappedMessages = result.messages.map(msg => ({
          id: msg._id || msg.id,
          senderId: (msg.sender._id || msg.sender.id)?.toString(),
          senderName: msg.sender.name,
          text: msg.content,
          timestamp: new Date(msg.createdAt),
          read: msg.read
        }))
        
        // Sort messages by timestamp (oldest first) - like WhatsApp
        const sortedMessages = mappedMessages.sort((a, b) => {
          return a.timestamp.getTime() - b.timestamp.getTime()
        })
        
        setMessages(sortedMessages)
        
        // Refresh conversations to update unread count (only on initial load, not on every poll)
        if (showErrors) {
          fetchConversations()
        }
      } else {
        if (showErrors) {
          toast.error(result.message || 'Failed to fetch messages')
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      if (showErrors) {
        toast.error('Failed to fetch messages: ' + (error.message || 'Unknown error'))
      }
    }
  }

  useEffect(() => {
    // Scroll to bottom when messages change
    // Always scroll to bottom on initial load, or if user is near bottom
    if (messagesEndRef.current && messages.length > 0) {
      const container = messagesEndRef.current.parentElement
      if (container) {
        const scrollHeight = container.scrollHeight
        const scrollTop = container.scrollTop
        const clientHeight = container.clientHeight
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight
        const isNearBottom = distanceFromBottom < 200 // Increased threshold to 200px
        
        // Always scroll to bottom on initial load (when messages first appear)
        // Or if user is already near bottom (within 200px) - for new messages
        if (isNearBottom || scrollTop === 0 || distanceFromBottom < 50) {
          // Use setTimeout to ensure DOM is updated
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
          }, 100)
        }
      }
    }
  }, [messages])
  
  // Also scroll to bottom when a new conversation is selected
  useEffect(() => {
    if (activeConversation && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 200)
    }
  }, [activeConversation])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !activeConversation.userId) {
      return
    }

    const messageText = newMessage.trim()
    setNewMessage('')

    // Optimistically add message to UI
    const tempMessage = {
      id: Date.now().toString(),
      senderId: user._id || user.id,
      senderName: user.name,
      text: messageText,
      timestamp: new Date(),
      read: false
    }
    setMessages(prev => [...prev, tempMessage])

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login again')
        return
      }

      // Prepare relatedTo if property info is available
      const relatedTo = activeConversation.propertyId && activeConversation.type
        ? {
            type: activeConversation.type, // 'pg', 'hostel', or 'item'
            id: activeConversation.propertyId
          }
        : undefined

      // Ensure receiverId is a valid string
      const receiverId = activeConversation.userId?.toString()
      
      if (!receiverId) {
        toast.error('Invalid receiver ID')
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
        setNewMessage(messageText)
        return
      }

      const response = await fetch(`${API_BASE_URL}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: receiverId,
          content: messageText,
          relatedTo: relatedTo
        })
      })

      const result = await response.json()

      if (result.success) {
        // Replace temp message with real one from server
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== tempMessage.id)
          const newMsg = {
            id: result.data._id || result.data.id,
            senderId: result.data.sender._id || result.data.sender.id,
            senderName: result.data.sender.name,
            text: result.data.content,
            timestamp: new Date(result.data.createdAt),
            read: result.data.read
          }
          // Add new message and sort by timestamp (oldest first)
          const updated = [...filtered, newMsg]
          return updated.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        })
        
        // Refresh conversations to update last message
        fetchConversations()
      } else {
        // Remove temp message on error
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
        toast.error(result.message || 'Failed to send message')
        setNewMessage(messageText) // Restore message text
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      toast.error('Failed to send message: ' + (error.message || 'Unknown error'))
      setNewMessage(messageText) // Restore message text
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login again')
        return
      }

      // Convert messageId to number if it's a string (backend expects Long)
      const idToDelete = typeof messageId === 'string' ? parseInt(messageId) : messageId

      const response = await fetch(`${API_BASE_URL}/message/${idToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        // Try to parse error response
        let errorData
        try {
          errorData = await response.json()
        } catch (e) {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` }
        }
        
        if (response.status === 401) {
          toast.error('Authentication required. Please login again.')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          return
        }
        
        toast.error(errorData.message || 'Failed to delete message')
        return
      }

      const result = await response.json()

      if (result.success) {
        // Remove message from state (handle both string and number IDs)
        setMessages(prev => prev.filter(msg => {
          const msgId = typeof msg.id === 'string' ? parseInt(msg.id) : msg.id
          return msgId !== idToDelete
        }))
        toast.success('Message deleted successfully')
      } else {
        toast.error(result.message || 'Failed to delete message')
      }
    } catch (error) {
      console.error('❌ Error deleting message:', error)
      toast.error('Failed to delete message: ' + (error.message || 'Unknown error'))
    }
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
                          {conv.relatedTo && (
                            <p className="text-xs text-gray-400 mt-1">
                              {conv.relatedTo.type === 'pg' && '📌 PG'}
                              {conv.relatedTo.type === 'hostel' && '🏫 Hostel'}
                              {conv.relatedTo.type === 'item' && '🛒 Item'}
                            </p>
                          )}
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
                  <div 
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                    ref={(el) => {
                      if (el) {
                        // Store reference for scroll detection
                        el._scrollContainer = el
                      }
                    }}
                  >
                    {messages.map((message) => {
                      const currentUserId = (user._id || user.id)?.toString()
                      const messageSenderId = message.senderId?.toString()
                      const isOwnMessage = messageSenderId === currentUserId
                      
                      return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${
                          isOwnMessage ? 'justify-end' : 'justify-start'
                        } group`}
                        onMouseEnter={() => setHoveredMessageId(message.id)}
                        onMouseLeave={() => setHoveredMessageId(null)}
                      >
                        <div className="relative flex items-end space-x-2">
                          {isOwnMessage && hoveredMessageId === message.id && (
                            <button
                              onClick={() => handleDeleteMessage(message.id)}
                              className="mb-1 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                              title="Delete message"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          )}
                          <div
                            className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwnMessage
                                ? 'bg-primary-600 text-white rounded-br-none'
                                : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                            }`}
                          >
                            <p className="text-sm break-words">{message.text}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwnMessage
                                  ? 'text-primary-100'
                                  : 'text-gray-500'
                              }`}
                            >
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                      )
                    })}
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
