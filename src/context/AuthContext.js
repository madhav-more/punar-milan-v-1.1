import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const authDataSerialized = await AsyncStorage.getItem('userData');
      if (authDataSerialized) {
        const _user = JSON.parse(authDataSerialized);
        setUserState(_user);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  // Helper to update user in both state and AsyncStorage
  const updateUserData = async (updatedFields) => {
    const updated = { ...user, ...updatedFields };
    setUserState(updated);
    await AsyncStorage.setItem('userData', JSON.stringify(updated));
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, ...userData } = response.data;
    
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    setUserState(userData);
  };

  const register = async (name, email, password, phone, dob, gender, photoData) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('phone', phone);
    formData.append('dob', dob);
    formData.append('gender', gender);
    if (photoData) {
      formData.append('photo', photoData);
    }
    
    const response = await api.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const { token, ...userData } = response.data;

    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    setUserState(userData);
  };

  const logout = async () => {
    await AsyncStorage.clear();
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
