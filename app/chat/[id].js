import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Typography, Shadows } from '../../src/constants/Theme';
import { Send, ChevronLeft } from 'lucide-react-native';
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
  const socket = useRef(null);
  const flatListRef = useRef(null);
  const router = useRouter();

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
        if (otherParticipant) setReceiverId(otherParticipant._id);
      }
    } catch (error) {
      console.error('Fetch chat details error:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chats/${id}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const setupSocket = () => {
    socket.current = io(SOCKET_URL);
    
    socket.current.emit('join', user._id);

    socket.current.on('messageReceived', (message) => {
      if (message.chatId === id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.current.on('messageSent', (message) => {
      if (message.chatId === id) {
        setMessages((prev) => [...prev, message]);
      }
    });
  };

  const sendMessage = () => {
    if (!input.trim() || !receiverId) return;

    socket.current.emit('sendMessage', {
      chatId: id,
      senderId: user._id,
      receiverId: receiverId,
      content: input,
    });

    setInput('');
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === user._id;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
          {item.content}
        </Text>
        <Text style={[styles.timeText, isMe ? styles.myTime : styles.theirTime]}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  const avatarUri = photo
    ? photo
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=E91E63&color=fff&size=100`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image source={{ uri: avatarUri }} style={styles.headerAvatar} />
          <View>
            <Text style={styles.headerTitle}>{name}</Text>
            <Text style={styles.headerStatus}>Matched</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} 
            onPress={sendMessage}
            disabled={!input.trim()}
          >
            <Send size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
    backgroundColor: Colors.white,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.border,
  },
  headerTitle: {
    ...Typography.h3,
    fontSize: 16,
  },
  headerStatus: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '600',
  },
  backBtn: {
    padding: Spacing.s,
  },
  messageList: {
    padding: Spacing.m,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: Spacing.m,
    borderRadius: 20,
    marginBottom: Spacing.s,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...Typography.body,
  },
  myMessageText: {
    color: Colors.white,
  },
  theirMessageText: {
    color: Colors.text,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
  },
  myTime: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  theirTime: {
    color: Colors.textSecondary,
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: Spacing.m,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingHorizontal: Spacing.m,
    paddingVertical: 10,
    maxHeight: 100,
    color: Colors.text,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.s,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.border,
  },
});
