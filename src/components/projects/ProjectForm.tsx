
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
import { Loader2, Sparkles, Upload, Star, Link2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { suggestProjectDescription } from "@/ai/flows/suggest-project-description-flow";
import type { SuggestProjectDescriptionInput } from "@/ai/flows/suggest-project-description-flow";
import { uploadImageToCloudinary } from "@/ai/flows/upload-image-to-cloudinary-flow";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const defaultPlaceholderImage = "https://placehold.co/800x450.png?text=Provide+Project+Image";
const defaultAuthorName = "Ali Imran";
const defaultAvatar = "https://res.cloudinary.com/dkfvndipz/image/upload/v1751431247/Code_with_Ali_Imran_1_qh4lf2.png";

const projectSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(100, { message: "Title cannot exceed 100 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(2000, { message: "Description cannot exceed 2000 characters." }),
  techStackString: z.string().min(1, { message: "Please list at least one technology (comma-separated)." }),
  imageUrl: z.string().url({ message: "Please provide a valid image URL." }).min(1, { message: "Project image is required."}),
  liveDemoUrl: z.string().url({ message: "Please enter a valid URL for the live demo." }).optional().or(z.literal('')),
  githubUrl: z.string().url({ message: "Please enter a valid URL for the GitHub repository." }).optional().or(z.literal('')),
  isFeatured: z.boolean().default(false),
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
  const [isUploading, setIsUploading] = useState(false);
  const [imagePublicId, setImagePublicId] = useState(initialData?.imagePublicId || null);
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || defaultPlaceholderImage);
  const imageUploadRef = useRef<HTMLInputElement>(null);

  const defaultValues: ProjectFormValues = {
    title: initialData?.title || "",
    description: initialData?.description || "",
    techStackString: initialData?.techStack?.join(", ") || "",
    imageUrl: initialData?.imageUrl || "",
    liveDemoUrl: initialData?.liveDemoUrl || "",
    githubUrl: initialData?.githubUrl || "",
    isFeatured: initialData?.isFeatured || false,
  };

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues,
    mode: "onChange",
  });
  
  const watchedTitle = form.watch("title");
  const watchedTechStack = form.watch("techStackString");
  const watchedImageUrl = form.watch("imageUrl");

  useEffect(() => {
    form.reset(defaultValues);
    setImagePreview(initialData?.imageUrl || defaultPlaceholderImage);
    setImagePublicId(initialData?.imagePublicId || null);
  }, [initialData, form]);

  useEffect(() => {
    if (watchedImageUrl) {
      setImagePreview(watchedImageUrl);
    } else {
      setImagePreview(defaultPlaceholderImage);
    }
  }, [watchedImageUrl]);
  
  async function onSubmit(data: ProjectFormValues) {
    const projectDataForFirestore: Omit<Project, 'id'> = {
      title: data.title,
      description: data.description,
      techStack: data.techStackString.split(',').map(tech => tech.trim()).filter(tech => tech),
      imageUrl: data.imageUrl,
      imagePublicId: imagePublicId,
      liveDemoUrl: data.liveDemoUrl || '',
      githubUrl: data.githubUrl || '',
      authorName: defaultAuthorName,
      authorImageUrl: defaultAvatar,
      isFeatured: data.isFeatured,
    };

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
        description: `"${data.title}" has been successfully ${isEditMode ? "updated" : "added"}.`,
        variant: "default",
      });

      if (!isEditMode) {
        form.reset({
          ...defaultValues,
          imageUrl: '', // Reset imageUrl explicitly
        });
        setImagePreview(defaultPlaceholderImage);
        setImagePublicId(null);
      }
      if (onFormSubmit) onFormSubmit();
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    toast({ title: "Uploading Image...", description: "Please wait while your image is being uploaded." });
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const imageDataUri = reader.result as string;
      try {
        const result = await uploadImageToCloudinary({ imageDataUri, fileName: file.name });
        if (result.imageUrl && result.imagePublicId) {
          form.setValue("imageUrl", result.imageUrl, { shouldValidate: true, shouldDirty: true });
          setImagePublicId(result.imagePublicId);
          toast({ title: "Image Uploaded!", description: "The project image has been successfully uploaded." });
        } else {
          throw new Error("Cloudinary did not return a valid URL or Public ID.");
        }
      } catch (error: any) {
        toast({
          title: "Upload Failed",
          description: error.message || "Could not upload the image. Please try again.",
          variant: "destructive",
        });
        form.setValue("imageUrl", ""); // Clear imageUrl on failure
      } finally {
        setIsUploading(false);
        if (imageUploadRef.current) {
            imageUploadRef.current.value = "";
        }
      }
    };
    reader.onerror = () => {
        toast({ title: "Error", description: "Failed to read the image file.", variant: "destructive" });
        setIsUploading(false);
    }
  };

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
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-secondary/50">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center gap-2">
                      <Star className="text-amber-500"/>
                      Mark as Featured
                    </FormLabel>
                    <FormDescription>
                      This project will be highlighted on the homepage.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

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
                      disabled={isSuggestingDescription || !watchedTitle || !watchedTechStack}
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
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Image</FormLabel>
                  <Tabs defaultValue="url" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="url">Image URL</TabsTrigger>
                        <TabsTrigger value="upload">Upload File</TabsTrigger>
                    </TabsList>
                    <TabsContent value="url" className="mt-4">
                        <FormDescription className="mb-2">
                            Paste a direct link to an image.
                        </FormDescription>
                        <div className="flex items-center gap-2">
                            <Link2 className="text-muted-foreground" />
                             <FormControl>
                                <Input
                                    placeholder="https://example.com/image.png"
                                    {...field}
                                    onChange={(e) => {
                                        field.onChange(e);
                                        setImagePublicId(null);
                                    }}
                                />
                             </FormControl>
                        </div>
                    </TabsContent>
                    <TabsContent value="upload" className="mt-4">
                         <FormDescription className="mb-2">
                            Upload an image from your computer.
                        </FormDescription>
                         <Button
                            type="button"
                            variant="outline"
                            onClick={() => imageUploadRef.current?.click()}
                            disabled={isUploading}
                          >
                            {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
                            {isUploading ? 'Uploading...' : 'Choose Image'}
                          </Button>
                         <Input
                            ref={imageUploadRef}
                            type="file"
                            accept="image/png, image/jpeg, image/gif, image/webp"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                          />
                    </TabsContent>
                  </Tabs>
                  
                  <div className="mt-4 relative w-full aspect-[16/9] max-w-md border rounded-lg overflow-hidden bg-muted/30 mx-auto shadow-inner">
                    <Image 
                      src={imagePreview} 
                      alt="Project image preview" 
                      fill 
                      className="object-contain"
                      data-ai-hint="project screenshot app" 
                      key={imagePreview} // Re-renders image when src changes
                      onError={() => setImagePreview(defaultPlaceholderImage)}
                    />
                  </div>
                  <FormMessage className="mt-2" />
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
                    <Input placeholder="https://github.com/Alee701" {...field} className="text-base"/>
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
              disabled={form.formState.isSubmitting || isSuggestingDescription || isUploading}
            >
              {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : (isEditMode ? "Update Project" : "Submit Project")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
