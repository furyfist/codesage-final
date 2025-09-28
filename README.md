# CodeSage - AI-Powered Interview Platform

CodeSage is a comprehensive AI-powered interview platform that combines voice-based conversations with coding challenges. Built with Next.js, TypeScript, and modern web technologies, it provides an interactive interview experience with real-time AI interviewers and coding assessments.

## 🚀 Features

### Core Features
- **AI Voice Interviews**: Real-time voice conversations with AI interviewers (Lisa & Bob)
- **Coding Environment**: Integrated Monaco editor for live coding challenges
- **Dynamic Interview Questions**: AI-generated questions based on interview objectives
- **Real-time Code Execution**: Execute and test code during interviews
- **Interview Analytics**: Comprehensive performance analysis and insights
- **PDF Document Processing**: Upload and analyze documents for context-aware interviews

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Real-time Feedback**: Instant feedback on coding solutions
- **Progress Tracking**: Monitor interview progress and performance
- **Multi-tenant Architecture**: Support for organizations and individual users

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Radix UI** - Accessible component primitives
- **Monaco Editor** - Code editor for coding challenges
- **Framer Motion** - Animation library

### Backend & Services
- **Supabase** - Backend-as-a-Service (Database, Auth)
- **Clerk** - User authentication and management
- **Retell AI** - Voice AI integration for interviews
- **OpenAI** - AI-powered question generation and analysis
- **LangChain** - AI/ML framework integration

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Docker** - Containerization
- **Prisma** - Database ORM

## 📋 Prerequisites

Before running the project, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** (optional, for containerized deployment)
- **Supabase Account** - For database and authentication
- **Clerk Account** - For user management
- **Retell AI Account** - For voice AI capabilities
- **OpenAI API Key** - For AI-powered features

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/codesage.git
cd codesage
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Retell AI
RETELL_API_KEY=your_retell_api_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

1. Set up your Supabase project
2. Run the SQL schema from `supabase_schema.sql`
3. Configure your database tables and relationships

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in detached mode
docker-compose up -d --build
```

### Using Dockerfile

```bash
# Build the Docker image
docker build -t codesage .

# Run the container
docker run -p 3000:3000 codesage
```

## 📁 Project Structure

```
codesage/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (client)/          # Client-side routes
│   │   ├── (user)/            # User-facing routes
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/                # Reusable UI components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   └── call/              # Interview/call components
│   ├── services/              # Business logic services
│   ├── contexts/              # React contexts
│   ├── types/                 # TypeScript type definitions
│   └── lib/                   # Utility functions
├── public/                    # Static assets
├── supabase_schema.sql       # Database schema
├── docker-compose.yml        # Docker configuration
├── Dockerfile               # Docker build configuration
└── package.json             # Dependencies and scripts
```

## 🎯 Key Components

### Interview System
- **Call Component**: Main interview interface with voice and coding panels
- **Interview Management**: Create, edit, and manage interview sessions
- **Question Generation**: AI-powered dynamic question creation
- **Real-time Analysis**: Live performance evaluation and feedback

### User Management
- **Authentication**: Secure user login and registration
- **Organization Support**: Multi-tenant architecture
- **Role-based Access**: Different permissions for users and admins

### AI Integration
- **Voice AI**: Real-time conversation with AI interviewers
- **Code Analysis**: AI-powered code review and suggestions
- **Insight Generation**: Automated interview insights and recommendations

## 🔧 API Endpoints

### Interview Management
- `POST /api/create-interview` - Create new interview
- `GET /api/get-call` - Retrieve interview data
- `POST /api/generate-interview-questions` - Generate AI questions

### Voice AI
- `POST /api/register-call` - Register voice call session
- `POST /api/response-webhook` - Handle voice response webhooks

### Coding Features
- `POST /api/coding/execute` - Execute code
- `POST /api/coding/get-hint` - Get coding hints
- `POST /api/coding/generate-problem` - Generate coding problems

## 🎨 Customization

### Adding New AI Interviewers
1. Create interviewer in the database
2. Configure voice settings in Retell AI
3. Update interviewer constants in `src/lib/constants.ts`

### Customizing UI Theme
- Modify Tailwind configuration in `tailwind.config.ts`
- Update component styles in `src/components/ui/`
- Customize color scheme and branding

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Build for production
npm run build
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API documentation

## 🙏 Acknowledgments

- **Retell AI** for voice AI capabilities
- **OpenAI** for AI-powered features
- **Supabase** for backend infrastructure
- **Clerk** for authentication services
- **shadcn/ui** for beautiful UI components

---

**CodeSage** - Revolutionizing the interview experience with AI-powered conversations and coding challenges.
