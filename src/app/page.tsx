import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  ClipboardCheck,
  BookOpen,
  Zap,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: ClipboardCheck,
    title: "Compliance Dashboard",
    description:
      "See exactly which employment laws apply to your business at a glance. No legal expertise required.",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description:
      "Understand key employment laws like FLSA, FMLA, ADA, and OSHA with clear, plain-English guides.",
  },
  {
    icon: Zap,
    title: "Actionable Tasks",
    description:
      "Get a prioritized list of compliance actions with deadlines so nothing falls through the cracks.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" className="mb-6">
              Employment Compliance Made Simple
            </Badge>
            <Heading size="3xl" className="mb-6">
              Know which employment laws{" "}
              <span className="gradient-text">apply to your business.</span>
            </Heading>
            <Text size="lg" variant="muted" className="mx-auto mb-10 max-w-2xl">
              ComplianceIQ helps small and medium-sized businesses understand
              which employment laws and HR compliance requirements apply to them.
              Get a personalized roadmap in minutes.
            </Text>
            <div className="flex items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-surface-200 bg-surface-50 py-20 dark:border-surface-800 dark:bg-surface-900/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <Heading size="xl" className="mb-4">
                Everything you need to stay compliant
              </Heading>
              <Text variant="muted">
                Built for small business owners who want clarity, not confusion.
              </Text>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} hover padding="lg">
                  <CardContent>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/50">
                      <feature.icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                    </div>
                    <Heading size="sm" className="mb-2">
                      {feature.title}
                    </Heading>
                    <Text size="sm" variant="muted">
                      {feature.description}
                    </Text>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl rounded-2xl border border-surface-200 bg-white p-10 shadow-elevated dark:border-surface-800 dark:bg-surface-900 sm:p-14">
              <Shield className="mx-auto mb-6 h-12 w-12 text-brand-600" />
              <Heading size="xl" className="mb-4">
                Ready to get compliant?
              </Heading>
              <Text variant="muted" className="mb-8">
                Build your company profile and get a personalized compliance
                roadmap in minutes.
              </Text>
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
