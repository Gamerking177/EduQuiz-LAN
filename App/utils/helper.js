import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// ... tumhare baaki helpers jaise generateRoomCode wagera

export const getOrCreateDeviceId = async () => {
    try {
        // 1. Check karo agar pehle se saved hai
        let deviceId = await AsyncStorage.getItem('eduquiz_device_id');
        
        // 2. Agar nahi hai, toh nayi generate karo aur save karo
        if (!deviceId) {
            deviceId = Crypto.randomUUID(); // Ekdum unique ID banayega like "xyz-123-abc"
            await AsyncStorage.setItem('eduquiz_device_id', deviceId);
            console.log("New Device ID Generated:", deviceId);
        }
        
        return deviceId;
    } catch (error) {
        console.error("Device ID error:", error);
        // Fallback agar storage fail ho jaye
        return "fallback-" + Math.random().toString(36).substring(2, 10);
    }
};