import { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Contact = {
  id: string;
  name: string;
  phone: string;
  notes?: string;
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(' ')
    .map((word) => word[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
}

const AVATAR_COLORS = [
  '#5C6BC0', '#26A69A', '#EF5350', '#AB47BC',
  '#42A5F5', '#FF7043', '#66BB6A', '#EC407A',
];

function getAvatarColor(name: string): string {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export default function ContactDirectory() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState('');

  const handlePhoneChange = (text: string) => {
    const digitsOnly = text.replace(/[^0-9]/g, '');
    if (digitsOnly.length <= 10) setPhone(digitsOnly);
  };

  const handleAddContact = () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      Alert.alert('Missing Name', 'Please enter a name.');
      return;
    }
    if (!trimmedPhone || trimmedPhone.length < 7) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
      return;
    }

    const newContact: Contact = {
  id: Date.now().toString(),
  name: trimmedName,
  phone: trimmedPhone,
  notes,
};

    // Add and sort alphabetically
    setContacts((prev) =>
      [...prev, newContact].sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      )
    );
    setName('');
    setPhone('');
    setNotes('');
  };

  const handleDelete = (id: string, contactName: string) => {
    Alert.alert(
      'Delete Contact',
      `Remove ${contactName} from your directory?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            setContacts((prev) => prev.filter((c) => c.id !== id)),
        },
      ]
    );
  };

  // Search filter — naam se dhundo
  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderContact = ({ item }: { item: Contact }) => {
    const avatarColor = getAvatarColor(item.name);
    const initials = getInitials(item.name);

    return (
      <View style={styles.card}>
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactPhone}>{item.phone}</Text>
          {item.notes ? (
  <Text style={{ fontSize: 12, color: "#666" }}>
    {item.notes}
  </Text>
) : null}
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id, item.name)}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#3F51B5" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Contact Directory</Text>
        <Text style={styles.headerSubtitle}>
          {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
        </Text>
      </View>

      {/* Add Contact Form */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number (max 10 digits)"
          placeholderTextColor="#aaa"
          value={phone}
          onChangeText={handlePhoneChange}
          keyboardType="number-pad"
          maxLength={10}
        />
        <TextInput
  style={styles.input}
  placeholder="Notes (optional)"
  placeholderTextColor="#aaa"
  value={notes}
  onChangeText={setNotes}
/>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddContact}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+ Add Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        {/* Search clear button */}
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Contact List */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContact}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👤</Text>
            <Text style={styles.emptyText}>
              {search.length > 0 ? 'No results found' : 'No contacts yet'}
            </Text>
            <Text style={styles.emptySubText}>
              {search.length > 0
                ? 'Try a different name'
                : 'Add your first contact above'}
            </Text>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  header: {
    backgroundColor: '#3F51B5',
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#C5CAE9',
    marginTop: 4,
  },
  form: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  input: {
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#222',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#3F51B5',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 10,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: '#333',
  },
  clearSearch: {
    fontSize: 14,
    color: '#aaa',
    paddingHorizontal: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cardInfo: { flex: 1 },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 3,
  },
  contactPhone: {
    fontSize: 13,
    color: '#888',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#E53935',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  emptySubText: { fontSize: 13, color: '#aaa' },
});