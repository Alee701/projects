
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
import { addProjectToFirestore, updateProjectInFirestore, uploadProjectImage, deleteProjectImageByUrl } from "@/lib/firebase";
import type { Project } from "@/lib/types";
import { Loader2, Sparkles, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { suggestProjectDescription } from "@/ai/flows/suggest-project-description-flow";
import type { SuggestProjectDescriptionInput } from "@/ai/flows/suggest-project-description-flow";

const defaultPlaceholderImage = "https://placehold.co/800x450.png";

const projectSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(100, { message: "Title cannot exceed 100 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(2000, { message: "Description cannot exceed 2000 characters." }),
  techStackString: z.string().min(1, { message: "Please list at least one technology (comma-separated)." }),
  imageUrl: z.string().url({ message: "Image URL must be a valid URL." }).optional().or(z.literal('')), // Will hold the final URL
  liveDemoUrl: z.string().url({ message: "Please enter a valid URL for the live demo." }).optional().or(z.literal('')),
  githubUrl: z.string().url({ message: "Please enter a valid URL for the GitHub repository." }).optional().or(z.literal('')),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  initialData?: Project | null;
  onFormSubmit?: () => void;
}

export default function ProjectForm({ initialData, onFormSubmit }: ProjectFormProps) {
  const { toast } = useToast();
  const isEditMode = !!initialData;
  const [isSuggestingDescription, setIsSuggestingDescription] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(initialData?.imageUrl || defaultPlaceholderImage);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const defaultValues: ProjectFormValues = {
    title: initialData?.title || "",
    description: initialData?.description || "",
    techStackString: initialData?.techStack?.join(", ") || "",
    imageUrl: initialData?.imageUrl || defaultPlaceholderImage,
    liveDemoUrl: initialData?.liveDemoUrl || "",
    githubUrl: initialData?.githubUrl || "",
  };

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    form.reset({
      title: initialData?.title || "",
      description: initialData?.description || "",
      techStackString: initialData?.techStack?.join(", ") || "",
      imageUrl: initialData?.imageUrl || defaultPlaceholderImage,
      liveDemoUrl: initialData?.liveDemoUrl || "",
      githubUrl: initialData?.githubUrl || "",
    });
    setImagePreviewUrl(initialData?.imageUrl || defaultPlaceholderImage);
    setSelectedFile(null); // Clear selected file when initialData changes
  }, [initialData, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      form.setValue("imageUrl", URL.createObjectURL(file), { shouldValidate: true, shouldDirty: true }); // Temporary for preview, real URL after upload
    } else {
      setSelectedFile(null);
      // Revert to initial/default if file is deselected
      setImagePreviewUrl(initialData?.imageUrl || defaultPlaceholderImage);
      form.setValue("imageUrl", initialData?.imageUrl || defaultPlaceholderImage);
    }
  };

  async function onSubmit(data: ProjectFormValues) {
    setIsUploadingImage(true); // Covers both image upload and Firestore submission phases
    let finalImageUrl = data.imageUrl || defaultPlaceholderImage; // Start with current form value or default
    let oldImageUrlToDelete: string | undefined = undefined;

    if (selectedFile) {
      const fileName = `${Date.now()}-${selectedFile.name.replace(/\s+/g, '_')}`;
      toast({ title: "Uploading Image...", description: "Please wait while your image is being uploaded." });
      const uploadResult = await uploadProjectImage(selectedFile, fileName);

      if (uploadResult.url) {
        finalImageUrl = uploadResult.url;
        if (isEditMode && initialData?.imageUrl && initialData.imageUrl !== defaultPlaceholderImage && initialData.imageUrl !== finalImageUrl) {
          oldImageUrlToDelete = initialData.imageUrl;
        }
        toast({ title: "Image Uploaded Successfully!", variant: "default" });
      } else {
        toast({
          title: "Image Upload Failed",
          description: uploadResult.error?.message || "Could not upload the image. Please try again.",
          variant: "destructive",
        });
        setIsUploadingImage(false);
        return;
      }
    } else {
       // If no new file is selected, use existing URL or placeholder
      finalImageUrl = initialData?.imageUrl || defaultPlaceholderImage;
    }
    
    form.setValue("imageUrl", finalImageUrl, { shouldValidate: true }); // Set final URL in form for schema validation if needed

    // Re-validate the form with the final image URL, though schema allows optional.
    const validationResult = await form.trigger();
    if (!validationResult) {
        setIsUploadingImage(false);
        toast({ title: "Validation Error", description: "Please check the form fields for errors.", variant: "destructive" });
        return;
    }
    
    const currentValidatedData = form.getValues(); // Get potentially updated values after setValue and trigger

    const projectDataForFirestore: Omit<Project, 'id'> = {
      title: currentValidatedData.title,
      description: currentValidatedData.description,
      techStack: currentValidatedData.techStackString.split(',').map(tech => tech.trim()).filter(tech => tech),
      imageUrl: finalImageUrl,
    };

    if (currentValidatedData.liveDemoUrl && currentValidatedData.liveDemoUrl.trim() !== "") {
      projectDataForFirestore.liveDemoUrl = currentValidatedData.liveDemoUrl;
    }
    if (currentValidatedData.githubUrl && currentValidatedData.githubUrl.trim() !== "") {
      projectDataForFirestore.githubUrl = currentValidatedData.githubUrl;
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
      // If Firestore operation failed and we uploaded a new image, we might want to delete it (orphan).
      // For simplicity now, we don't. Or, upload only after confirming other data.
    } else {
      toast({
        title: `Project ${isEditMode ? "Updated" : "Submitted"}!`,
        description: `"${currentValidatedData.title}" has been successfully ${isEditMode ? "updated" : "added"}.`,
        variant: "default",
      });

      if (oldImageUrlToDelete) {
        await deleteProjectImageByUrl(oldImageUrlToDelete); // Delete old image after successful update
      }

      if (!isEditMode) {
        form.reset(defaultValues); // Reset to initial default values for new submission
        setImagePreviewUrl(defaultPlaceholderImage);
        setSelectedFile(null);
      } else {
         // For edit mode, update initialData-like state if needed or rely on onFormSubmit to refetch
         // Update preview to reflect the saved state
        setImagePreviewUrl(finalImageUrl);
        setSelectedFile(null);

      }
      if (onFormSubmit) onFormSubmit();
    }
    setIsUploadingImage(false);
  }

  const handleSuggestDescription = async () => {
    const title = form.getValues("title");
    const techStack = form.getValues("techStackString");

    if (!title || !techStack) {
      toast({
        title: "Missing Information",
        description: "Please provide a project title and tech stack to suggest a description.",
        variant: "destructive",
      });
      return;
    }

    setIsSuggestingDescription(true);
    try {
      const input: SuggestProjectDescriptionInput = { title, techStack };
      const result = await suggestProjectDescription(input);
      if (result.suggestedDescription) {
        form.setValue("description", result.suggestedDescription, {
          shouldValidate: true,
          shouldDirty: true,
        });
        toast({
          title: "Description Suggested!",
          description: "The AI has generated a description for you. Feel free to edit it.",
        });
      } else {
        throw new Error("AI did not return a description.");
      }
    } catch (error: any) {
      console.error("Error suggesting description:", error);
      toast({
        title: "Suggestion Failed",
        description: error.message || "Could not get a suggestion from the AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSuggestingDescription(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-xl rounded-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">{isEditMode ? "Edit Project Details" : "Submit New Project"}</CardTitle>
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
                    <Input placeholder="e.g., My Awesome App" {...field} className="text-base" />
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
                  <div className="flex justify-between items-center mb-1">
                    <FormLabel>Description</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSuggestDescription}
                      disabled={isSuggestingDescription || !form.watch("title") || !form.watch("techStackString")}
                      className="transition-all hover:shadow-md"
                    >
                      {isSuggestingDescription ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Sparkles />
                      )}
                      Suggest with AI
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us all about your project, its features, and what you learned."
                      className="resize-y min-h-[120px] text-base"
                      {...field}
                    />
                  </FormControl>
                   <FormDescription>Provide a detailed description of your project. You can also use the AI suggester!</FormDescription>
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
                    <Input placeholder="e.g., React, Next.js, Tailwind CSS, Firebase" {...field} className="text-base"/>
                  </FormControl>
                  <FormDescription>List the technologies used, separated by commas.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Image Upload Field */}
            <FormItem>
              <FormLabel>Project Screenshot</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </FormControl>
              {imagePreviewUrl && (
                <div className="mt-4 relative w-full aspect-[16/9] max-w-md border rounded-lg overflow-hidden bg-muted/30 mx-auto shadow-inner">
                  <Image 
                    src={imagePreviewUrl} 
                    alt="Project image preview" 
                    fill 
                    className="object-contain"
                    data-ai-hint="project screenshot app" 
                    key={imagePreviewUrl} // Force re-render if URL changes (e.g. after upload)
                  />
                </div>
              )}
              <FormDescription>
                Upload an image for your project (e.g., PNG, JPG). Max 5MB.
                If no image is uploaded, a default placeholder will be used.
                Uploading a new image will replace the current one.
              </FormDescription>
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => <Input type="hidden" {...field} />} // Hidden field to store validated URL
              />
              <FormMessage />
            </FormItem>

            <FormField
              control={form.control}
              name="liveDemoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Live Demo URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://my-awesome-app.com" {...field} className="text-base"/>
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
                    <Input placeholder="https://github.com/your-username/your-repo" {...field} className="text-base"/>
                  </FormControl>
                  <FormDescription>Link to the project's source code on GitHub.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow" 
              size="lg" 
              disabled={form.formState.isSubmitting || isSuggestingDescription || isUploadingImage}
            >
              {isUploadingImage ? <Loader2 className="animate-spin" /> : (isEditMode ? "Update Project" : "Submit Project")}
              {isUploadingImage && (selectedFile ? " Uploading Image & Saving..." : " Saving Project...")}
              {!isUploadingImage && (isEditMode ? "" : "")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
