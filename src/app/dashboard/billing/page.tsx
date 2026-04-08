'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Check, Download } from 'lucide-react';
import { toast } from 'sonner';

const invoices = [
  {
    id: 'INV-2024-03',
    date: 'March 1, 2024',
    amount: '$0.00',
    status: 'Paid',
    link: '/invoices/inv-2024-03.pdf',
  },
  {
    id: 'INV-2024-02',
    date: 'February 1, 2024',
    amount: '$0.00',
    status: 'Paid',
    link: '/invoices/inv-2024-02.pdf',
  },
  {
    id: 'INV-2024-01',
    date: 'January 1, 2024',
    amount: '$0.00',
    status: 'Paid',
    link: '/invoices/inv-2024-01.pdf',
  },
];

export default function BillingPage() {
  const handleUpgrade = () => {
    toast.success('Redirecting to upgrade...');
  };

  const handleDownloadInvoice = (link: string) => {
    toast.success('Invoice downloaded');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0 }}
      >
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Plan Info */}
              <div>
                <p className="text-[#8b949e] text-sm mb-2">Plan</p>
                <p className="text-3xl font-bold text-[#00ff88]">Free</p>
                <p className="text-sm text-[#6e7681] mt-2">
                  $0/month • Unlimited duration
                </p>
              </div>

              {/* Usage */}
              <div>
                <p className="text-[#8b949e] text-sm mb-2">API Requests (current month)</p>
                <p className="text-3xl font-bold">18,420</p>
                <p className="text-sm text-[#6e7681] mt-2">of 100,000 allowed</p>
              </div>

              {/* Next Billing */}
              <div>
                <p className="text-[#8b949e] text-sm mb-2">Next Billing Date</p>
                <p className="text-3xl font-bold">N/A</p>
                <p className="text-sm text-[#6e7681] mt-2">Free plan always free</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upgrade CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-gradient-to-r from-[#00ff88]/10 to-[#00ff88]/5 border border-[#00ff88]/30 rounded-lg p-6 flex items-center justify-between"
      >
        <div>
          <h3 className="font-bold mb-1">Upgrade to Pro</h3>
          <p className="text-sm text-[#8b949e]">
            Get unlimited projects, agent loop detection, and Slack integration
          </p>
        </div>
        <Button
          onClick={handleUpgrade}
          className="bg-[#00ff88] text-[#0d1117] font-bold flex-shrink-0"
        >
          Upgrade Now
        </Button>
      </motion.div>

      {/* Billing Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[#8b949e] text-sm mb-1">Email</p>
                <p className="font-mono">you@company.com</p>
              </div>
              <div>
                <p className="text-[#8b949e] text-sm mb-1">Company</p>
                <p className="font-mono">My Company Inc.</p>
              </div>
              <div>
                <p className="text-[#8b949e] text-sm mb-1">Tax ID</p>
                <p className="font-mono">Not provided</p>
              </div>
              <div>
                <p className="text-[#8b949e] text-sm mb-1">Billing Address</p>
                <p className="font-mono">San Francisco, CA</p>
              </div>
            </div>

            <Button variant="outline" size="sm">
              Update Billing Information
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Method */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-[#0d1117] rounded p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">💳</div>
                <div>
                  <p className="font-medium">Visa ending in 4242</p>
                  <p className="text-sm text-[#8b949e]">Expires 12/2025</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Invoices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#30363d]">
                    <th className="text-left py-3 px-4 text-[#8b949e] font-medium">
                      Invoice
                    </th>
                    <th className="text-left py-3 px-4 text-[#8b949e] font-medium">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-[#8b949e] font-medium">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-[#8b949e] font-medium">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-[#8b949e] font-medium">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-[#30363d] hover:bg-[#21262d] transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-xs">{invoice.id}</td>
                      <td className="py-3 px-4">{invoice.date}</td>
                      <td className="py-3 px-4 font-mono font-bold">
                        {invoice.amount}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="bg-[#00ff88]/20 text-[#00ff88]">
                          <Check size={12} className="mr-1" />
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDownloadInvoice(invoice.link)}
                          className="text-[#00ff88] hover:text-[#00ff88]/80 transition-colors flex items-center gap-1"
                        >
                          <Download size={14} />
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subscription Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader>
            <CardTitle>Subscription Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#0d1117] rounded">
              <div>
                <p className="font-medium">Email Receipts</p>
                <p className="text-sm text-[#8b949e]">
                  Receive invoice emails automatically
                </p>
              </div>
              <input type="checkbox" defaultChecked className="cursor-pointer" />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0d1117] rounded">
              <div>
                <p className="font-medium">Auto-Renew</p>
                <p className="text-sm text-[#8b949e]">
                  Automatically renew subscription when it expires
                </p>
              </div>
              <input type="checkbox" defaultChecked className="cursor-pointer" />
            </div>

            <Button variant="destructive" className="w-full mt-4">
              Cancel Subscription
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
