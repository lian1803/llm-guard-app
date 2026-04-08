'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Copy, Eye, EyeOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  active: boolean;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production API',
      key: 'llmg_prod_2k9d8f7h6a5j4l2w1q0e9r8t',
      created: '2 months ago',
      lastUsed: '2 hours ago',
      active: true,
    },
    {
      id: '2',
      name: 'Development',
      key: 'llmg_dev_9x8c7v6b5n4m3k2j1h0g9f8e',
      created: '1 month ago',
      lastUsed: '30 minutes ago',
      active: true,
    },
  ]);

  const [newKeyName, setNewKeyName] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const toggleKeyVisibility = (id: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleCreateKey = () => {
    if (newKeyName) {
      const newKey: ApiKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: `llmg_${Math.random().toString(36).substr(2, 24)}`,
        created: 'just now',
        lastUsed: 'never',
        active: true,
      };
      setKeys([...keys, newKey]);
      setNewKeyName('');
      toast.success('API key created');
    }
  };

  const handleDeleteKey = (id: string) => {
    setKeys(keys.filter((k) => k.id !== id));
    toast.success('API key deleted');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">API Keys</h1>
          <p className="text-[#8b949e]">
            Create and manage API keys for the LLM Guard SDK
          </p>
        </div>
        <Dialog>
          <DialogTrigger>
            <Button className="bg-[#00ff88] text-[#0d1117] font-bold">
              + Create Key
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#161b22] border-[#30363d]">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="keyname" className="text-[#8b949e]">
                  Key Name
                </Label>
                <Input
                  id="keyname"
                  placeholder="e.g., Production API"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="mt-2 bg-[#0d1117] border-[#30363d]"
                />
              </div>
              <Button
                onClick={handleCreateKey}
                className="w-full bg-[#00ff88] text-[#0d1117] font-bold"
              >
                Create Key
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Keys List */}
      <div className="space-y-4">
        {keys.map((key, idx) => (
          <motion.div
            key={key.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <Card className="bg-[#161b22] border-[#30363d]">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <p className="font-bold">{key.name}</p>
                      <Badge className="bg-[#00ff88]/20 text-[#00ff88] text-xs">
                        {key.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {/* Key Display */}
                    <div className="bg-[#0d1117] rounded px-3 py-2 font-mono text-sm flex items-center justify-between mb-3">
                      <span className="text-[#6e7681]">
                        {visibleKeys.has(key.id)
                          ? key.key
                          : key.key.substring(0, 8) + '•'.repeat(24)}
                      </span>
                      <button
                        onClick={() => toggleKeyVisibility(key.id)}
                        className="text-[#6e7681] hover:text-[#e6edf3] transition-colors"
                      >
                        {visibleKeys.has(key.id) ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-4 text-xs text-[#6e7681]">
                      <div>
                        <p className="text-[#8b949e] font-medium">Created</p>
                        <p>{key.created}</p>
                      </div>
                      <div>
                        <p className="text-[#8b949e] font-medium">Last Used</p>
                        <p>{key.lastUsed}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(key.key)}
                      className="text-xs"
                    >
                      <Copy size={14} className="mr-1" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteKey(key.id)}
                      className="text-xs"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Usage Example */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: keys.length * 0.1 }}
      >
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader>
            <CardTitle>Usage Example</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-[#0d1117] rounded p-4 overflow-x-auto">
              <pre className="text-sm font-mono text-[#e6edf3]">
{`from llm_guard.openai import OpenAI

# Automatically guarded
client = OpenAI(api_key="your-openai-key")

# Set a budget cap (optional)
client.set_budget_limit(50.0)  # $50/month

# Use as normal
response = client.chat.completions.create(
  model="gpt-4",
  messages=[{"role": "user", "content": "..."}]
)`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Documentation Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: (keys.length + 1) * 0.1 }}
        className="text-center p-6 bg-[#161b22] border border-[#30363d] rounded-lg"
      >
        <p className="text-[#8b949e] mb-3">
          Need help? Check out our documentation
        </p>
        <Button
          variant="outline"
          className="text-[#00ff88] border-[#00ff88]"
        >
          View Docs →
        </Button>
      </motion.div>
    </div>
  );
}
