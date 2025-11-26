import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Download,
  Share2,
  Eye,
  FileText,
  Upload,
  Search,
  Trash2,
  File,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  name: string;
  size: string;
  date: string;
  type: "pdf" | "docx" | "xlsx" | "image";
  uploadedByClient?: boolean;
}

const documents: Document[] = [
  {
    id: "1",
    name: "AgentFlow Proposal.pdf",
    size: "4.2 MB",
    date: "Nov 22",
    type: "pdf"
  },
  {
    id: "2",
    name: "MediaCo Case Study.pdf",
    size: "2.4 MB",
    date: "Nov 20",
    type: "pdf"
  },
  {
    id: "3",
    name: "TechCorp Case Study.pdf",
    size: "1.8 MB",
    date: "Nov 20",
    type: "pdf"
  },
  {
    id: "4",
    name: "Draft Contract.docx",
    size: "156 KB",
    date: "Nov 18",
    type: "docx"
  },
  {
    id: "5",
    name: "Terms of Service.pdf",
    size: "340 KB",
    date: "Nov 18",
    type: "pdf"
  }
];

const clientUploads: Document[] = [
  {
    id: "u1",
    name: "Brand Guidelines.pdf",
    size: "8.5 MB",
    date: "Nov 23",
    type: "pdf",
    uploadedByClient: true
  },
  {
    id: "u2",
    name: "Logo Files.zip",
    size: "3.2 MB",
    date: "Nov 22",
    type: "image",
    uploadedByClient: true
  }
];

