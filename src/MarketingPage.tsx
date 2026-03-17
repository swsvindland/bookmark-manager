import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bookmark, FolderOpen, UserCircle, Zap } from 'lucide-react';

interface MarketingPageProps {
    onLoginClick: () => void;
}

export function MarketingPage({ onLoginClick }: MarketingPageProps) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                    <div className="flex items-center gap-2">
                        <Bookmark className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold tracking-widest">Bookmarks</span>
                    </div>
                    <Button onClick={onLoginClick}>Sign In</Button>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-20 sm:py-32">
                    <div className="container mx-auto px-4 sm:px-8 text-center">
                        <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
                            Organize your digital life <br />
                            <span className="text-primary">efficiently.</span>
                        </h1>
                        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                            The modern bookmark manager that helps you keep track of what matters. 
                            Simple, fast, and completely free.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Button size="lg" className="px-8" onClick={onLoginClick}>
                                Start for Free
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-muted/50 py-20">
                    <div className="container mx-auto px-4 sm:px-8">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Everything you need</h2>
                            <p className="text-muted-foreground">Stop losing tabs and start saving ideas.</p>
                        </div>
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            <Card className="card-psycho border-border">
                                <CardHeader>
                                    <FolderOpen className="mb-2 h-10 w-10 text-primary" />
                                    <CardTitle>Folders</CardTitle>
                                    <CardDescription>
                                        Organize your bookmarks into hierarchical folders for easy navigation.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="card-psycho border-border">
                                <CardHeader>
                                    <UserCircle className="mb-2 h-10 w-10 text-primary" />
                                    <CardTitle>Profiles</CardTitle>
                                    <CardDescription>
                                        Separate your Work, Personal, and Side-project bookmarks with profiles.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="card-psycho border-border">
                                <CardHeader>
                                    <Zap className="mb-2 h-10 w-10 text-primary" />
                                    <CardTitle>Lightning Fast</CardTitle>
                                    <CardDescription>
                                        Built on Convex for real-time updates and instant search across all your devices.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="card-psycho border-border">
                                <CardHeader>
                                    <Bookmark className="mb-2 h-10 w-10 text-primary" />
                                    <CardTitle>Quick Preview</CardTitle>
                                    <CardDescription>
                                        See clear titles and links to quickly find what you're looking for.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Pricing Section (Simple Free Tier) */}
                <section className="py-20">
                    <div className="container mx-auto px-4 sm:px-8 text-center">
                        <h2 className="mb-12 text-3xl font-bold tracking-tight sm:text-4xl">Simple Pricing</h2>
                        <div className="mx-auto max-w-sm">
                            <Card className="card-psycho border-primary">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-bold">Free</CardTitle>
                                    <CardDescription>Perfect for personal use</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-6 text-4xl font-bold">$0</div>
                                    <ul className="mb-8 space-y-4 text-left">
                                        <li className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-primary" />
                                            <span>Unlimited Bookmarks</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-primary" />
                                            <span>Multiple Profiles</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-primary" />
                                            <span>Folder Organization</span>
                                        </li>
                                    </ul>
                                    <Button className="w-full" onClick={onLoginClick}>
                                        Get Started
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t py-12">
                <div className="container mx-auto px-4 sm:px-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Bookmarks. Built with Convex and Tailwind CSS.
                    </p>
                </div>
            </footer>
        </div>
    );
}
