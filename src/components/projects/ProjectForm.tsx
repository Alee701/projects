
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
import { addProjectToFirestore } from "@/lib/firebase"; // Placeholder
import type { Project } from "@/lib/types"; // Import Project type
import { Loader2 } from "lucide-react";

const projectSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  techStackString: z.string().min(1, { message: "Please list at least one technology (comma-separated)." }),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).or(z.literal('')),
  liveDemoUrl: z.string().url({ message: "Please enter a valid URL for the live demo." }).optional().or(z.literal('')),
  githubUrl: z.string().url({ message: "Please enter a valid URL for the GitHub repository." }).optional().or(z.literal('')),
});

// Infer values for the form
type ProjectFormValues = z.infer<typeof projectSchema>;

const defaultValues: ProjectFormValues = {
  title: "",
  description: "",
  techStackString: "",
  imageUrl: "https://placehold.co/600x400.png", // Default placeholder
  liveDemoUrl: "",
  githubUrl: "",
};

export default function ProjectForm() {
  const { toast } = useToast();
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: ProjectFormValues) {
    const projectDataForFirestore: Omit<Project, 'id'> = {
      title: data.title,
      description: data.description,
      techStack: data.techStackString.split(',').map(tech => tech.trim()).filter(tech => tech),
      imageUrl: data.imageUrl || 'https://placehold.co/600x400.png',
      liveDemoUrl: data.liveDemoUrl || undefined,
      githubUrl: data.githubUrl || undefined,
    };
    
    console.log("Project Data for Firestore:", projectDataForFirestore);

    // Call placeholder function to simulate saving to Firestore
    const { id, error } = await addProjectToFirestore(projectDataForFirestore);

    if (error) {
      toast({
        title: "Submission Failed",
        description: `Could not submit project: ${error.message} (Simulated)`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Project Submitted!",
        description: `"${data.title}" (ID: ${id}) is now in our system (Simulated).`,
      });
      form.reset(); 
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Submit New Project</CardTitle>
        <CardDescription>Share your work. Fill out the details below to add it to the showcase.</CardDescription>
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
                    <Input placeholder="https://example.com/image.png" {...field} />
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
              {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit Project"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
