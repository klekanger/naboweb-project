---
inclusion: always
---

# Product Context & Business Rules

## Application Overview

Gartnerihagen Boligsameie v2.0 - Norwegian housing cooperative digital platform serving residents and board members.

## User Roles & Permissions

### Public Users

- View general information, blog posts, public pages
- No authentication required
- Norwegian language interface

### Residents (Authenticated)

- Access protected content and community features
- Participate in message board discussions
- View meeting minutes and documents
- Receive email notifications for updates

### Board Members (Elevated Permissions)

- All resident permissions plus:
- Content management through Sanity CMS
- User administration and role management
- Send community-wide email alerts
- Moderate discussions and manage messages

## Content Strategy

- **Norwegian-first** - All user-facing content in Norwegian (nb-NO)
- **Accessibility** - WCAG 2.1 AA compliance for public services
- **Mobile-responsive** - Primary access via mobile devices
- **SEO optimized** - Proper meta tags and structured data

## Business Logic

### Message Board

- Residents can create, edit, and delete their own messages
- Board members can moderate all content
- Email notifications for new messages (configurable per user)
- Comments system with nested replies

### Document Library

- Categorized by document type (meeting minutes, announcements, etc.)
- Role-based access control for sensitive documents
- File upload through Sanity with proper validation
- Search and filtering capabilities

### User Management

- Clerk authentication with Norwegian localization
- Custom role assignment by board members
- User invitation system for new residents
- Subscription status tracking for premium features

## Technical Constraints

- **Performance** - Target <3s page load times
- **Security** - All user data must be properly protected
- **Compliance** - GDPR compliance for EU residents
- **Reliability** - 99.9% uptime for critical features

## Content Guidelines

- Use formal Norwegian ("De" form) for official communications
- Maintain consistent tone across all content
- Include proper alt text for all images
- Ensure all forms have proper validation and error messages
