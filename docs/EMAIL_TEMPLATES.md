# Email Templates System

The RelateAI platform includes a comprehensive email templates system that enables users to create, manage, and use reusable email templates with personalization features.

## Overview

The email templates system allows users to:

1. Create and manage email templates with personalization variables
2. Categorize templates for different use cases
3. Set default templates for each category
4. Preview templates with variable placeholders
5. Use templates when composing emails

## Key Features

### Template Creation and Management

- Create templates with a rich editor
- Categorize templates (Introduction, Follow-up, Meeting, Proposal, Custom)
- Add tags for better organization
- Set default templates for each category

### Personalization Variables

- Include dynamic variables in templates using the `{{variableName}}` syntax
- Automatic variable detection and listing
- Variable replacement during preview and sending

### Template Categories

- **Introduction**: Initial outreach to new contacts
- **Follow-up**: Messages after initial contact
- **Meeting**: Meeting requests and confirmations
- **Proposal**: Sales proposals and offers
- **Custom**: Any other types of templates

## Technical Implementation

### Backend

- MongoDB model for storing templates
- API endpoints for CRUD operations
- Email generation service for rendering templates
- Variable extraction and replacement

### Frontend

- Template creation and editing interface
- Template listing and filtering
- Preview functionality
- Template selection in email composer

## Usage

### Creating a Template

1. Navigate to Messages > Templates
2. Click "Create Template"
3. Fill in the template details
4. Add personalization variables using `{{variableName}}` syntax
5. Click "Create Template" to save

### Using a Template

1. When composing a new message
2. Click "Use Template"
3. Select a template from the list
4. The template content and subject will be inserted into the composer
5. Edit the content and fill in the personalization variables
6. Send the message

### Variable Syntax

Templates support variables using double curly braces:

```
Hello {{firstName}},

I hope this email finds you well. I wanted to follow up about our discussion regarding {{topic}} at {{companyName}}.

Best regards,
{{senderName}}
```

Common variables include:
- `{{firstName}}` - Recipient's first name
- `{{lastName}}` - Recipient's last name
- `{{companyName}}` - Recipient's company
- `{{topic}}` - Custom topic
- `{{senderName}}` - Your name

## Example Templates

### Introduction Template

```
Subject: Introduction from {{senderName}} at RelateAI

Hello {{firstName}},

I hope this email finds you well. My name is {{senderName}} from RelateAI, and I noticed that {{companyName}} is doing impressive work in the {{industry}} industry.

I'd love to connect and discuss how our AI-powered sales platform might help your team build better relationships with prospects. Would you be open to a brief conversation next week?

Best regards,
{{senderName}}
```

### Follow-up Template

```
Subject: Following up on our conversation

Hello {{firstName}},

I wanted to follow up on our conversation about {{topic}} last week. Have you had a chance to consider the points we discussed?

I'm happy to provide any additional information that might be helpful. Would it make sense to schedule a brief call to discuss next steps?

Best regards,
{{senderName}}
```

## Best Practices

1. **Keep templates concise**: Aim for 3-5 paragraphs maximum
2. **Use personalization thoughtfully**: Include variables that make the message feel personal
3. **Test templates**: Always preview before using
4. **Organize with tags**: Use tags to quickly find related templates
5. **Update regularly**: Refresh templates periodically to keep messaging fresh
