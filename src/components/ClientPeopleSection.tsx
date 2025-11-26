import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, MoreVertical, Mail, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Person {
  id: string;
  name: string;
  email: string;
  access: string;
  invitedBy: string;
  invitedDate: string;
  lastActive?: string;
  status: "active" | "pending";
  canManage: boolean;
}

const mockPeople: Person[] = [
  {
    id: "1",
    name: "Sarah Mitchell (You)",
    email: "sarah@neverlandcreative.com",
    access: "Full Access",
    invitedBy: "AgentFlow",
    invitedDate: "Nov 18",
    lastActive: "Just now",
    status: "active",
    canManage: false,
  },
  {
    id: "2",
    name: "James Chen",
    email: "james@neverlandcreative.com",
    access: "Full Access",
    invitedBy: "AgentFlow",
    invitedDate: "Nov 20",
    lastActive: "Yesterday",
    status: "active",
    canManage: false,
  },
  {
    id: "3",
    name: "Tom Williams",
    email: "tom@neverlandcreative.com",
    access: "Proposal Only",
    invitedBy: "You",
    invitedDate: "Nov 24",
    lastActive: "Nov 24",
    status: "active",
    canManage: true,
  },
  {
    id: "4",
    name: "Emily Roberts",
    email: "emily@neverlandcreative.com",
    access: "Pending",
    invitedBy: "You",
    invitedDate: "Nov 25",
    status: "pending",
    canManage: true,
  },
];

const recentActivity = [
  { text: "Tom viewed the proposal", date: "Nov 24" },
  { text: "Emily was invited", date: "Nov 25" },
  { text: "James downloaded Case Study.pdf", date: "Yesterday" },
];

export function ClientPeopleSection() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [accessLevel, setAccessLevel] = useState("full");
  const [specificAccess, setSpecificAccess] = useState({
    proposal: true,
    videos: false,
    documents: true,
    messages: false,
    meetings: false,
    questionnaires: true,
  });

  const getAccessBadgeColor = (access: string) => {
    switch (access.toLowerCase()) {
      case "full access":
        return "bg-[hsl(var(--gradient-blue))] text-white";
      case "proposal only":
        return "bg-[hsl(var(--sage-green))] text-white";
      case "documents only":
        return "bg-[hsl(var(--rich-violet))] text-white";
      case "pending":
        return "bg-amber-500 text-white";
      default:
        return "bg-[hsl(var(--gradient-blue))] text-white";
    }
  };

  const handleManageAccess = (person: Person) => {
    setSelectedPerson(person);
    setManageOpen(true);
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[hsl(var(--bold-royal-blue))] mb-2">
            People
          </h1>
          <p className="text-[hsl(var(--medium-grey))]">
            Colleagues with access to this hub
          </p>
        </div>
        <Button
          className="bg-[hsl(var(--soft-coral))] hover:bg-[hsl(var(--soft-coral))]/90 text-white"
          onClick={() => setInviteOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Someone
        </Button>
      </div>

      {/* Organization Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[hsl(var(--dark-grey))] mb-2">
          Neverland Creative
        </h2>
        <p className="text-sm text-[hsl(var(--medium-grey))] mb-6">
          People at @neverlandcreative.com can be invited to view content
        </p>

        {/* People List */}
        <div className="space-y-4">
          {mockPeople.map((person) => (
            <Card key={person.id} className="p-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-[hsl(var(--gradient-blue))] text-white">
                    {person.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[hsl(var(--dark-grey))]">
                      {person.name}
                    </h3>
                    <Badge className={getAccessBadgeColor(person.access)}>
                      {person.access}
                    </Badge>
                  </div>
                  <p className="text-sm text-[hsl(var(--medium-grey))] mb-1">
                    {person.email}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[hsl(var(--medium-grey))]">
                    <span>Invited by: {person.invitedBy}</span>
                    <span>•</span>
                    <span>{person.invitedDate}</span>
                    {person.status === "active" && person.lastActive && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last active: {person.lastActive}
                        </span>
                      </>
                    )}
                    {person.status === "pending" && (
                      <>
                        <span>•</span>
                        <span className="text-amber-600">Hasn't signed in yet</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {person.canManage && (
                  <div className="flex items-center gap-2">
                    {person.status === "pending" ? (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-1" />
                          Resend
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleManageAccess(person)}>
                            Manage Access
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Remove Access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-[hsl(var(--dark-grey))] mb-4">
          Recent Activity
        </h2>
        <Card className="p-4">
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <p className="text-sm text-[hsl(var(--dark-grey))]">{activity.text}</p>
                <span className="text-xs text-[hsl(var(--medium-grey))]">
                  {activity.date}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Invite Someone Modal */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--bold-royal-blue))]">
              Invite a Colleague
            </DialogTitle>
            <DialogDescription>
              Invite someone at @neverlandcreative.com to access this hub
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@neverlandcreative.com"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="access">What can they access?</Label>
              <Select value={accessLevel} onValueChange={setAccessLevel}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Everything I can see</SelectItem>
                  <SelectItem value="proposal">Proposal only</SelectItem>
                  <SelectItem value="documents">Documents only</SelectItem>
                  <SelectItem value="specific">Specific items...</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {accessLevel === "specific" && (
              <div className="border rounded-md p-4 space-y-2">
                <p className="text-sm font-medium mb-3">Select sections:</p>
                {Object.entries(specificAccess).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) =>
                        setSpecificAccess((prev) => ({ ...prev, [key]: !!checked }))
                      }
                    />
                    <label
                      htmlFor={key}
                      className="text-sm capitalize cursor-pointer"
                    >
                      {key}
                    </label>
                  </div>
                ))}
              </div>
            )}

            <div>
              <Label htmlFor="message">Personal message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Hi, I've invited you to view our AgentFlow project..."
                className="mt-1.5"
                rows={3}
              />
            </div>

            <p className="text-xs text-[hsl(var(--medium-grey))]">
              AgentFlow will be notified when someone new joins
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[hsl(var(--gradient-blue))] hover:bg-[hsl(var(--gradient-blue))]/90"
              onClick={() => setInviteOpen(false)}
            >
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Access Modal */}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--bold-royal-blue))]">
              Manage Access: {selectedPerson?.name.replace(" (You)", "")}
            </DialogTitle>
            <DialogDescription>{selectedPerson?.email}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm text-[hsl(var(--medium-grey))] mb-2 block">
                Current access
              </Label>
              <Badge className={getAccessBadgeColor(selectedPerson?.access || "")}>
                {selectedPerson?.access}
              </Badge>
            </div>

            <div>
              <Label htmlFor="new-access">Change access to</Label>
              <Select defaultValue="proposal">
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Everything I can see</SelectItem>
                  <SelectItem value="proposal">Proposal only</SelectItem>
                  <SelectItem value="documents">Documents only</SelectItem>
                  <SelectItem value="specific">Specific items...</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Remove Access
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setManageOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[hsl(var(--gradient-blue))] hover:bg-[hsl(var(--gradient-blue))]/90"
              onClick={() => setManageOpen(false)}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
