# SolanaSpeakPay 🎤💸

> **"Just speak your payment intent—AI handles everything else."**

A voice-activated cross-chain payment agent for Solana Mobile. Making crypto accessible through natural conversation.

[![Built for Solana Mobile](https://img.shields.io/badge/Solana-Mobile-14F195?logo=solana)](https://solanamobile.com)
[![Powered by LiFi](https://img.shields.io/badge/Cross--Chain-LiFi-6C5CE7)](https://li.fi)
[![Voice by ElevenLabs](https://img.shields.io/badge/Voice-ElevenLabs-000000)](https://elevenlabs.io)

## 🎯 Vision

Make cryptocurrency payments as simple as speaking. SolanaSpeakPay eliminates blockchain complexity through voice-activated AI, making crypto accessible to:
- 👁️ Users with visual impairments
- 🚗 People multitasking (driving, cooking, working)
- 🆕 Anyone intimidated by traditional crypto interfaces

## ✨ Key Features

### 🎙️ Voice-First Interface
- **Natural Commands**: "Send 10 USDC to Sarah"
- **Continuous Listening**: Hands-free operation
- **Multi-Accent Support**: English variants (US, UK, AU, IN)
- **Real-Time Feedback**: Visual transcription + voice confirmations

### 🔗 Cross-Chain Bridging
- **Seamless Transfers**: Ethereum → Solana via LiFi Protocol
- **Smart Routing**: Automatic best rate selection
- **Progress Updates**: Voice announcements for multi-step bridges
- **Supported Tokens**: USDC, USDT, ETH (wrapped)

### 🤖 AI-Powered Intelligence
- **Intent Recognition**: Understands payment, bridge, balance queries
- **Context Awareness**: Remembers contacts and recent transactions
- **Ambiguity Resolution**: Asks clarifying questions when needed
- **Error Recovery**: Graceful fallbacks for unclear commands

### 📱 Solana Mobile Native
- **Saga Integration**: Native Solana Mobile Wallet Adapter
- **Mobile-First Design**: Optimized for touch and voice
- **Responsive UI**: Works on all screen sizes
- **PWA Ready**: Install as native app

### 🔐 Security & Privacy
- **Non-Custodial**: You control your keys
- **No Backend**: Fully client-side architecture
- **Encrypted Storage**: Local contact data protection
- **Secure Connections**: HTTPS + wallet adapter security

### ♿ Accessibility
- **WCAG 2.1 AA Compliant**: Full accessibility standards
- **Screen Reader Support**: Compatible with assistive technologies
- **Voice-Only Operation**: Complete functionality without screen
- **High Contrast Mode**: For low vision users

## 🚀 Quick Start

### Prerequisites
```bash
Node.js >= 18.0.0
npm or yarn
Solana Mobile Wallet (Phantom, Solflare, etc.)
```

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/solana-speak-pay.git
cd solana-speak-pay

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys (OpenAI/Anthropic, ElevenLabs, Helius)
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
npm start
```

## 🎤 Voice Commands

### Payments
```
"Send 5 SOL to Alice"
"Transfer 10 USDC to 7x3kN...9mPq"
"Pay Sarah 25 dollars in USDC"
```

### Cross-Chain Bridging
```
"Bridge 100 USDC from Ethereum"
"Move my ETH from Polygon to Solana"
```

### Account Queries
```
"What's my balance?"
"How much USDC do I have?"
"Show my recent transactions"
"What's my wallet address?"
```

### Contact Management
```
"Save this address as Mom"
"Add John's wallet"
"What's Sarah's address?"
```

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand

### Blockchain
- **Solana**: @solana/web3.js, @solana/spl-token
- **Wallet**: @solana-mobile/mobile-wallet-adapter
- **Cross-Chain**: @lifi/sdk
- **RPC**: Helius / QuickNode

### AI & Voice
- **Voice Input**: Web Speech API (SpeechRecognition)
- **Voice Output**: ElevenLabs API
- **NLP**: OpenAI GPT-4 / Anthropic Claude
- **Command Parsing**: Structured JSON prompts

### Deployment
- **Hosting**: Vercel
- **Storage**: LocalStorage + IndexedDB (client-side only)

## 📂 Project Structure

```
solana-speak-pay/
├── app/                          # Next.js app directory
│   ├── page.tsx                 # Main application page
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   └── api/                     # API routes (if needed)
├── components/                   # React components
│   ├── VoiceInput.tsx           # Voice recognition component
│   ├── TransactionConfirm.tsx   # Transaction confirmation modal
│   ├── ContactManager.tsx       # Contact management UI
│   └── TransactionHistory.tsx   # Transaction list
├── lib/                         # Utility functions & integrations
│   ├── solana/                  # Solana blockchain integration
│   │   ├── wallet.ts           # Wallet adapter setup
│   │   ├── transactions.ts     # Transaction builders
│   │   └── tokens.ts           # SPL token operations
│   ├── voice/                   # Voice recognition & synthesis
│   │   ├── recognition.ts      # Web Speech API wrapper
│   │   └── synthesis.ts        # ElevenLabs integration
│   ├── ai/                      # AI command processing
│   │   ├── parser.ts           # Command parsing logic
│   │   └── prompts.ts          # AI prompt templates
│   ├── bridge/                  # Cross-chain bridging
│   │   └── lifi.ts             # LiFi Protocol integration
│   └── storage/                 # Local data management
│       ├── contacts.ts         # Contact storage
│       └── history.ts          # Transaction history
├── types/                       # TypeScript type definitions
├── hooks/                       # Custom React hooks
└── public/                      # Static assets
```

## 🗺️ Roadmap

### Current Status: In Development 🚧

- [x] Project initialization
- [ ] Voice recognition system
- [ ] Solana wallet integration
- [ ] AI command parsing
- [ ] Basic payment functionality
- [ ] Cross-chain bridging (LiFi)
- [ ] Voice feedback (ElevenLabs)
- [ ] Contact management
- [ ] Transaction history
- [ ] Mobile optimization
- [ ] Accessibility compliance

### Future Enhancements
- Multi-language support
- Biometric voice authentication
- Recurring payments
- DeFi voice commands
- NFT transfers
- Payment request generation

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```bash
# AI Provider (choose one)
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key
# OR
NEXT_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_key

# Voice Synthesis
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key

# Solana RPC (choose one)
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_key
# OR
NEXT_PUBLIC_QUICKNODE_ENDPOINT=your_quicknode_url

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Wallet Setup

1. Install a Solana wallet (Phantom, Solflare, etc.)
2. Connect to Devnet for testing
3. Get test SOL from [Solana Faucet](https://faucet.solana.com)

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Test voice recognition
npm run test:voice

# Test on mobile (requires device)
npm run dev -- --host
```

## 📱 Mobile Testing

### On Solana Saga
1. Enable developer mode
2. Connect via USB or use local network
3. Access via `http://your-ip:3000`
4. Test with Solana Mobile Wallet Adapter

### On Other Devices
1. Deploy to Vercel or use ngrok
2. Access via HTTPS (required for voice API)
3. Install as PWA for native experience

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write accessible code (WCAG 2.1 AA)
- Test voice commands thoroughly
- Document new features

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- **Solana Foundation** - For Solana Mobile Stack
- **LiFi Protocol** - For cross-chain infrastructure
- **ElevenLabs** - For natural voice synthesis
- **Accessibility Community** - For feedback and testing

## 📞 Support

- **Documentation**: [Full PRD](./PRD.md)
- **Issues**: [GitHub Issues](https://github.com/sublime247/solana-speak-pay/issues)
- **Discord**: [Join our community](#)
- **Twitter**: [@SolanaSpeakPay](#)

---

**Built with ❤️ for the accessibility-first crypto community**

*Making blockchain technology accessible to everyone, one voice command at a time.*
