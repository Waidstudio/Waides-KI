import ChatOracleSystem from '@/components/ChatOracleSystem';

export default function ChatOracle() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Waides KI Chat Oracle
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Advanced AI system combining Incite AI, ChatGPT, and KonsLang processing. 
            Ask anything about trading, market analysis, or technical strategies.
          </p>
        </div>

        {/* Chat Oracle System */}
        <ChatOracleSystem />
      </div>
    </div>
  );
}