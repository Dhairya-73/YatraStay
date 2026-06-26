# YatraStay
YatraStay is a full-stack property rental web application similar to airbnb website built using MERN stack along with HTML, CSS, JavaScript, and EJS templating. It allows users to browse, create, edit, and delete property listings through a clean and responsive user interface.

# Phase 1: Listings, UI & Middleware Foundation

- Basic Express project setup
- MongoDB integration using Mongoose
- Listing model creation
- Database initialization with sample data
- RESTful CRUD operations for listings
- Index, show, create, edit, and update routes
- EJS templating with boilerplate layout
- Navbar and footer components
- Styling for listings (index, new, edit, show pages)
- Client-side form validation
- Server-side schema validation using Joi
- Custom error handling with ExpressError
- Async error handling using wrapAsync
- Centralized error page (error.ejs)

# Phase 2: Reviews, Authentication & Authorization

- Review model and CRUD operations
- Nested review routes with Express Router
- Server-side validation using Joi
- Flash messages with connect-flash
- Cookies and Express sessions
- User authentication using Passport.js
- Login, signup, logout functionality
- Authorization for listings and reviews
- Listing ownership and review ownership
- Improved UI and flash messaging

# Phase 3: Yatra Sathi AI & Premium UI Updates

- Yatra Sathi AI Travel Companion powered by Gemini API
- Fully integrated dark mode toggle with high-contrast stylesheets
- Premium Airbnb-style segmented search pill on homepage hero
- Realistic database seeding with 15+ stays across India
- Multi-option hotel photo submission (local files + text URLs)
- Fail-safe global image fallback handlers to prevent broken assets
- Orphaned database reference checking to prevent dashboard crashes
