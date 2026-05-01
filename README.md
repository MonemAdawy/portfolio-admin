# Portfolio Admin Dashboard

A lightweight admin interface for managing a portfolio website. This project uses plain React UMD components, Tailwind CSS, and Font Awesome to deliver an authenticated dashboard experience for managing projects, services, skills, and contact messages.

## Key Features

- Authenticated admin dashboard with login/logout flow
- Tabbed navigation for Projects, Services, Skills, and Contacts
- API integration via configurable API_BASE_URL
- Toast notifications for user feedback
- Responsive layout with Tailwind CSS styling

## Technology Stack

- HTML5 + JavaScript
- React (UMD build loaded from CDN)
- Tailwind CSS
- Font Awesome icons
- Fetch API wrapper for backend requests

## Setup

1. Configure the API base URL in js/config.js:
   - window.API_BASE_URL = 'http://localhost:3000/api';
   - Replace with your production API endpoint as needed.
2. Serve the project from a local web server to ensure API requests work correctly.
   - Example: use 
px http-server or any static file server.
3. Open index.html in the browser.

## Folder Structure

- index.html — main dashboard entry point
- js/config.js — app configuration and API base URL
- js/utils.js — reusable utilities, fetch wrapper, and UI components
- js/dashboard.js — dashboard layout, authentication, and tab management
- js/projects.js — project management components
- js/services.js — service management components
- js/skills.js — skill management components
- js/contacts.js — contact message management components

## Notes

- This repository is designed as a frontend admin panel and expects a backend API for authentication and data management.
- Ensure credentials: 'include' is supported by your backend if using cookies for auth.
- The dashboard uses CDN-hosted React and Tailwind resources for quick prototyping.

