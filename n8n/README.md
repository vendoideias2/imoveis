# n8n Workflows

This directory contains the JSON exports of the n8n workflows used in the CRM.

## Planned Workflows

1. **Lead Capture (Webhook)**
   - Trigger: Webhook from Landing Page / Facebook Ads
   - Action: Create Lead in CRM (POST /api/leads)
   - Action: Send WhatsApp Welcome Message

2. **WhatsApp Integration**
   - Trigger: Incoming Message (via API)
   - Action: Log interaction in CRM
   - Action: Check for automated response

3. **Proposal Generation**
   - Trigger: Status change to "Proposal"
   - Action: Generate PDF
   - Action: Email to Client
