import type { Metadata } from 'next';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutPanelLeft, Code, Database, Server, ComponentIcon, Code2 } from 'lucide-react';
import { MotionDiv } from '@/components/shared/MotionDiv';

export const metadata: Metadata = {
  title: 'About Ali Imran | Full-Stack Developer',
  description:
    'Discover Ali Imran, a passionate Full-Stack Developer specializing in MERN, PHP, and CMS platforms like WordPress and Shopify. Building innovative and high-performance web applications.',
};

const skills = [
    { name: 'React & Next.js', icon: <ComponentIcon className="h-5 w-5 text-primary" />, description: 'Building dynamic, server-rendered, and fast user interfaces.' },
    { name: 'Node.js & Express.js', icon: <Server className="h-5 w-5 text-primary" />, description: 'Creating robust and scalable server-side APIs.' },
    { name: 'MongoDB & Mongoose', icon: <Database className="h-5 w-5 text-primary" />, description: 'Designing and managing flexible, NoSQL databases.' },
    { name: 'PHP Development', icon: <Code2 className="h-5 w-5 text-primary" />, description: 'Experience in server-side scripting with PHP for custom themes and plugins.' },
    { name: 'CMS Expertise (WordPress & Shopify)', icon: <LayoutPanelLeft className="h-5 w-5 text-primary" />, description: 'Customizing e-commerce and content websites on platforms like Shopify and WordPress.' },
    { name: 'Modern Web Technologies', icon: <Code className="h-5 w-5 text-primary" />, description: 'Proficient in TypeScript, Tailwind CSS, and Git for modern development workflows.' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
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

export default function AboutPage() {
  return (
    <div className="py-12 md:py-16">
      <MotionDiv
        className="container mx-auto px-4 md:px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <MotionDiv variants={itemVariants} className="space-y-6 text-center md:text-left">
            <h1 className="text-4xl font-headline font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl">
              About Me
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              I am a dedicated and passionate Full-Stack Developer with a broad skill set. My journey in web development is driven by a love for creating seamless, user-friendly, and powerful digital experiences from scratch.
            </p>
            <p className="text-muted-foreground">
              From designing RESTful APIs with Node.js to building interactive UIs with React, my expertise also extends to server-side scripting with PHP and developing custom solutions for CMS platforms like WordPress and Shopify. I thrive on solving complex problems and turning innovative ideas into reality.
            </p>
          </MotionDiv>

          <MotionDiv variants={itemVariants} className="relative flex justify-center items-end h-[400px] md:h-[500px]">
            <div className="relative w-full h-full">
                <Image
                  src="https://placehold.co/400x500.png"
                  alt="A professional portrait of Ali Imran"
                  fill
                  className="object-contain object-bottom"
                  sizes="(max-width: 768px) 70vw, 33vw"
                  data-ai-hint="full body portrait developer"
                  priority
                />
            </div>
          </MotionDiv>
        </div>

        <MotionDiv variants={itemVariants} className="mt-20 md:mt-28">
            <Card className="shadow-lg rounded-xl">
                <CardHeader className="text-center">
                    <h2 className="text-3xl font-headline font-bold">My Core Competencies</h2>
                    <p className="text-muted-foreground">The technologies I excel at to bring projects to life.</p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                        {skills.map((skill) => (
                            <div key={skill.name} className="flex items-start space-x-4">
                                <div className="flex-shrink-0 mt-1">{skill.icon}</div>
                                <div>
                                    <h3 className="text-lg font-semibold">{skill.name}</h3>
                                    <p className="text-muted-foreground">{skill.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </MotionDiv>
      </MotionDiv>
    </div>
  );
}
