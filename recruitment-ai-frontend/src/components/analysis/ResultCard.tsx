import ReactMarkdown from 'react-markdown'; // npm install react-markdown

export default function ResultCard({ content }: { content: string }) {
  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
      <h3 className="text-xl font-bold mb-4 text-gray-800">AI Auditor Findings</h3>
      <div className="prose prose-blue max-w-none text-gray-600">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}