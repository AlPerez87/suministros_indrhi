# **App Name**: OfiStock Manager

## Core Features:

- Request Creation: Allow departmental users to create supply requests with up to 10 items each.
- Request Approval: Enable administrative users to approve or reject supply requests.
- Supply Dispatch: Manage approved requests, dispatch items, and update stock levels accordingly, preventing dispatch if `quantityManaged > quantityInStock`.
- Real-time Notifications: Notify supply team (via Firebase Cloud Messaging) of new approved requests and pending activities.
- Stock Entry: Facilitate the entry of new merchandise, updating article quantities upon saving.
- Reporting: Generate PDF/Excel reports on request history and current inventory.
- Role Management Tool: SuperAdmin to create and manage users, assign and change roles. This action will be triggered from Cloud Functions

## Style Guidelines:

- Primary color: A desaturated blue (##FF0000) reflecting stability and trust for a supply management system.
- Background color: Very light desaturated blue (#F0F8FF) for a clean, professional look.
- Accent color: A slightly darker and more saturated analogous blue (#2C3D7C) to highlight interactive elements.
- Headline font: 'Space Grotesk' sans-serif font to bring a scientific and techy feel to headlines, plus 'Inter' for body text
- Use minimalist icons to represent different articles, departments, and request statuses.
- Design a clean, table-based layout for managing requests, articles, and entries. Employ modals for detailed views and form inputs.
- Incorporate subtle transitions and animations to provide feedback on user interactions.