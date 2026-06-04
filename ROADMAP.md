# Senlo Roadmap 🚀

This document outlines the planned features and improvements for the Senlo Email Infrastructure. Our goal is to create the most reliable, developer-friendly, and extensible open-source platform for transactional and lifecycle emails.

## Planned Features

### Core Infrastructure & Reliability

- [x] **Background Processing with BullMQ**: Migrate email sending to a robust queue system to handle large volumes, retries, and rate limiting efficiently.
- [x] **Event Tracking (Resend)**: Implemented webhooks for tracking email opens and clicks for Resend provider.
- [ ] **Multi-Provider Webhooks**: Implement bounce, complaint, open, and click tracking for Postmark, Mailgun, and AWS SES.
- [x] **Advanced Analytics**: Detailed tracking of unique vs. total opens and delivery performance.

### API & Developer Experience

- [x] **Public API Expansion**: Enable full management of Audience Lists (create, delete, append contacts) via REST API.
- [x] **Comprehensive API Documentation**: Interactive documentation (Swagger/OpenAPI) for seamless integration with third-party systems.

### Email Editor & Personalization

- [x] **Conditional Content**: Support for `if/else` logic within the editor to show or hide blocks based on contact attributes or tags.
- [x] **Dynamic Subjects**: Support for Merge Tags in email subjects and API-level subject overrides for transactional flows.
- [ ] **Dark Mode Support**: A complete dark theme for the Dashboard and Editor with a dedicated theme toggle.
- [ ] **Template Gallery**: A library of high-quality, pre-designed templates for common use cases (Welcome, Invoices, Newsletters).

### Automation & Lifecycle

- [ ] **Visual Automation Builder**: A drag-and-drop workflow editor for automated email sequences (e.g., onboarding series or lifecycle triggers).

### Integrations

- [ ] **Amazon SES Support**: Native integration with AWS SES for cost-effective, high-volume email sending.
- [ ] **Postmark & Mailgun Support**: Enhanced native support for Postmark and Mailgun transactional flows.

---

_Note: This list is not exhaustive and priorities may shift based on project needs and community feedback._
