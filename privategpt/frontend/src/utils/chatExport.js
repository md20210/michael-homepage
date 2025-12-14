// Chat Export Utilities

/**
 * Export chat messages as TXT file
 * @param {Array} messages - Array of message objects
 * @param {string} filename - Optional custom filename
 */
export function exportChatAsTXT(messages, filename = 'privategpt-chat') {
  if (!messages || messages.length === 0) {
    return;
  }

  // Format messages as readable text
  const chatText = messages.map(msg => {
    const timestamp = new Date(msg.created_at).toLocaleString('de-DE', {
      dateStyle: 'short',
      timeStyle: 'short'
    });

    const role = msg.role === 'user' ? 'Du' : 'PrivateGxT AI';
    const source = msg.source_type ? `[${msg.source_type.toUpperCase()}]` : '';

    return `[${timestamp}] ${role} ${source}\n${msg.content}\n`;
  }).join('\n---\n\n');

  // Add header
  const header = `PrivateGxT Chat Export\nExportiert am: ${new Date().toLocaleString('de-DE')}\nAnzahl Nachrichten: ${messages.length}\n\n${'='.repeat(60)}\n\n`;

  const fullText = header + chatText;

  // Create and download file
  downloadFile(fullText, `${filename}.txt`, 'text/plain');
}

/**
 * Export chat messages as JSON file
 * @param {Array} messages - Array of message objects
 * @param {string} filename - Optional custom filename
 */
export function exportChatAsJSON(messages, filename = 'privategpt-chat') {
  if (!messages || messages.length === 0) {
    return;
  }

  const exportData = {
    export_date: new Date().toISOString(),
    export_format: 'PrivateGxT Chat Export v1.0',
    message_count: messages.length,
    messages: messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      created_at: msg.created_at,
      source_type: msg.source_type || null,
      source_details: msg.source_details || null,
    }))
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  downloadFile(jsonString, `${filename}.json`, 'application/json');
}

/**
 * Helper function to download a file
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
