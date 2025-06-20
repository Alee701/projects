
"use client";

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Github, Linkedin, Mail, Send, Loader2 } from 'lucide-react';
import { MotionDiv } from '@/components/shared/MotionDiv';
import { useToast } from '@/hooks/use-toast';
import { submitContactForm } from './actions';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters long.' }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
      staggerChildren: 0.2
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function ContactPage() {
  const { toast } = useToast();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: ContactFormValues) {
    const result = await submitContactForm(data);

    if (result.success) {
      toast({
        title: 'Message Sent!',
        description: result.message,
        variant: 'default',
      });
      form.reset();
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="py-12 md:py-16">
       <MotionDiv
        className="container mx-auto px-4 md:px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
       >
        <div className="text-center mb-12">
            <MotionDiv variants={itemVariants}>
              <h1 className="text-4xl font-headline font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl">
                Get In Touch
              </h1>
            </MotionDiv>
            <MotionDiv variants={itemVariants}>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl">
                I'm always open to discussing new projects, creative ideas, or opportunities to be part of an ambitious vision.
              </p>
            </MotionDiv>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <MotionDiv variants={itemVariants} className="space-y-8">
                <h2 className="text-2xl font-headline font-bold">Contact Information</h2>
                <div className="space-y-4">
                    <Card className="flex items-center p-4 hover:shadow-lg transition-shadow rounded-lg">
                        <Mail className="h-6 w-6 mr-4 text-primary" />
                        <div>
                            <h3 className="font-semibold">Email</h3>
                            <a href="mailto:contact@aliimran.dev" className="text-muted-foreground hover:text-primary transition-colors">
                                contact@aliimran.dev
                            </a>
                        </div>
                    </Card>
                    <Card className="flex items-center p-4 hover:shadow-lg transition-shadow rounded-lg">
                        <Linkedin className="h-6 w-6 mr-4 text-primary" />
                        <div>
                            <h3 className="font-semibold">LinkedIn</h3>
                            <Link href="https://linkedin.com/in/your-profile" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                linkedin.com/in/your-profile
                            </Link>
                        </div>
                    </Card>
                    <Card className="flex items-center p-4 hover:shadow-lg transition-shadow rounded-lg">
                        <Github className="h-6 w-6 mr-4 text-primary" />
                        <div>
                            <h3 className="font-semibold">GitHub</h3>
                            <Link href="https://github.com/your-username" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                github.com/your-username
                            </Link>
                        </div>
                    </Card>
                </div>
            </MotionDiv>

            <MotionDiv variants={itemVariants}>
                <Card className="shadow-xl rounded-xl p-6 md:p-8">
                    <CardHeader className="p-0 mb-6">
                        <CardTitle className="font-headline text-2xl">Send me a message</CardTitle>
                        <CardDescription>I'll get back to you as soon as possible.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Your Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Ali Imran" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                             <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Your Email</FormLabel>
                                  <FormControl>
                                    <Input placeholder="you@example.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                             <FormField
                              control={form.control}
                              name="message"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Message</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="I'd like to discuss..." className="min-h-[120px]" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                              {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="mr-2 h-4 w-4" />
                              )}
                              {isSubmitting ? 'Sending...' : 'Send Message'}
                            </Button>
                        </form>
                        </Form>
                    </CardContent>
                </Card>
            </MotionDiv>
        </div>
      </MotionDiv>
    </div>
  );
}
