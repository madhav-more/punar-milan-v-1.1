import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ImageBackground, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Typography, Shadows } from '../../src/constants/Theme';
import { Send, ChevronLeft, Check, CheckCheck } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import io from 'socket.io-client';
import { SOCKET_URL } from '../../src/services/api';
import api from '../../src/services/api';

export default function ChatRoom() {
  const { id, name, photo } = useLocalSearchParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [receiverId, setReceiverId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const socket = useRef(null);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchChatDetails();
    fetchMessages();
    setupSocket();

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, []);

  const fetchChatDetails = async () => {
    try {
      const response = await api.get('/chats');
      const currentChat = response.data.find(c => c._id === id);
      if (currentChat) {
        const otherParticipant = currentChat.participants.find(p => p._id !== user._id);
        if (otherParticipant) {
          setReceiverId(otherParticipant._id);
          if (socket.current) {
            socket.current.emit('checkOnlineStatus', otherParticipant._id);
          }
        }
      }
    } catch (error) {
      console.error('Fetch chat details error:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chats/${id}/messages`);
      // Sort messages descending for inverted FlatList
      const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMessages(sorted);
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const setupSocket = () => {
    socket.current = io(SOCKET_URL);
    
    socket.current.emit('join', user._id);

    socket.current.on('messageReceived', (message) => {
      if (message.chatId === id) {
        setMessages((prev) => [message, ...prev]);
        socket.current.emit('mark_read', { messageId: message._id, senderId: message.sender, receiverId: user._id });
      }
    });

    socket.current.on('messageSent', (message) => {
      if (message.chatId === id) {
        // Update local sent message status to match server ID/timestamp
        setMessages((prev) => prev.map(m => m.tempId === message.tempId ? message : m));
      }
    });

    socket.current.on('messageRead', ({ messageId }) => {
      setMessages((prev) => prev.map(m => m._id === messageId ? { ...m, isRead: true } : m));
    });

    socket.current.on('typing', ({ senderId }) => {
      if (senderId === receiverId) setIsTyping(true);
    });

    socket.current.on('stop_typing', ({ senderId }) => {
      if (senderId === receiverId) setIsTyping(false);
    });

    socket.current.on('userOnline', (userId) => {
      if (userId === receiverId) setIsOnline(true);
    });

    socket.current.on('userOffline', (userId) => {
      if (userId === receiverId) setIsOnline(false);
    });
  };

  useEffect(() => {
    // Check unread messages on load and mark them as read
    if (receiverId && socket.current) {
      messages.forEach(msg => {
        if (!msg.isRead && msg.sender !== user._id) {
          socket.current.emit('mark_read', { messageId: msg._id, senderId: msg.sender, receiverId: user._id });
        }
      });
    }
  }, [messages, receiverId]);

  const handleTyping = (text) => {
    setInput(text);
    if (!socket.current || !receiverId) return;

    socket.current.emit('typing', { receiverId, senderId: user._id });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.current.emit('stop_typing', { receiverId, senderId: user._id });
    }, 1500);
  };

  const sendMessage = () => {
    if (!input.trim() || !receiverId) return;

    const tempId = Date.now().toString();
    const mockMessage = {
      _id: tempId,
      tempId,
      chatId: id,
      sender: user._id,
      content: input,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    // Optimistic UI update
    setMessages((prev) => [mockMessage, ...prev]);

    socket.current.emit('sendMessage', {
      chatId: id,
      senderId: user._id,
      receiverId: receiverId,
      content: input,
      tempId: tempId,
    });

    setInput('');
    socket.current.emit('stop_typing', { receiverId, senderId: user._id });
  };

  const renderMessage = ({ item, index }) => {
    const isMe = item.sender === user._id;
    // Check if previous message in the list (which is next chronologically since it's inverted) is from the same user
    const prevMessage = messages[index - 1];
    const isConsecutive = prevMessage && prevMessage.sender === item.sender;

    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowTheir]}>
        <View style={[
          styles.messageBubble, 
          isMe ? styles.myMessage : styles.theirMessage,
          !isConsecutive && isMe ? styles.myMessageTail : null,
          !isConsecutive && !isMe ? styles.theirMessageTail : null
        ]}>
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[styles.timeText, isMe ? styles.myTime : styles.theirTime]}>
              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isMe && (
              <View style={styles.readReceipt}>
                {item.isRead ? (
                  <CheckCheck size={14} color="#34B7F1" />
                ) : (
                  <Check size={14} color="rgba(255,255,255,0.7)" />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const avatarUri = photo
    ? photo
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=E91E63&color=fff&size=100`;

  const screenContent = (
    <ImageBackground 
      source={{ uri: 'https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png' }} 
      style={styles.bgImage}
      resizeMode="cover"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image source={{ uri: avatarUri }} style={styles.headerAvatar} />
          <View>
            <Text style={styles.headerTitle}>{name}</Text>
            <Text style={[styles.headerStatus, isOnline ? styles.onlineColor : styles.offlineColor]}>
              {isTyping ? 'Typing...' : (isOnline ? 'Online' : 'Offline')}
            </Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item._id ? item._id.toString() : index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        inverted
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.inputWrapper, { paddingBottom: Math.max(insets.bottom, Spacing.m) }]}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Message"
            placeholderTextColor="#999"
            value={input}
            onChangeText={handleTyping}
            multiline
          />
        </View>
        <TouchableOpacity 
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} 
          onPress={sendMessage}
          disabled={!input.trim()}
        >
          <Send size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#E5DDD5' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {screenContent}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5DDD5', 
  },
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.s,
    backgroundColor: Colors.white,
    ...Shadows.light,
    zIndex: 10,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
    flex: 1,
    marginLeft: Spacing.s,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
  },
  headerTitle: {
    ...Typography.h3,
    fontSize: 16,
    color: Colors.text,
  },
  headerStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  onlineColor: {
    color: Colors.success,
  },
  offlineColor: {
    color: Colors.textSecondary,
  },
  backBtn: {
    padding: Spacing.s,
  },
  messageList: {
    paddingHorizontal: Spacing.m,
    paddingBottom: Spacing.m,
    paddingTop: Spacing.xl,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 3,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowTheir: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 2,
  },
  myMessage: {
    backgroundColor: '#005C4B', // Modern dark green WhatsApp bubble
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  myMessageTail: {
    borderTopRightRadius: 0,
  },
  theirMessage: {
    backgroundColor: Colors.white,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  theirMessageTail: {
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 2,
  },
  myMessageText: {
    color: Colors.white,
  },
  theirMessageText: {
    color: Colors.text,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 2,
  },
  timeText: {
    fontSize: 10,
  },
  myTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  theirTime: {
    color: '#999',
  },
  readReceipt: {
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.s,
    paddingTop: Spacing.s,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 24,
    marginRight: Spacing.s,
    minHeight: 48,
    maxHeight: 120,
    justifyContent: 'center',
    paddingHorizontal: 16,
    ...Shadows.medium,
  },
  input: {
    fontSize: 16,
    color: Colors.text,
    paddingTop: 12,
    paddingBottom: 12,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
  },
  sendBtnDisabled: {
    backgroundColor: '#A0A0A0',
  },
});
