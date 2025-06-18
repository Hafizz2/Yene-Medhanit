# MedInfo Guide (Yene Medhanit) - Web Application

## 📚 Project Overview

MedInfo Guide, also known as "Yene Medhanit," is a web-based application designed to help users quickly identify medications and access crucial information. It offers flexible input methods, allowing users to either scan medication labels using their device's camera or input details manually. The app then provides relevant medication information powered by artificial intelligence, available in multiple languages.

## ✨ Features

* **Flexible Input**: Identify medications by scanning labels with a camera or by typing in details.
* **AI-Powered Information**: Utilizes the Google Gemini API to process input and deliver accurate medication data.
* **Multi-language Support**: Access medication information in various languages.
* **User-Friendly Interface**: Designed for easy navigation and clear display of information.
* **Smart Request Handling**: Includes client-side mechanisms to manage API request limits efficiently.
* **Informative Feedback**: Provides clear messages for various scenarios, including missing API configurations, rate limits, or general errors.
* **Analytics Capability**: Designed with a placeholder for future integration of usage analytics.
* **Ad Display Readiness**: Includes a placeholder for potential future advertisement integration.

## 🚀 Technologies Used

* **Frontend Framework**: React
* **Build System**: Vite
* **AI Integration**: Google Gemini API (`fetch` API client)
* **Styling**: Standard CSS / Tailwind CSS (if utilities are adopted)
* **Core Libraries**: React Hooks (for state and lifecycle management), `localStorage` (for client-side data persistence), Inline SVG for icons.
