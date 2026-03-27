# 📋 Contact Directory App

This is a mobile application built for my internship assignment using **React Native (Expo)** and **Supabase**. [span_2](start_span)[span_3](start_span)It allows users to securely manage their personal contacts with profile images[span_2](end_span)[span_3](end_span).

## ✨ Features

* **[span_4](start_span)Google Login:** Secure authentication using Supabase Auth[span_4](end_span).
* **[span_5](start_span)Contact Management:** You can add new contacts, view them in a list, and delete them[span_5](end_span).
* **[span_6](start_span)Image Upload:** Supports picking photos from the gallery and saving them to Supabase Storage[span_6](end_span).
* **[span_7](start_span)Data Privacy:** Uses Row Level Security (RLS) so users can only see their own contacts[span_7](end_span).
* **Search Function:** Easily filter through your contact list by name.

## 🛠️ Tech Stack

* **[span_8](start_span)Frontend:** React Native (Expo)[span_8](end_span).
* **[span_9](start_span)Backend:** Supabase (Database, Auth, and Storage)[span_9](end_span).

## ⚙️ How to Setup

1. **Clone the repo:** `git clone <your-repo-url>`
2. **Install dependencies:** `npm install`
3. **Configure Supabase:** Add your project URL and Anon Key in the `supabase.ts` file.
4. **Run the app:** Use the command `npx expo start -c`
5. **Open on Device:** Scan the QR code using the **Expo Go** app on your phone.

## 💡 Technical Note
I used **FormData** for image uploads to ensure the network requests work smoothly on mobile devices without any "Network Request Failed" errors.
