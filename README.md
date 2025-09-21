# FirmFlow Frontend

A modern, minimalist document processing platform built with Next.js, TypeScript, and TailwindCSS. FirmFlow enables users to upload documents, process them with AI, and integrate with automation tools like Zapier.

## Features

- 🚀 **Modern Stack**: Next.js 15, TypeScript, TailwindCSS
- 📄 **Document Upload**: Drag & drop file upload with real-time processing
- 🤖 **AI Processing**: Backend integration for document analysis
- 🔗 **Zapier Integration**: Send processed data to automation workflows
- 📱 **Responsive Design**: Mobile-first, minimalist UI
- 🎨 **Design System**: Consistent components and design tokens

## Pages

- **Landing Page** (`/`) - Hero section with features overview
- **Login** (`/login`) - User authentication
- **Signup** (`/signup`) - User registration
- **Dashboard** (`/dashboard`) - Document management with 2-column grid
- **Demo Upload** (`/demo-upload`) - File upload with processing status

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd firmflow-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/your-webhook-id/
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── demo-upload/       # File upload demo
│   ├── login/            # Authentication
│   ├── signup/           # User registration
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   │   ├── Button.tsx    # Button component
│   │   ├── Card.tsx      # Card component
│   │   ├── Input.tsx     # Input component
│   │   └── index.ts      # Component exports
│   └── Header.tsx        # Navigation header
└── lib/                  # Utilities and configuration
    ├── design-tokens.ts  # Design system tokens
    └── utils.ts          # Utility functions
```

## Design System

The application uses a minimalist black & white design system with:

- **Colors**: Monochromatic palette with subtle grays
- **Typography**: System font stack for optimal performance
- **Spacing**: Consistent 4px grid system
- **Components**: Reusable UI components with variants

## Backend Integration

The frontend integrates with a FastAPI backend for:

- File upload and processing
- Document analysis with AI
- Status polling for long-running tasks
- Zapier webhook integration

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and formatting: `npm run lint:fix && npm run format`
5. Submit a pull request

## License

This project is licensed under the MIT License.
