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

const mockProjects = [
  {
    id: 1,
    name: 'Production API',
    status: 'GUARDED',
    budget: 1000,
    used: 682,
    requests: 15420,
  },
  {
    id: 2,
    name: 'Development',
    status: 'WARNING',
    budget: 200,
    used: 168,
    requests: 3210,
  },
  {
    id: 3,
    name: 'Staging',
    status: 'GUARDED',
    budget: 300,
    used: 145,
    requests: 2850,
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState(mockProjects);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectBudget, setNewProjectBudget] = useState('');

  const handleCreateProject = () => {
    if (newProjectName && newProjectBudget) {
      const newProject = {
        id: projects.length + 1,
        name: newProjectName,
        status: 'GUARDED',
        budget: parseInt(newProjectBudget),
        used: 0,
        requests: 0,
      };
      setProjects([...projects, newProject]);
      setNewProjectName('');
      setNewProjectBudget('');
    }
  };

  const updateProjectBudget = (id: number, newBudget: number) => {
    setProjects(
      projects.map((p) => (p.id === id ? { ...p, budget: newBudget } : p))
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GUARDED':
        return 'bg-[#00ff88]/20 text-[#00ff88]';
      case 'WARNING':
        return 'bg-[#f0c040]/20 text-[#f0c040]';
      case 'AT_LIMIT':
        return 'bg-[#ff4444]/20 text-[#ff4444]';
      default:
        return 'bg-[#6e7681]/20 text-[#6e7681]';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Projects</h1>
          <p className="text-[#8b949e]">Manage budgets and monitor costs per project</p>
        </div>
        <Dialog>
          <DialogTrigger>
            <Button className="bg-[#00ff88] text-[#0d1117] font-bold">
              + New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#161b22] border-[#30363d]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-[#8b949e]">
                  Project Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., My API"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="mt-2 bg-[#0d1117] border-[#30363d]"
                />
              </div>
              <div>
                <Label htmlFor="budget" className="text-[#8b949e]">
                  Monthly Budget ($)
                </Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="e.g., 500"
                  value={newProjectBudget}
                  onChange={(e) => setNewProjectBudget(e.target.value)}
                  className="mt-2 bg-[#0d1117] border-[#30363d]"
                />
              </div>
              <Button
                onClick={handleCreateProject}
                className="w-full bg-[#00ff88] text-[#0d1117] font-bold"
              >
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold font-mono">
              {projects.length}
            </div>
            <p className="text-sm text-[#8b949e] mt-1">Active Projects</p>
          </CardContent>
        </Card>
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold font-mono text-[#00ff88]">
              ${projects.reduce((sum, p) => sum + p.budget, 0)}
            </div>
            <p className="text-sm text-[#8b949e] mt-1">Total Budget</p>
          </CardContent>
        </Card>
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold font-mono">
              {projects.reduce((sum, p) => sum + p.requests, 0).toLocaleString()}
            </div>
            <p className="text-sm text-[#8b949e] mt-1">Total Requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, idx) => {
          const percentage = Math.round((project.used / project.budget) * 100);
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <Card
                className={`bg-[#161b22] border-[#30363d] ${
                  project.status === 'AT_LIMIT'
                    ? 'border-[#ff4444] bg-[#1a1217]'
                    : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Warning Banner */}
                  {project.status === 'WARNING' && (
                    <div className="bg-[#ff4444]/10 border-l-2 border-[#ff4444] px-4 py-2 rounded text-sm text-[#ff4444]">
                      Nearing budget limit. Requests will be blocked if exceeded.
                    </div>
                  )}

                  {/* Budget Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#8b949e]">Budget Used</span>
                      <div className="flex items-end gap-2">
                        <span
                          className="font-mono text-lg font-bold"
                          contentEditable
                          onBlur={(e) => {
                            const newBudget = parseInt(
                              e.currentTarget.textContent || '0'
                            );
                            if (newBudget > 0) {
                              updateProjectBudget(project.id, newBudget);
                            }
                          }}
                        >
                          {project.budget}
                        </span>
                        <span className="text-xs text-[#6e7681]">edit</span>
                      </div>
                    </div>

                    <div className="w-full bg-[#21262d] rounded-full h-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percentage > 80
                            ? 'bg-[#ff4444]'
                            : percentage > 50
                            ? 'bg-[#f0c040]'
                            : 'bg-[#00ff88]'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2 text-xs text-[#6e7681]">
                      <span>${project.used} of ${project.budget}</span>
                      <span>{percentage}%</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#6e7681] mb-1">Requests</p>
                      <p className="font-mono font-bold">
                        {project.requests.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6e7681] mb-1">Avg Cost</p>
                      <p className="font-mono font-bold">
                        $
                        {(
                          project.used / Math.max(project.requests, 1)
                        ).toFixed(4)}
                      </p>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full text-xs">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
