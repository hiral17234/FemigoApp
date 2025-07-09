
"use client";

import React from 'react';

// The URL for your Botpress webchat
const BOTPRESS_CHAT_URL = "https://cdn.botpress.cloud/webchat/v3.1/shareable.html?configUrl=https://files.bpcontent.cloud/2025/07/09/16/20250709163052-TWTVWK7V.json";

export default function AiAssistantPage() {
  return (
    <div className="h-full w-full flex flex-col bg-background">
      <iframe
        src={BOTPRESS_CHAT_URL}
        title="Femigo AI Assistant"
        className="h-full w-full flex-1 border-none"
      />
    </div>
  );
}
