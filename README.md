# 📋 Contact Directory App

A robust, secure, and user-friendly mobile application built with React Native (Expo) and Supabase. This app allows users to manage their personal contacts securely, complete with profile image uploads and real-time data handling.

## 🚀 Core Features

* **Secure Authentication:** Google OAuth integration using Supabase Auth.
* **Personalized Directory:** Users can add, view, and delete contacts. Row Level Security (RLS) ensures that users can *only* see and manage their own data.
* **Media Storage:** Integrated Expo Image Picker and Supabase Storage to handle profile image uploads via FormData for seamless network request handling in React Native.
* **Smart UI/UX:** Clean interface with loading states, error handling, automatic avatar generation (initials & dynamic colors) for contacts without images, and real-time search/filtering functionality.

## 🛠️ Tech Stack & Architecture Decisions

* **Frontend:** React Native with Expo. 
  * *Decision:* Expo was chosen for its rapid development cycle, built-in library support (like WebBrowser for Auth and ImagePicker), and cross-platform consistency.
* **Backend as a Service (BaaS):** Supabase
  * *Auth:* Handles Google OAuth securely without needing a custom backend server.
  * *Database (PostgreSQL):* Stores contact details (`id`, `name`, `phone`, `notes`, `user_id`, `image_url`).
  * *Storage:* A public bucket (`avatars`) is used to store uploaded images, returning a public URL saved directly to the database.
* **Security:** Supabase Row Level Security (RLS) is strictly enforced on the `contacts` table and `avatars` storage bucket. Policies ensure `auth.uid() = user_id`, guaranteeing complete data privacy.

## ⚙️ Setup & Installation Instructions

To run this project locally, follow these steps:

**1. Clone the repository**
\`\`\`bash
git clone <your-repository-url>
cd contactAppNew
\`\`\`

**2. Install Dependencies**
\`\`\`bash
npm install
\`\`\`

**3. Environment Configuration**
Create a `supabase.ts` file in the root directory and add your Supabase credentials:
\`\`\`typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
\`\`\`

**4. Start the Application**
\`\`\`bash
npx expo start -c
\`\`\`
*Scan the QR code with the Expo Go app on your physical device, or press 'a' for Android emulator / 'i' for iOS simulator.*

## 💡 Note on Image Uploads in React Native
To ensure reliable image uploads and bypass standard React Native `fetch` blob network errors, images are processed and uploaded using `FormData`.
