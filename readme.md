Prarthna Manufacturing Order Management System

A full-stack web application designed for Prarthna Manufacturing Pvt. Ltd. that streamlines the process of placing, tracking, and managing orders for sheet metal products. The application features a modern, responsive interface and robust back-end services.

Key Features
User Authentication & Role-Based Access:
Secure signup and login functionality (with OTP verification) that supports multiple user roles including admin, customer, and noter. Users are routed to their respective dashboards using protected routes.

Product Catalog & Cart Management:
Customers and noters can browse a comprehensive product catalog, adjust item quantities, and manage their shopping carts. Both roles can add products, update quantities, and remove items with real-time updates.

Order Placement & Tracking:
Once items are in the cart, users can place orders with validations (phone number format, delivery date checks, etc.). Orders include detailed tracking stages that can be updated by administrators, offering clear visibility into each step of the manufacturing and delivery process.

Admin Dashboard:
The admin panel allows for full order management. Admins can review orders, update order statuses (e.g., Accepted, Rejected), edit tracking information, and delete orders if necessary.

Notification System:
Automated notifications are sent out via email (using NodeMailer) and WhatsApp (using Twilio) to inform both customers and admins about new orders and order status updates.

Modern UI & UX:
Built using React with Material UI components, the interface features interactive modals, smooth transitions (using Framer Motion), and an engaging particles background for enhanced visual appeal.

Security & Performance:
The back-end (built with Express and MongoDB/Mongoose) includes security best practices such as JWT-based authentication, rate limiting, CORS, and Helmet for HTTP header security.

Technologies Used
Frontend: React, Material UI, Framer Motion, React-Scroll, React Simple Typewriter, @tsparticles
Backend: Express, MongoDB/Mongoose, JWT, NodeMailer, Twilio, Helmet, Rate Limit, Cookie Parser
Others: Context API for state management, Responsive CSS (mobile-first approach)
