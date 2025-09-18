// components/admin/ModerationDashboard.tsx
export function ModerationQueue() {
  const [pendingContent, setPendingContent] = useState([]);
  const [moderator] = useAuth();
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1>Moderation Queue ({pendingContent.length}/50)</h1>
        <div className="flex gap-2">
          <button onClick={() => approveAll()}>Approve All</button>
          <button onClick={() => flagContent()}>Flag Content</button>
        </div>
      </div>
      
      <div className="space-y-4">
        {pendingContent.map(item => (
          <ModerationItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}