export function ClientDocumentsSection() {
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [shareDocId, setShareDocId] = useState<string>("");
  const [shareEmail, setShareEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadNote, setUploadNote] = useState("");
  const [uploads, setUploads] = useState(clientUploads);
  const { toast } = useToast();

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "docx":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "xlsx":
        return <FileText className="h-5 w-5 text-green-500" />;
      case "image":
        return <File className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-[hsl(var(--medium-grey))]" />;
    }
  };

  const handleShareClick = (docId: string) => {
    setShareDocId(docId);
    setShareModalOpen(true);
    setShareEmail("");
    setShareMessage("");
    setEmailError("");
  };

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!email.endsWith("@neverlandcreative.com")) {
      setEmailError("You can only share with people at Neverland Creative");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleShare = () => {
    if (validateEmail(shareEmail)) {
      toast({
        title: "Document shared successfully",
        description: `An invitation has been sent to ${shareEmail}`,
      });
      setShareModalOpen(false);
    }
  };

  const handleCopyLink = () => {
    const allDocs = [...documents, ...uploads];
    const shareDoc = allDocs.find(d => d.id === shareDocId);
    navigator.clipboard.writeText(`https://portal.agentflow.com/document/${shareDocId}`);
    toast({
      title: "Link copied",
      description: `Link to "${shareDoc?.name}" copied to clipboard`,
    });
  };

  const handleDownload = (doc: Document) => {
    toast({
      title: "Download started",
      description: `Downloading ${doc.name}`,
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      const newUpload: Document = {
        id: `u${uploads.length + 1}`,
        name: selectedFile.name,
        size: `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`,
        date: "Just now",
        type: selectedFile.type.includes("pdf") ? "pdf" : "image",
        uploadedByClient: true
      };
      setUploads([newUpload, ...uploads]);
      toast({
        title: "Document uploaded successfully",
        description: "The AgentFlow team has been notified",
      });
      setUploadModalOpen(false);
      setSelectedFile(null);
      setUploadNote("");
    }
  };

  const handleDelete = (docId: string) => {
    setUploads(uploads.filter(u => u.id !== docId));
    toast({
      title: "Document deleted",
      description: "Your upload has been removed",
    });
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUploads = uploads.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allDocs = [...documents, ...uploads];
  const shareDoc = allDocs.find(d => d.id === shareDocId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--bold-royal-blue))] mb-2">
            Documents
          </h1>
          <p className="text-[hsl(var(--medium-grey))]">
            Shared files and resources
          </p>
        </div>
        <Button
          className="bg-[hsl(var(--gradient-blue))] hover:bg-[hsl(var(--gradient-blue))]/90"
          onClick={() => setUploadModalOpen(true)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--medium-grey))]" />
        <Input
          placeholder="Search documents..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Document List */}
      <div className="space-y-6">
        {/* AgentFlow Documents */}
        <div className="space-y-3">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-[hsl(var(--warm-cream))] border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[hsl(var(--dark-grey))]">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[hsl(var(--dark-grey))]">
                    Size
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[hsl(var(--dark-grey))]">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-[hsl(var(--dark-grey))]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b last:border-b-0 hover:bg-[hsl(var(--warm-cream))]/50 transition-colors cursor-pointer"
                    onClick={() => setPreviewDoc(doc)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.type)}
                        <span className="text-[hsl(var(--dark-grey))] font-medium">
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[hsl(var(--medium-grey))]">
                      {doc.size}
                    </td>
                    <td className="py-3 px-4 text-[hsl(var(--medium-grey))]">
                      {doc.date}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewDoc(doc);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(doc);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareClick(doc.id);
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setPreviewDoc(doc)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {getFileIcon(doc.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[hsl(var(--dark-grey))] truncate">
                          {doc.name}
                        </p>
                        <p className="text-sm text-[hsl(var(--medium-grey))] mt-1">
                          {doc.size} • {doc.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(doc);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareClick(doc.id);
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Your Uploads Section */}
        {filteredUploads.length > 0 && (
          <div className="space-y-3">
            <div>
              <h2 className="text-xl font-bold text-[hsl(var(--dark-grey))] mb-1">
                Your Uploads
              </h2>
              <p className="text-sm text-[hsl(var(--medium-grey))]">
                Documents you've shared with AgentFlow
              </p>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <tbody>
                  {filteredUploads.map((doc) => (
                    <tr
                      key={doc.id}
                      className="border-b last:border-b-0 hover:bg-[hsl(var(--warm-cream))]/50 transition-colors cursor-pointer"
                      onClick={() => setPreviewDoc(doc)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {getFileIcon(doc.type)}
                          <span className="text-[hsl(var(--dark-grey))] font-medium">
                            {doc.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[hsl(var(--medium-grey))]">
                        Uploaded {doc.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(doc);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(doc.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredUploads.map((doc) => (
                <Card
                  key={doc.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setPreviewDoc(doc)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {getFileIcon(doc.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[hsl(var(--dark-grey))] truncate">
                            {doc.name}
                          </p>
                          <p className="text-sm text-[hsl(var(--medium-grey))] mt-1">
                            Uploaded {doc.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(doc);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(doc.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-[hsl(var(--bold-royal-blue))] flex items-center gap-2">
              {previewDoc && getFileIcon(previewDoc.type)}
              {previewDoc?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preview Area */}
            <div className="relative aspect-[4/3] bg-[hsl(var(--warm-cream))] rounded-lg flex items-center justify-center border-2 border-dashed">
              <div className="text-center space-y-3">
                <FileText className="h-16 w-16 text-[hsl(var(--medium-grey))] mx-auto" />
                <div>
                  <p className="text-[hsl(var(--dark-grey))] font-medium">
                    Document Preview
                  </p>
                  <p className="text-sm text-[hsl(var(--medium-grey))]">
                    {previewDoc?.type === "pdf" ? "PDF Viewer Placeholder" : "Preview not available"}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Info */}
            <div className="flex items-center gap-4 text-sm text-[hsl(var(--medium-grey))]">
              <span>{previewDoc?.size}</span>
              <span>•</span>
              <span>{previewDoc?.date}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                className="bg-[hsl(var(--gradient-blue))] hover:bg-[hsl(var(--gradient-blue))]/90"
                onClick={() => previewDoc && handleDownload(previewDoc)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              {!previewDoc?.uploadedByClient && (
                <Button
                  variant="outline"
                  className="border-[hsl(var(--gradient-blue))] text-[hsl(var(--gradient-blue))] hover:bg-[hsl(var(--gradient-blue))]/10"
                  onClick={() => {
                    if (previewDoc) {
                      handleShareClick(previewDoc.id);
                    }
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-[hsl(var(--bold-royal-blue))]">
              Share Document
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Document context */}
            {shareDoc && (
              <div className="flex gap-3 p-3 bg-[hsl(var(--warm-cream))] rounded-lg">
                {getFileIcon(shareDoc.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[hsl(var(--dark-grey))] truncate">
                    {shareDoc.name}
                  </p>
                  <p className="text-xs text-[hsl(var(--medium-grey))]">
                    {shareDoc.size}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="share-email">Colleague's email</Label>
              <Input
                id="share-email"
                type="email"
                placeholder="tom@neverlandcreative.com"
                value={shareEmail}
                onChange={(e) => {
                  setShareEmail(e.target.value);
                  setEmailError("");
                }}
                className={emailError ? "border-red-500" : ""}
              />
              {emailError && (
                <p className="text-sm text-red-500">{emailError}</p>
              )}
              <p className="text-xs text-[hsl(var(--medium-grey))]">
                You can only share with colleagues at @neverlandcreative.com
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="share-message">Add a message (optional)</Label>
              <Textarea
                id="share-message"
                placeholder="Hi Tom, check out this document..."
                rows={3}
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm text-[hsl(var(--medium-grey))]">
              <span className="text-lg">🔒</span>
              <p>Your colleague will need to sign in with their Microsoft account to view</p>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 bg-[hsl(var(--gradient-blue))] hover:bg-[hsl(var(--gradient-blue))]/90"
                onClick={handleShare}
              >
                Send invitation
              </Button>
              <Button
                variant="outline"
                className="border-[hsl(var(--gradient-blue))] text-[hsl(var(--gradient-blue))]"
                onClick={handleCopyLink}
              >
                Copy link
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setShareModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-[hsl(var(--bold-royal-blue))]">
              Upload Document
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-[hsl(var(--medium-grey))]">
              Share a file with the AgentFlow team
            </p>

            {/* File Upload Area */}
            {!selectedFile ? (
              <label
                htmlFor="file-upload"
                className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[hsl(var(--medium-grey))]/30 rounded-lg cursor-pointer hover:border-[hsl(var(--gradient-blue))] hover:bg-[hsl(var(--warm-cream))]/50 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-12 w-12 text-[hsl(var(--medium-grey))] mb-3" />
                  <p className="mb-2 text-sm text-[hsl(var(--dark-grey))]">
                    <span className="font-semibold">Click to browse</span> or drag files here
                  </p>
                  <p className="text-xs text-[hsl(var(--medium-grey))]">
                    PDF, Word, Excel, Images — Max 50MB
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
                />
              </label>
            ) : (
              <div className="p-4 border rounded-lg bg-[hsl(var(--warm-cream))]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-[hsl(var(--gradient-blue))]" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[hsl(var(--dark-grey))] truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-[hsl(var(--medium-grey))]">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {selectedFile && (
              <div className="space-y-2">
                <Label htmlFor="upload-note">Add a note (optional)</Label>
                <Textarea
                  id="upload-note"
                  placeholder="e.g., Here are our brand guidelines..."
                  rows={3}
                  value={uploadNote}
                  onChange={(e) => setUploadNote(e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                className="flex-1 bg-[hsl(var(--gradient-blue))] hover:bg-[hsl(var(--gradient-blue))]/90"
                onClick={handleUpload}
                disabled={!selectedFile}
              >
                Upload
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setUploadModalOpen(false);
                  setSelectedFile(null);
                  setUploadNote("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
