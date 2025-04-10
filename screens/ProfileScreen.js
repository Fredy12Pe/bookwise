import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Mock user data
const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  stats: {
    summariesRead: 12,
    flashcardsReviewed: 45,
    timeListened: '2h 30m',
  },
};

const StatCard = ({ title, value, icon }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={24} color="#2F80ED" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

const ProfileScreen = () => {
  const navigation = useNavigation();

  const handleLogout = () => {
    // TODO: Implement logout functionality
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.profileSection}>
          <Image source={{ uri: mockUser.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{mockUser.name}</Text>
          <Text style={styles.email}>{mockUser.email}</Text>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Summaries Read"
              value={mockUser.stats.summariesRead}
              icon="book"
            />
            <StatCard
              title="Flashcards Reviewed"
              value={mockUser.stats.flashcardsReviewed}
              icon="flash"
            />
            <StatCard
              title="Time Listened"
              value={mockUser.stats.timeListened}
              icon="time"
            />
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity 
            style={styles.settingButton}
            onPress={() => navigation.navigate('APITest')}
          >
            <Ionicons name="key-outline" size={24} color="#2F80ED" />
            <Text style={styles.settingButtonText}>API Settings</Text>
            <Ionicons name="chevron-forward" size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 16,
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666666',
  },
  statsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111111',
    marginVertical: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F80ED',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    margin: 16,
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsSection: {
    padding: 16,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#111111',
    marginLeft: 12,
  },
});

export default ProfileScreen; 