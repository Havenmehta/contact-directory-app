# 📋 Contact Directory App

This is a mobile application built for my internship assignment using **React Native (Expo)** and **Supabase**. [span_0](start_span)[span_1](start_span)It allows users to securely manage their personal contacts with profile images.[span_0](end_span)[span_1](end_span)

## ✨ Features

* **[span_2](start_span)Google Login:** Secure authentication using Supabase Auth to keep user data private.[span_2](end_span)
* **[span_3](start_span)Contact Management:** Users can add new contacts, view them in a list, and delete them easily.[span_3](end_span)
* **[span_4](start_span)Image Upload:** Supports picking photos from the gallery and saving them to Supabase Storage.[span_4](end_span)
* **[span_5](start_span)Data Privacy:** Uses Row Level Security (RLS) so each user can only see their own contacts.[span_5](end_span)
* **Search Function:** Built-in search functionality to quickly find contacts by name.

## 🛠️ Tech Stack

* **[span_6](start_span)Frontend:** React Native (Expo).[span_6](end_span)
* **[span_7](start_span)Backend:** Supabase (Database, Auth, and Storage).[span_7](end_span)

## ⚙️ How to Setup

1. **Clone the repo:** `git clone <your-repo-url>`
2. **Install dependencies:** `npm install`
3. **Configure Supabase:** Add your project URL and Anon Key in the `supabase.ts` file.
4. **Run the app:** Use the command `npx expo start -c`
5. **Open on Device:** Scan the QR code using the **Expo Go** app on your phone.

## 💡 Technical Note
I implemented **FormData** for image uploads to ensure the network requests are stable and bypass common React Native fetch issues.
