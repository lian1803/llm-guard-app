'use client';

import { useState, useEffect } from 'react';
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
import { toast } from 'sonner';

interface UsageData {
  todayCost: number;
  monthlyBudget: number;
  requestsBlocked: number;
  remainingBudget: number;
}

interface ChartDataPoint {
  time: string;
  cost: number;
}

interface BlockEvent {
  id: number;
  time: string;
  model: string;
  reason: string;
  cost: string;
  blocked: boolean;
}

export default function DashboardPage() {
  const [todayCost, setTodayCost] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [requestsBlocked, setRequestsBlocked] = useState(0);
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [costData, setCostData] = useState<ChartDataPoint[]>([]);
  const [blockEvents, setBlockEvents] = useState<BlockEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const budgetPercentage = monthlyBudget > 0 ? Math.round((todayCost / monthlyBudget) * 100) : 0;

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 병렬로 두 API 호출
        const [usageRes, chartRes] = await Promise.all([
          fetch('/api/dashboard/usage', { credentials: 'include' }),
          fetch('/api/dashboard/chart', { credentials: 'include' }),
        ]);

        if (!usageRes.ok) {
          throw new Error('Failed to fetch usage data');
        }
        if (!chartRes.ok) {
          throw new Error('Failed to fetch chart data');
        }

        const usageData: UsageData = await usageRes.json();
        const chartData = await chartRes.json();

        // Usage 데이터 설정
        setTodayCost(usageData.todayCost);
        setMonthlyBudget(usageData.monthlyBudget);
        setRequestsBlocked(usageData.requestsBlocked);
        setRemainingBudget(usageData.remainingBudget);

        // Chart 데이터 설정
        setCostData(chartData.data || []);
        setBlockEvents(chartData.events || []);
      } catch (err) {
        console.error('[Dashboard Load Error]', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        toast.error('Failed to load dashboard. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-[#161b22] border-[#30363d]">
              <CardHeader className="pb-2">
                <div className="h-4 bg-[#30363d] rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-[#30363d] rounded mb-3" />
                <div className="h-3 bg-[#30363d] rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-[#161b22] border-[#ff4444]">
          <CardContent className="pt-6">
            <p className="text-[#ff4444] mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-[#00ff88] text-[#0d1117] font-bold"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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
              <LineChart data={costData}>
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
                  {blockEvents.map((event) => (
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
