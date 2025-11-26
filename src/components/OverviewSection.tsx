import { Play, FileText, Video, Folder, Mail, Calendar, Clipboard, Clock, FileCheck, CalendarCheck, Upload, MessageSquare, Eye, EyeOff, TrendingUp, Link2, Settings, ExternalLink, Edit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const quickLinks = [
  {
    title: "View Proposal",
    description: "Review our detailed proposal",
    icon: FileText,
    color: "text-[hsl(var(--gradient-blue))]",
    status: "3 views",
  },
  {
    title: "Watch Videos",
    description: "Introduction and demo videos",
    icon: Video,
    color: "text-[hsl(var(--rich-violet))]",
    status: "2 of 4 watched",
  },
  {
    title: "Browse Documents",
    description: "Case studies and materials",
    icon: Folder,
    color: "text-[hsl(var(--sage-green))]",
    status: "1 downloaded",
  },
  {
    title: "Messages",
    description: "Your conversations",
    icon: Mail,
    color: "text-[hsl(var(--gradient-blue))]",
    badge: "3",
  },
  {
    title: "Upcoming Meeting",
    description: "Tomorrow, 2pm",
    icon: Calendar,
    color: "text-[hsl(var(--soft-coral))]",
  },
  {
    title: "Complete Questionnaire",
    description: "Status: Not started",
    icon: Clipboard,
    color: "text-[hsl(var(--medium-grey))]",
  },
];

const clientActivity = [
  {
    icon: FileText,
    description: "Sarah viewed the proposal",
    timestamp: "2 hours ago",
  },
  {
    icon: Video,
    description: "Sarah watched 'Introduction' video",
    timestamp: "Yesterday",
  },
  {
    icon: Eye,
    description: "Sarah logged in",
    timestamp: "Yesterday",
  },
  {
    icon: FileCheck,
    description: "James Chen was added to hub",
    timestamp: "Nov 20",
  },
];

const recentUpdates = [
  {
    icon: Upload,
    description: "You uploaded: Case Study.pdf",
    timestamp: "2 hours ago",
  },
  {
    icon: CalendarCheck,
    description: "Meeting scheduled: Nov 28, 2pm",
    timestamp: "Yesterday",
  },
  {
    icon: MessageSquare,
    description: "You sent a message",
    timestamp: "Nov 22",
  },
];

const engagementStats = [
  { label: "Hub visits", value: "7" },
  { label: "Last visit", value: "2 hours ago" },
  { label: "Proposal views", value: "3" },
  { label: "Videos watched", value: "2 of 4" },
  { label: "Documents downloaded", value: "1" },
  { label: "Questionnaire", value: "Not started" },
  { label: "Total time on hub", value: "~14 min" },
];

export function OverviewSection() {
  return (
    <div className="min-h-screen bg-[hsl(var(--warm-cream))]">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[hsl(var(--medium-grey))]/20">
        <h1 className="text-3xl font-bold text-[hsl(var(--bold-royal-blue))]">
          Overview
        </h1>
        <div className="flex items-center gap-3">
          <Badge className="bg-[hsl(var(--deep-navy))] text-white">
            Internal View
          </Badge>
          <Button variant="outline" className="border-[hsl(var(--gradient-blue))] text-[hsl(var(--gradient-blue))]">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Welcome Preview */}
      <div className="mb-8">
        <p className="text-sm text-[hsl(var(--medium-grey))] italic mb-2">Client sees:</p>
        <div className="bg-gradient-to-r from-[hsl(var(--gradient-blue))] to-[hsl(var(--gradient-purple))] p-8 rounded-lg">
          <h2 className="text-4xl font-bold text-[hsl(var(--bold-royal-blue))] mb-2">
            Welcome, Sarah
          </h2>
          <p className="text-lg text-[hsl(var(--dark-grey))]">
            Here's everything you need for our proposal to Neverland Creative
          </p>
        </div>
      </div>

      {/* Featured Video */}
      <div className="mb-8">
        <div className="relative aspect-video bg-[hsl(var(--medium-grey))] rounded-lg flex items-center justify-center mb-2">
          <Play className="w-16 h-16 text-white opacity-70" />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-[hsl(var(--dark-grey))]">Watch our introduction</p>
          <button className="text-sm text-[hsl(var(--medium-grey))] hover:text-[hsl(var(--gradient-blue))] underline">
            Change video
          </button>
        </div>
      </div>

      {/* Quick Links Preview */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-[hsl(var(--bold-royal-blue))] mb-4">
          Quick Access
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Card key={link.title} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <link.icon className={`w-8 h-8 ${link.color}`} />
                  {link.badge && (
                    <Badge variant="destructive" className="bg-[hsl(var(--soft-coral))]">
                      {link.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{link.title}</CardTitle>
                <CardDescription>{link.description}</CardDescription>
                {link.status && (
                  <p className="text-xs text-[hsl(var(--medium-grey))] mt-2">{link.status}</p>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Activity & Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Activity Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[hsl(var(--gradient-blue))] flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Client Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                    <activity.icon className="w-5 h-5 text-[hsl(var(--gradient-blue))] mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-[hsl(var(--dark-grey))]">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-[hsl(var(--medium-grey))]" />
                        <span className="text-xs text-[hsl(var(--medium-grey))]">
                          {activity.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="text-sm text-[hsl(var(--gradient-blue))] hover:underline mt-4">
                View all activity
              </button>
            </CardContent>
          </Card>

          {/* Recent Updates Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[hsl(var(--bold-royal-blue))]">
                Recent Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUpdates.map((update, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                    <update.icon className="w-5 h-5 text-[hsl(var(--sage-green))] mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-[hsl(var(--dark-grey))]">
                        {update.description}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-[hsl(var(--medium-grey))]" />
                        <span className="text-xs text-[hsl(var(--medium-grey))]">
                          {update.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Internal Tools */}
        <div className="lg:col-span-1 space-y-6">
          {/* Internal Notes Panel */}
          <Card className="bg-[hsl(var(--warm-cream))]/50 border-2 border-[hsl(var(--medium-grey))]/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <EyeOff className="w-4 h-4" />
                  Internal Notes
                </CardTitle>
              </div>
              <p className="text-xs text-[hsl(var(--medium-grey))]">Not visible to client</p>
            </CardHeader>
            <CardContent>
              <div className="bg-white/50 p-4 rounded-md border border-[hsl(var(--medium-grey))]/20 min-h-[180px] text-sm text-[hsl(var(--dark-grey))] whitespace-pre-line mb-3">
                Sarah seems very engaged. Key decision maker is actually James (her boss) - make sure to CC him on important updates.
                
                Budget approved but timeline is tight. Emphasise our fast delivery in next call.
                
                - Hamish, Nov 24
              </div>
              <div className="flex items-center justify-between">
                <button className="text-sm text-[hsl(var(--gradient-blue))] hover:underline">
                  Edit
                </button>
                <p className="text-xs text-[hsl(var(--medium-grey))]">
                  Last updated: Nov 24 by Hamish
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Engagement Stats Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {engagementStats.map((stat, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <span className="text-sm text-[hsl(var(--dark-grey))]">{stat.label}</span>
                    <span className="text-sm font-semibold text-[hsl(var(--bold-royal-blue))]">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Link2 className="w-4 h-4 mr-2" />
                Copy hub link
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Hub settings
              </Button>
              <button className="w-full text-left px-4 py-2 text-sm text-[hsl(var(--gradient-blue))] hover:bg-[hsl(var(--gradient-blue))]/10 rounded-md flex items-center">
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview as client
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Next Steps CTA */}
      <Card className="bg-[hsl(var(--gradient-purple))]/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-[hsl(var(--bold-royal-blue))] mb-1">
                Ready to discuss?
              </h3>
              <p className="text-sm text-[hsl(var(--medium-grey))]">
                Schedule a call with our team
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button className="bg-[hsl(var(--soft-coral))] hover:bg-[hsl(var(--soft-coral))]/90">
                Schedule a Call
              </Button>
              <button className="text-sm text-[hsl(var(--gradient-blue))] hover:underline">
                Edit next steps
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
