import { makeRedirectUri } from 'expo-auth-session';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../supabase';

WebBrowser.maybeCompleteAuthSession();

type Contact = {
  id: string;
  name: string;
  phone: string;
  notes?: string;
  image_url?: string;
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
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null); // <-- BASE64 STATE
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null); 

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setContacts([]); 
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const redirectUrl = makeRedirectUri(); 

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true, 
        },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

        if (result.type === 'success' && result.url) {
          const hash = result.url.split('#')[1];
          if (hash) {
            const params: any = {};
            hash.split('&').forEach(pair => {
              const [key, value] = pair.split('=');
              params[key] = decodeURIComponent(value);
            });

            if (params.access_token && params.refresh_token) {
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: params.access_token,
                refresh_token: params.refresh_token,
              });

              if (sessionError) {
                Alert.alert('Error', sessionError.message);
              }
            }
          }
        }
      }
    } catch (err: any) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      Alert.alert('Error', 'Could not load contacts');
    } else {
      setContacts(data || []);
    }
    setLoading(false);
  };

  const handlePhoneChange = (text: string) => {
    const digitsOnly = text.replace(/[^0-9]/g, '');
    if (digitsOnly.length <= 10) setPhone(digitsOnly);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true, // <-- AB IMAGE SEEDHA BASE64 MEIN BHI MILEGI
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || null);
    }
  };

  // 1. Naya Upload Logic (Using FormData - 100% Network Proof)
  const uploadImage = async (uri: string) => {
    try {
      const fileExt = uri.split('.').pop() || 'jpeg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // FormData create kar rahe hain
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        name: fileName,
        type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
      } as any);

      // Uploading through FormData
      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, formData);

      if (error) {
        console.log("Supabase Error Details:", error);
        throw error;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      console.error("Image upload failed:", error);
      Alert.alert("Upload Failed", "Network request failed. Console check karo.");
      return null;
    }
  };

  // 2. Updated Handle Add Contact
  const handleAddContact = async () => {
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

    setLoading(true);

    // Image upload call
    let uploadedImageUrl = null;
    if (imageUri) {
      uploadedImageUrl = await uploadImage(imageUri);
    } // <-- YEH BRACKET PEHLE MISS HO GAYA THA
    
    const { error } = await supabase.from('contacts').insert([
      {
        name: trimmedName,
        phone: trimmedPhone,
        notes: notes || '',
        user_id: user.id,
        image_url: uploadedImageUrl,
      },
    ]);

    if (error) {
      Alert.alert('Error', 'Could not add contact: ' + error.message);
    } else {
      setName('');
      setPhone('');
      setNotes('');
      setImageUri(null);
      // setImageBase64(null); 
    }
    fetchContacts(); // 
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
          onPress: async () => {
            const { error } = await supabase.from('contacts').delete().eq('id', id);
            if (error) {
              Alert.alert('Error', 'Could not delete contact');
            } else {
              fetchContacts();
            }
          },
        },
      ]
    );
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderContact = ({ item }: { item: Contact }) => {
    const avatarColor = getAvatarColor(item.name);
    const initials = getInitials(item.name);

    return (
      <View style={styles.card}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}
        
        <View style={styles.cardInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactPhone}>{item.phone}</Text>
          {item.notes ? (
            <Text style={{ fontSize: 12, color: '#666' }}>{item.notes}</Text>
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

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#3F51B5' }}>
          📋 Contact Directory
        </Text>
        <Text style={{ textAlign: 'center', color: '#666', marginBottom: 30 }}>
          Please login to manage your personal contacts securely.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: '#DB4437', padding: 15, borderRadius: 8, width: '100%' }}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 }}>
            {loading ? 'Opening Browser...' : 'Login with Google'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#3F51B5" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Contact Directory</Text>
        <Text style={styles.headerSubtitle}>
          {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
        <TouchableOpacity
          style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#E53935', padding: 8, borderRadius: 6, alignSelf: 'flex-end' }}
          onPress={handleLogout}
        >
          <Text style={{ color: '#E53935', fontWeight: '600', fontSize: 12 }}>
            Logout ({user.email})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <TouchableOpacity onPress={pickImage} style={{ alignSelf: 'center', marginBottom: 15 }}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={{ width: 60, height: 60, borderRadius: 30 }} />
          ) : (
            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 24 }}>📷</Text>
            </View>
          )}
          <Text style={{ color: '#3F51B5', marginTop: 5, fontSize: 12, textAlign: 'center' }}>
            {imageUri ? 'Change' : 'Add Photo'}
          </Text>
        </TouchableOpacity>

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
          style={[styles.addButton, loading && { opacity: 0.6 }]}
          onPress={handleAddContact}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Text style={styles.addButtonText}>
            {loading ? 'Saving...' : '+ Add Contact'}
          </Text>
        </TouchableOpacity>
      </View>

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
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <Text style={{ textAlign: 'center', color: '#aaa', marginBottom: 8 }}>
          Loading...
        </Text>
      )}

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
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  header: {
    backgroundColor: '#3F51B5',
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 13, color: '#C5CAE9', marginTop: 4 },
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
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: 0.3 },
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
  searchInput: { flex: 1, height: 44, fontSize: 15, color: '#333' },
  clearSearch: { fontSize: 14, color: '#aaa', paddingHorizontal: 4 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
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
    backgroundColor: '#ddd',
  },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardInfo: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: '600', color: '#1A1A2E', marginBottom: 3 },
  contactPhone: { fontSize: 13, color: '#888' },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteButtonText: { color: '#E53935', fontSize: 12, fontWeight: '700' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 6 },
  emptySubText: { fontSize: 13, color: '#aaa' },
});