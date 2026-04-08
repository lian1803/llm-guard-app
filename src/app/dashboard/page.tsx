'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

// Mock data
const mockCostData = [
  { time: '12:00 AM', cost: 0 },
  { time: '2:00 AM', cost: 12.3 },
  { time: '4:00 AM', cost: 24.5 },
  { time: '6:00 AM', cost: 28.4 },
  { time: '8:00 AM', cost: 35.2 },
  { time: '10:00 AM', cost: 42.1 },
  { time: '12:00 PM', cost: 48.3 },
];

const mockBlockEvents = [
  {
    id: 1,
    time: '2:15 PM',
    model: 'gpt-4',
    reason: 'Loop detected',
    cost: '$12.50',
    blocked: true,
  },
  {
    id: 2,
    time: '1:45 PM',
    model: 'gpt-4-turbo',
    reason: 'Budget threshold',
    cost: '$8.75',
    blocked: true,
  },
  {
    id: 3,
    time: '12:30 PM',
    model: 'claude-3',
    reason: 'Unusual pattern',
    cost: '$5.25',
    blocked: false,
  },
];

export default function DashboardPage() {
  const [todayCost] = useState(48.32);
  const [monthlyBudget] = useState(500);
  const [requestsBlocked] = useState(3);
  const [remainingBudget] = useState(monthlyBudget - todayCost);

  const budgetPercentage = Math.round((todayCost / monthlyBudget) * 100);

  if (false) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0 }}
        >
          <Card className="bg-[#161b22] border-[#30363d]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#8b949e]">
                Today Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">${todayCost.toFixed(2)}</div>
              <p className="text-xs text-[#8b949e] mt-2">+$2.10 vs yesterday</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="bg-[#161b22] border-[#30363d]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#8b949e]">
                Budget Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-[#f0c040]">
                {budgetPercentage}%
              </div>
              <div className="w-full bg-[#21262d] rounded-full h-2 mt-3">
                <div
                  className={`h-full rounded-full transition-all ${
                    budgetPercentage > 80
                      ? 'bg-[#ff4444]'
                      : budgetPercentage > 50
                      ? 'bg-[#f0c040]'
                      : 'bg-[#00ff88]'
                  }`}
                  style={{ width: `${budgetPercentage}%` }}
                />
              </div>
              <p className="text-xs text-[#6e7681] mt-2">Resets in 19 days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-[#161b22] border-[#30363d]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#8b949e]">
                Requests Blocked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-[#ff4444]">
                {requestsBlocked}
              </div>
              <Badge className="mt-3 bg-[#00ff88]/20 text-[#00ff88]">
                ACTIVE GUARD
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="bg-[#161b22] border-[#30363d]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#8b949e]">
                Remaining Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-[#00ff88]">
                ${remainingBudget.toFixed(2)}
              </div>
              <p className="text-xs text-[#8b949e] mt-2">of ${monthlyBudget}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Cost Over Time Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Cost Over Time</CardTitle>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
                <span className="text-xs text-[#8b949e]">LIVE</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockCostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis dataKey="time" stroke="#6e7681" />
                <YAxis stroke="#6e7681" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161b22',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                  }}
                  labelStyle={{ color: '#e6edf3' }}
                />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="#00ff88"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Block Events Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader>
            <CardTitle>Recent Block Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#30363d]">
                    <th className="text-left py-3 px-4 text-[#8b949e] font-medium">
                      Time
                    </th>
                    <th className="text-left py-3 px-4 text-[#8b949e] font-medium">
                      Model
                    </th>
                    <th className="text-left py-3 px-4 text-[#8b949e] font-medium">
                      Reason
                    </th>
                    <th className="text-left py-3 px-4 text-[#8b949e] font-medium">
                      Cost
                    </th>
                    <th className="text-left py-3 px-4 text-[#8b949e] font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockBlockEvents.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b border-[#30363d] hover:bg-[#21262d] transition-colors"
                    >
                      <td className="py-3 px-4">{event.time}</td>
                      <td className="py-3 px-4 font-mono text-xs">{event.model}</td>
                      <td className="py-3 px-4 text-[#8b949e]">{event.reason}</td>
                      <td className="py-3 px-4 font-mono">{event.cost}</td>
                      <td className="py-3 px-4">
                        {event.blocked ? (
                          <Badge className="bg-[#ff4444]/20 text-[#ff4444]">
                            BLOCKED
                          </Badge>
                        ) : (
                          <Badge className="bg-[#f0c040]/20 text-[#f0c040]">
                            WARNED
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upgrade CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="bg-gradient-to-r from-[#161b22] to-[#21262d] border border-[#30363d] rounded-lg p-6 flex items-center justify-between"
      >
        <div>
          <h3 className="font-bold mb-1">Unlock Advanced Features</h3>
          <p className="text-sm text-[#8b949e]">
            Get agent loop detection, Slack integration, and 10x rate limits
          </p>
        </div>
        <Button className="bg-[#00ff88] text-[#0d1117] font-bold">
          Upgrade to Pro
        </Button>
      </motion.div>
    </div>
  );
}
