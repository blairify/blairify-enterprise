"use client";

import {
  Building2,
  Copy,
  Edit,
  FileText,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Mock data
const templates = [
  {
    id: "1",
    name: "Software Engineer Interview Questions",
    description: "Standard questions for software engineering positions",
    questionCount: 5,
    scope: "organization",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Product Manager Assessment",
    description: "Questions focused on product strategy and execution",
    questionCount: 4,
    scope: "enterprise",
    createdAt: "2024-01-14",
  },
  {
    id: "3",
    name: "UX Designer Portfolio Review",
    description: "Questions about design process and portfolio",
    questionCount: 6,
    scope: "organization",
    createdAt: "2024-01-13",
  },
  {
    id: "4",
    name: "Technical Leadership Questions",
    description: "Questions for senior technical leadership roles",
    questionCount: 7,
    scope: "enterprise",
    createdAt: "2024-01-12",
  },
];

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    questions: "",
  });

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateTemplate = () => {
    toast.success("Template created successfully!");
    setIsCreateOpen(false);
    setNewTemplate({ name: "", description: "", questions: "" });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Question Templates</h1>
          <p className="text-muted-foreground">
            Create and manage reusable interview question templates
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Question Template</DialogTitle>
              <DialogDescription>
                Create a reusable template for interview questions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={newTemplate.name}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, name: e.target.value })
                  }
                  placeholder="e.g., Software Engineer Interview"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTemplate.description}
                  onChange={(e) =>
                    setNewTemplate({
                      ...newTemplate,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description of this template"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="questions">Questions (one per line)</Label>
                <Textarea
                  id="questions"
                  value={newTemplate.questions}
                  onChange={(e) =>
                    setNewTemplate({
                      ...newTemplate,
                      questions: e.target.value,
                    })
                  }
                  placeholder="Tell us about your experience with TypeScript&#10;Describe a challenging technical problem you solved&#10;How do you approach code reviews?"
                  rows={8}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate}>Create Template</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">
                    {template.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        template.scope === "enterprise"
                          ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                          : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      }
                    >
                      {template.scope === "enterprise" ? (
                        <>
                          <Building2 className="mr-1 h-3 w-3" />
                          Enterprise
                        </>
                      ) : (
                        <>
                          <FileText className="mr-1 h-3 w-3" />
                          Organization
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </p>
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {template.questionCount} questions
                </span>
                <span className="text-muted-foreground">
                  {new Date(template.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Copy className="mr-1 h-3 w-3" />
                  Duplicate
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No templates found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setIsCreateOpen(true)}
          >
            Create your first template
          </Button>
        </div>
      )}
    </div>
  );
}
