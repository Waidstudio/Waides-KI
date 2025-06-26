import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Shield, Users, Vote, Crown, Eye, Gavel, Swords, UserCheck, Settings, Play, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';

interface Proposal {
  prop_id: string;
  title: string;
  description: string;
  changes: Record<string, any>;
  proposer: string;
  timestamp: number;
  votes: Record<string, 'yes' | 'no' | 'abstain'>;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  execution_timestamp?: number;
  quorum_required: number;
  approval_threshold: number;
}

interface ProposalTally {
  yes_votes: number;
  no_votes: number;
  abstain_votes: number;
  total_votes: number;
  quorum_met: boolean;
  approval_met: boolean;
  can_execute: boolean;
}

interface RoleAssignment {
  node_id: string;
  role: 'leader' | 'validator' | 'mediator' | 'observer' | 'sentinel' | 'guardian';
  assigned_at: number;
  performance_threshold: number;
  role_specific_metrics: Record<string, any>;
}

interface NetworkStats {
  total_nodes: number;
  active_proposals: number;
  total_proposals: number;
  governance_health: string;
  consensus_rate: number;
  participation_rate: number;
}

export default function MetaGuardianNetwork() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Form states
  const [newProposal, setNewProposal] = useState({
    prop_id: '',
    title: '',
    description: '',
    changes: '',
    quorum_required: 0.6,
    approval_threshold: 0.7
  });

  const [voteForm, setVoteForm] = useState({
    prop_id: '',
    vote: 'yes' as 'yes' | 'no' | 'abstain',
    node_id: ''
  });

  const [roleForm, setRoleForm] = useState({
    node_id: '',
    suggested_role: 'observer' as 'leader' | 'validator' | 'mediator' | 'observer' | 'sentinel' | 'guardian'
  });

  const fetchHolonStatus = async () => {
    try {
      const response = await apiRequest('/api/holon/status');
      setProposals(response.proposals || []);
      setNetworkStats(response.network_stats || null);
    } catch (error) {
      console.error('Failed to fetch holon status:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await apiRequest('/api/holon/roles');
      setRoleAssignments(response.assignments || []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  useEffect(() => {
    fetchHolonStatus();
    fetchRoles();
    
    const interval = setInterval(() => {
      fetchHolonStatus();
      fetchRoles();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateProposal = async () => {
    if (!newProposal.prop_id || !newProposal.title || !newProposal.description || !newProposal.changes) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      let changes: Record<string, any>;
      try {
        changes = JSON.parse(newProposal.changes);
      } catch {
        changes = { description: newProposal.changes };
      }

      await apiRequest('/api/holon/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prop_id: newProposal.prop_id,
          title: newProposal.title,
          description: newProposal.description,
          changes,
          quorum_required: newProposal.quorum_required,
          approval_threshold: newProposal.approval_threshold
        })
      });

      toast({
        title: "Proposal Created",
        description: `Proposal ${newProposal.prop_id} has been submitted to the council`,
      });

      setNewProposal({
        prop_id: '',
        title: '',
        description: '',
        changes: '',
        quorum_required: 0.6,
        approval_threshold: 0.7
      });

      fetchHolonStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create proposal",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleVote = async () => {
    if (!voteForm.prop_id || !voteForm.vote) {
      toast({
        title: "Validation Error",
        description: "Proposal ID and vote are required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest('/api/holon/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voteForm)
      });

      toast({
        title: "Vote Cast",
        description: `Your ${voteForm.vote} vote has been recorded`,
      });

      setVoteForm({
        prop_id: '',
        vote: 'yes',
        node_id: ''
      });

      fetchHolonStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cast vote",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleExecuteProposal = async (propId: string) => {
    setIsLoading(true);
    try {
      await apiRequest(`/api/holon/execute/${propId}`, {
        method: 'POST'
      });

      toast({
        title: "Proposal Executed",
        description: `Proposal ${propId} has been executed successfully`,
      });

      fetchHolonStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute proposal",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleAssignRole = async () => {
    if (!roleForm.node_id) {
      toast({
        title: "Validation Error",
        description: "Node ID is required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest('/api/holon/assign_role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleForm)
      });

      toast({
        title: "Role Assigned",
        description: `Role ${roleForm.suggested_role} assigned to ${roleForm.node_id}`,
      });

      setRoleForm({
        node_id: '',
        suggested_role: 'observer'
      });

      fetchRoles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleRegisterNode = async () => {
    const nodeId = prompt("Enter Node ID to register:");
    if (!nodeId) return;

    setIsLoading(true);
    try {
      await apiRequest('/api/holon/register_node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node_id: nodeId })
      });

      toast({
        title: "Node Registered",
        description: `Node ${nodeId} has been registered with the network`,
      });

      fetchHolonStatus();
      fetchRoles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register node",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader': return <Crown className="h-4 w-4" />;
      case 'validator': return <CheckCircle className="h-4 w-4" />;
      case 'mediator': return <Users className="h-4 w-4" />;
      case 'observer': return <Eye className="h-4 w-4" />;
      case 'sentinel': return <Shield className="h-4 w-4" />;
      case 'guardian': return <Swords className="h-4 w-4" />;
      default: return <UserCheck className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'leader': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'validator': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'mediator': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'observer': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'sentinel': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'guardian': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'executed': return <Zap className="h-4 w-4 text-blue-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Meta-Guardian Network</h1>
          <p className="text-muted-foreground">Self-Governed ETH Holon - Autonomous Network Governance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRegisterNode} variant="outline" size="sm">
            <UserCheck className="h-4 w-4 mr-2" />
            Register Node
          </Button>
        </div>
      </div>

      {/* Network Status Overview */}
      {networkStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Nodes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{networkStats.total_nodes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{networkStats.active_proposals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{networkStats.total_proposals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Consensus Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{(networkStats.consensus_rate * 100).toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Participation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{(networkStats.participation_rate * 100).toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Network Health</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-xs">
                {networkStats.governance_health}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="proposals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="proposals" className="flex items-center gap-2">
            <Vote className="h-4 w-4" />
            Proposals
          </TabsTrigger>
          <TabsTrigger value="voting" className="flex items-center gap-2">
            <Gavel className="h-4 w-4" />
            Voting
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Role Management
          </TabsTrigger>
          <TabsTrigger value="governance" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Governance
          </TabsTrigger>
        </TabsList>

        {/* Proposals Tab */}
        <TabsContent value="proposals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="h-5 w-5" />
                  Create Proposal
                </CardTitle>
                <CardDescription>Submit a new governance proposal to the council</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="prop_id">Proposal ID</Label>
                  <Input
                    id="prop_id"
                    value={newProposal.prop_id}
                    onChange={(e) => setNewProposal(prev => ({ ...prev, prop_id: e.target.value }))}
                    placeholder="e.g., PROP-001"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newProposal.title}
                    onChange={(e) => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Proposal title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProposal.description}
                    onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the proposal"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="changes">Changes (JSON)</Label>
                  <Textarea
                    id="changes"
                    value={newProposal.changes}
                    onChange={(e) => setNewProposal(prev => ({ ...prev, changes: e.target.value }))}
                    placeholder='{"parameter": "new_value"}'
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quorum">Quorum Required</Label>
                    <Input
                      id="quorum"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={newProposal.quorum_required}
                      onChange={(e) => setNewProposal(prev => ({ ...prev, quorum_required: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="threshold">Approval Threshold</Label>
                    <Input
                      id="threshold"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={newProposal.approval_threshold}
                      onChange={(e) => setNewProposal(prev => ({ ...prev, approval_threshold: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>
                <Button onClick={handleCreateProposal} disabled={isLoading} className="w-full">
                  Create Proposal
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Active Proposals
                </CardTitle>
                <CardDescription>Current governance proposals requiring votes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {proposals.filter(p => p.status === 'active').map((proposal) => (
                    <div key={proposal.prop_id} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(proposal.status)}
                          <span className="font-medium">{proposal.prop_id}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {proposal.status}
                        </Badge>
                      </div>
                      <h4 className="font-medium mb-1">{proposal.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{proposal.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Votes: {Object.keys(proposal.votes).length}</span>
                        <span>Proposer: {proposal.proposer}</span>
                      </div>
                      {proposal.status === 'passed' && (
                        <Button
                          size="sm"
                          onClick={() => handleExecuteProposal(proposal.prop_id)}
                          disabled={isLoading}
                          className="w-full mt-2"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Execute
                        </Button>
                      )}
                    </div>
                  ))}
                  {proposals.filter(p => p.status === 'active').length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No active proposals
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Voting Tab */}
        <TabsContent value="voting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Cast Vote
                </CardTitle>
                <CardDescription>Vote on active governance proposals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vote_prop_id">Proposal ID</Label>
                  <Select value={voteForm.prop_id} onValueChange={(value) => setVoteForm(prev => ({ ...prev, prop_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select proposal" />
                    </SelectTrigger>
                    <SelectContent>
                      {proposals.filter(p => p.status === 'active').map((proposal) => (
                        <SelectItem key={proposal.prop_id} value={proposal.prop_id}>
                          {proposal.prop_id} - {proposal.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vote">Vote</Label>
                  <Select value={voteForm.vote} onValueChange={(value: 'yes' | 'no' | 'abstain') => setVoteForm(prev => ({ ...prev, vote: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="abstain">Abstain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vote_node_id">Node ID (Optional)</Label>
                  <Input
                    id="vote_node_id"
                    value={voteForm.node_id}
                    onChange={(e) => setVoteForm(prev => ({ ...prev, node_id: e.target.value }))}
                    placeholder="Your node identifier"
                  />
                </div>
                <Button onClick={handleVote} disabled={isLoading} className="w-full">
                  Cast Vote
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="h-5 w-5" />
                  Proposal History
                </CardTitle>
                <CardDescription>All governance proposals and their outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {proposals.map((proposal) => (
                    <div key={proposal.prop_id} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(proposal.status)}
                          <span className="font-medium">{proposal.prop_id}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {proposal.status}
                        </Badge>
                      </div>
                      <h4 className="font-medium mb-1">{proposal.title}</h4>
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>Yes: {Object.values(proposal.votes).filter(v => v === 'yes').length}</div>
                        <div>No: {Object.values(proposal.votes).filter(v => v === 'no').length}</div>
                        <div>Abstain: {Object.values(proposal.votes).filter(v => v === 'abstain').length}</div>
                      </div>
                    </div>
                  ))}
                  {proposals.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No proposals found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Role Management Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Assign Role
                </CardTitle>
                <CardDescription>Assign operational roles to network nodes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="role_node_id">Node ID</Label>
                  <Input
                    id="role_node_id"
                    value={roleForm.node_id}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, node_id: e.target.value }))}
                    placeholder="Node identifier"
                  />
                </div>
                <div>
                  <Label htmlFor="suggested_role">Role</Label>
                  <Select value={roleForm.suggested_role} onValueChange={(value: any) => setRoleForm(prev => ({ ...prev, suggested_role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leader">Leader</SelectItem>
                      <SelectItem value="validator">Validator</SelectItem>
                      <SelectItem value="mediator">Mediator</SelectItem>
                      <SelectItem value="observer">Observer</SelectItem>
                      <SelectItem value="sentinel">Sentinel</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAssignRole} disabled={isLoading} className="w-full">
                  Assign Role
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Current Assignments
                </CardTitle>
                <CardDescription>Active role assignments across the network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {roleAssignments.map((assignment) => (
                    <div key={assignment.node_id} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{assignment.node_id}</span>
                        <Badge variant="outline" className={getRoleColor(assignment.role)}>
                          <div className="flex items-center gap-1">
                            {getRoleIcon(assignment.role)}
                            {assignment.role}
                          </div>
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Assigned: {new Date(assignment.assigned_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {roleAssignments.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No role assignments found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Governance Tab */}
        <TabsContent value="governance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Network Configuration
                </CardTitle>
                <CardDescription>Current network parameters and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-muted-foreground">Default Quorum</div>
                    <div className="text-lg font-bold">60%</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Default Threshold</div>
                    <div className="text-lg font-bold">70%</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Proposal Timeout</div>
                    <div className="text-lg font-bold">7 days</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Auto-execution</div>
                    <div className="text-lg font-bold">Enabled</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Status
                </CardTitle>
                <CardDescription>Network security and integrity metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-muted-foreground">Byzantine Tolerance</div>
                    <div className="text-lg font-bold text-green-400">33%</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Network Partition</div>
                    <div className="text-lg font-bold text-green-400">Resistant</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Consensus Algorithm</div>
                    <div className="text-lg font-bold">PoS + Voting</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Upgrade Mechanism</div>
                    <div className="text-lg font-bold">Proposal-based</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}