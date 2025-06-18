
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { addProjectToFirestore, updateProjectInFirestore } from "@/lib/firebase";
import type { Project } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const projectSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  techStackString: z.string().min(1, { message: "Please list at least one technology (comma-separated)." }),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).or(z.literal('')).optional(),
  liveDemoUrl: z.string().url({ message: "Please enter a valid URL for the live demo." }).optional().or(z.literal('')),
  githubUrl: z.string().url({ message: "Please enter a valid URL for the GitHub repository." }).optional().or(z.literal('')),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  initialData?: Project | null; // Project data for editing, null/undefined for new
  onFormSubmit?: () => void; // Optional callback after successful submission
}

export default function ProjectForm({ initialData, onFormSubmit }: ProjectFormProps) {
  const { toast } = useToast();
  const isEditMode = !!initialData;

  const defaultValues: ProjectFormValues = {
    title: initialData?.title || "",
    description: initialData?.description || "",
    techStackString: initialData?.techStack?.join(", ") || "",
    imageUrl: initialData?.imageUrl || "https://placehold.co/600x400.png",
    liveDemoUrl: initialData?.liveDemoUrl || "",
    githubUrl: initialData?.githubUrl || "",
  };
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    // Reset form if initialData changes (e.g., navigating between edit pages)
    // Or when switching from edit to new (initialData becomes null)
    form.reset({
      title: initialData?.title || "",
      description: initialData?.description || "",
      techStackString: initialData?.techStack?.join(", ") || "",
      imageUrl: initialData?.imageUrl || "https://placehold.co/600x400.png",
      liveDemoUrl: initialData?.liveDemoUrl || "",
      githubUrl: initialData?.githubUrl || "",
    });
  }, [initialData, form]);


  async function onSubmit(data: ProjectFormValues) {
    const projectDataForFirestore: Omit<Project, 'id'> = {
      title: data.title,
      description: data.description,
      techStack: data.techStackString.split(',').map(tech => tech.trim()).filter(tech => tech),
      imageUrl: data.imageUrl || 'https://placehold.co/600x400.png',
    };

    if (data.liveDemoUrl && data.liveDemoUrl.trim() !== "") {
      projectDataForFirestore.liveDemoUrl = data.liveDemoUrl;
    }
    if (data.githubUrl && data.githubUrl.trim() !== "") {
      projectDataForFirestore.githubUrl = data.githubUrl;
    }
    
    let result;
    if (isEditMode && initialData?.id) {
      result = await updateProjectInFirestore(initialData.id, projectDataForFirestore);
    } else {
      result = await addProjectToFirestore(projectDataForFirestore);
    }

    if (result.error) {
      toast({
        title: `${isEditMode ? "Update" : "Submission"} Failed`,
        description: `Could not ${isEditMode ? "update" : "submit"} project: ${result.error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: `Project ${isEditMode ? "Updated" : "Submitted"}!`,
        description: `"${data.title}" is now ${isEditMode ? "updated in" : "in"} our system.`,
        variant: "default",
      });
      if (!isEditMode) {
        form.reset({ // Reset to default placeholder for new projects
            title: "",
            description: "",
            techStackString: "",
            imageUrl: "https://placehold.co/600x400.png",
            liveDemoUrl: "",
            githubUrl: "",
        });
      }
      if (onFormSubmit) onFormSubmit();
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">{isEditMode ? "Edit Project" : "Submit New Project"}</CardTitle>
        <CardDescription>
          {isEditMode ? "Update the details of your project below." : "Share your work. Fill out the details below to add it to the showcase."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., My Awesome App" {...field} />
                  </FormControl>
                  <FormDescription>A catchy and descriptive title for your project.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us all about your project, its features, and what you learned."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                   <FormDescription>Provide a detailed description of your project.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="techStackString"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tech Stack</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., React, Next.js, Tailwind CSS" {...field} />
                  </FormControl>
                  <FormDescription>List the technologies used, separated by commas.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Screenshot URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.png" {...field} data-ai-hint="project screenshot app" />
                  </FormControl>
                  <FormDescription>Link to a screenshot or thumbnail of your project. Defaults to placeholder if empty.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="liveDemoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Live Demo URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://my-awesome-app.com" {...field} />
                  </FormControl>
                  <FormDescription>Link to the live, deployed version of your project.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="githubUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub Repository URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://github.com/your-username/your-repo" {...field} />
                  </FormControl>
                  <FormDescription>Link to the project's source code on GitHub.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditMode ? "Updating..." : "Submitting..."}</> : 
                (isEditMode ? "Update Project" : "Submit Project")
              }
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
