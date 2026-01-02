# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest | :x:                |

## Reporting a Vulnerability

We take the security of CV AI Enhancer seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do NOT:

- Open a public GitHub issue
- Discuss the vulnerability publicly
- Share the vulnerability with others until it has been resolved

### Please DO:

1. **Email us directly** with:
   - A clear description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact of the vulnerability
   - Any suggested fixes (if you have them)

2. **Include details**:
   - Affected versions
   - Environment details (OS, Node.js version, etc.)
   - Proof of concept (if applicable)
   - Any additional context

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
- **Initial Assessment**: We will provide an initial assessment within 7 days
- **Updates**: We will keep you informed of our progress
- **Resolution**: We will work to resolve the issue as quickly as possible

### Disclosure Policy

- We will work with you to understand and resolve the issue quickly
- We will credit you for the discovery (if you wish)
- We will not disclose your identity without your permission
- We will notify you before public disclosure

### Security Best Practices

When using CV AI Enhancer, please follow these security best practices:

1. **Environment Variables**: Never commit `.env` files or expose API keys
2. **Supabase Keys**: Keep `SUPABASE_SERVICE_ROLE_KEY` secret - never expose it client-side
3. **OpenAI API Key**: Keep your OpenAI API key secure and use environment variables
4. **Trigger.dev Keys**: Keep `TRIGGER_SECRET_KEY` secret
5. **Database**: Use strong passwords and enable Row Level Security (RLS) policies
6. **Updates**: Keep dependencies up to date
7. **Authentication**: Always use Supabase Auth for user authentication
8. **Authorization**: Rely on RLS policies for data access control

### Known Security Considerations

- **API Keys**: All API keys should be stored in environment variables, never in code
- **Service Role Keys**: The Supabase service role key bypasses RLS - use with caution
- **Client-Side Code**: Only `NEXT_PUBLIC_*` variables are safe to expose in client-side code
- **File Uploads**: Validate file types and sizes for uploaded CVs and images
- **SQL Injection**: Use Prisma ORM to prevent SQL injection (never use raw SQL with user input)

### Security Updates

Security updates will be released as patches to the latest version. We recommend:

- Keeping dependencies up to date
- Reviewing security advisories for dependencies
- Monitoring the repository for security updates

### Questions?

If you have questions about security, please:

- Review the [documentation](./README.md)
- Check existing [issues](https://github.com/your-repo/cv-ai-enancher/issues)
- Contact us at [INSERT CONTACT EMAIL] (for non-security questions)

Thank you for helping keep CV AI Enhancer and its users safe!

