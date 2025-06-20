
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
import { addProjectToFirestore, updateProjectInFirestore } from "@/lib/firebase"; // Removed Firebase Storage imports
import type { Project } from "@/lib/types";
import { Loader2, Sparkles } from "lucide-react"; // Removed UploadCloud
import Image from "next/image";
import { useEffect, useState } from "react";
import { suggestProjectDescription } from "@/ai/flows/suggest-project-description-flow";
import type { SuggestProjectDescriptionInput } from "@/ai/flows/suggest-project-description-flow";
import { uploadImageToCloudinary } from "@/ai/flows/upload-image-to-cloudinary-flow"; // New Cloudinary upload flow

const defaultPlaceholderImage = "https://placehold.co/800x450.png?text=Project+Image";

const projectSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(100, { message: "Title cannot exceed 100 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(2000, { message: "Description cannot exceed 2000 characters." }),
  techStackString: z.string().min(1, { message: "Please list at least one technology (comma-separated)." }),
  imageUrl: z.string().url({ message: "Image URL must be a valid URL." }).optional().or(z.literal('')),
  imagePublicId: z.string().optional(), // For Cloudinary public ID
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
  const [imageDataUri, setImageDataUri] = useState<string | null>(null); // For base64 data
  const [isUploadingImage, setIsUploadingImage] = useState(false);


  const defaultValues: ProjectFormValues = {
    title: initialData?.title || "",
    description: initialData?.description || "",
    techStackString: initialData?.techStack?.join(", ") || "",
    imageUrl: initialData?.imageUrl || defaultPlaceholderImage,
    imagePublicId: initialData?.imagePublicId || "",
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
      imagePublicId: initialData?.imagePublicId || "",
      liveDemoUrl: initialData?.liveDemoUrl || "",
      githubUrl: initialData?.githubUrl || "",
    });
    setImagePreviewUrl(initialData?.imageUrl || defaultPlaceholderImage);
    setSelectedFile(null);
    setImageDataUri(null);
  }, [initialData, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreviewUrl(base64String); // Preview with base64
        setImageDataUri(base64String);   // Store base64 for upload
        form.setValue("imageUrl", base64String, { shouldValidate: false, shouldDirty: true }); // Temp for preview state
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setImagePreviewUrl(initialData?.imageUrl || defaultPlaceholderImage);
      setImageDataUri(null);
      form.setValue("imageUrl", initialData?.imageUrl || defaultPlaceholderImage);
    }
  };

  async function onSubmit(data: ProjectFormValues) {
    setIsUploadingImage(true);
    let finalImageUrl = data.imageUrl || defaultPlaceholderImage;
    let finalImagePublicId = data.imagePublicId || undefined;

    if (selectedFile && imageDataUri) {
      toast({ title: "Uploading Image...", description: "Please wait while your image is being uploaded to Cloudinary." });
      try {
        const uploadResult = await uploadImageToCloudinary({ 
          imageDataUri: imageDataUri,
          fileName: selectedFile.name 
        });
        finalImageUrl = uploadResult.imageUrl;
        finalImagePublicId = uploadResult.imagePublicId;
        toast({ title: "Image Uploaded Successfully to Cloudinary!", variant: "default" });
      } catch (error: any) {
        toast({
          title: "Cloudinary Image Upload Failed",
          description: error?.message || "Could not upload the image. Please try again.",
          variant: "destructive",
        });
        setIsUploadingImage(false);
        return;
      }
    } else if (!isEditMode || (isEditMode && !initialData?.imageUrl)) {
      // No new file, and no existing image in edit mode, or it's a new project with no file
      finalImageUrl = defaultPlaceholderImage;
      finalImagePublicId = undefined;
    } else if (isEditMode && initialData?.imageUrl) {
      // Edit mode, no new file selected, retain existing image
      finalImageUrl = initialData.imageUrl;
      finalImagePublicId = initialData.imagePublicId;
    }
    
    form.setValue("imageUrl", finalImageUrl, { shouldValidate: true });
    form.setValue("imagePublicId", finalImagePublicId, { shouldValidate: false });

    const validationResult = await form.trigger();
    if (!validationResult) {
        setIsUploadingImage(false);
        toast({ title: "Validation Error", description: "Please check the form fields for errors.", variant: "destructive" });
        return;
    }
    
    const currentValidatedData = form.getValues();

    const projectDataForFirestore: Omit<Project, 'id'> = {
      title: currentValidatedData.title,
      description: currentValidatedData.description,
      techStack: currentValidatedData.techStackString.split(',').map(tech => tech.trim()).filter(tech => tech),
      imageUrl: finalImageUrl, // This will be Cloudinary URL or placeholder
      imagePublicId: finalImagePublicId, // Cloudinary public ID
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
    } else {
      toast({
        title: `Project ${isEditMode ? "Updated" : "Submitted"}!`,
        description: `"${currentValidatedData.title}" has been successfully ${isEditMode ? "updated" : "added"}.`,
        variant: "default",
      });

      if (!isEditMode) {
        form.reset(defaultValues); 
        setImagePreviewUrl(defaultPlaceholderImage);
        setSelectedFile(null);
        setImageDataUri(null);
      } else {
        setImagePreviewUrl(finalImageUrl); // Update preview with the saved Cloudinary URL
        setSelectedFile(null);
        setImageDataUri(null);
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
            
            <FormItem>
              <FormLabel>Project Screenshot</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  data-ai-hint="upload button interface"
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
                    key={imagePreviewUrl} 
                  />
                </div>
              )}
              <FormDescription>
                Upload an image for your project (e.g., PNG, JPG). Max 5MB.
                If no image is uploaded, a default placeholder will be used.
                Uploading a new image will replace the current one on Cloudinary.
              </FormDescription>
              <FormField
                control={form.control}
                name="imageUrl" // This still holds the final URL (Cloudinary or placeholder)
                render={({ field }) => <Input type="hidden" {...field} />}
              />
               <FormField
                control={form.control}
                name="imagePublicId" // Hidden field for Cloudinary public_id
                render={({ field }) => <Input type="hidden" {...field} />}
              />
              <FormMessage /> {/* For imageUrl field if needed, though type="file" has its own reporting */}
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
