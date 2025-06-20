import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Github, Linkedin, Mail, Send } from 'lucide-react';
import Link from 'next/link';
import { MotionDiv } from '@/components/shared/MotionDiv';

export const metadata: Metadata = {
  title: 'Contact Ali Imran | Get In Touch',
  description:
    'Contact Ali Imran for collaborations, project inquiries, or to discuss opportunities. Reach out via email, social media, or the contact form. Let\'s build something great together.',
};

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
                        <form className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">Your Name</label>
                                <Input id="name" placeholder="Ali Imran" required />
                            </div>
                             <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">Your Email</label>
                                <Input id="email" type="email" placeholder="you@example.com" required />
                            </div>
                             <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium">Message</label>
                                <Textarea id="message" placeholder="I'd like to discuss..." required className="min-h-[120px]" />
                            </div>
                            <Button type="submit" className="w-full" size="lg">
                                <Send className="mr-2 h-4 w-4" />
                                Send Message
                            </Button>
                             <p className="text-xs text-center text-muted-foreground pt-2">
                                Note: This form is for UI demonstration only and is not connected to a backend.
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </MotionDiv>
        </div>
      </MotionDiv>
    </div>
  );
}
