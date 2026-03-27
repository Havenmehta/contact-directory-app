​Contact Directory App
​This is a mobile application built for my internship assignment using React Native (Expo) and Supabase. It allows users to securely manage their personal contacts with profile images.  
​Features
​Google Login: Secure authentication using Supabase Auth to keep user data private.  
​Contact Management: Users can add new contacts, view them in a list, and delete them easily.  
​Image Upload: Supports picking photos from the gallery and saving them to Supabase Storage.  
​Data Privacy: Uses Row Level Security (RLS) so each user can only see their own contacts.  
​Search Function: Built-in search functionality to quickly find contacts by name.  
​Tech Stack
​Frontend: React Native (Expo).  
​Backend: Supabase (Database, Auth, and Storage).  
​How to Setup
​Clone the repo: git clone <your-repo-url>
​Install dependencies: npm install
​Configure Supabase: Add your project URL and Anon Key in the supabase.ts file.
​Run the app: Use the command npx expo start -c
​Open on Device: Scan the QR code using the Expo Go app on your phone.
​Technical Note
​I implemented FormData for image uploads to ensure the network requests are stable and bypass common React Native fetch issues.