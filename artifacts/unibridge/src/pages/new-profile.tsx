import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useCreateUser } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20),
  displayName: z.string().optional(),
  gradYear: z.coerce.number().min(2020).max(2030),
  bio: z.string().max(200).optional(),
  gpa: z.coerce.number().min(0).max(4.0).optional().or(z.literal(0)),
  satScore: z.coerce.number().min(400).max(1600).optional().or(z.literal(0)),
  actScore: z.coerce.number().min(1).max(36).optional().or(z.literal(0)),
  targetCollegesString: z.string().optional(),
  extracurricularsString: z.string().optional(),
});

export default function NewProfile() {
  const [, setLocation] = useLocation();
  const { setUserId } = useAuth();
  const { toast } = useToast();
  const createUser = useCreateUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      displayName: "",
      gradYear: new Date().getFullYear() + 1,
      bio: "",
      targetCollegesString: "",
      extracurricularsString: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const targetColleges = values.targetCollegesString
      ? values.targetCollegesString.split(",").map(s => s.trim()).filter(Boolean)
      : [];
      
    const extracurriculars = values.extracurricularsString
      ? values.extracurricularsString.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    createUser.mutate(
      {
        data: {
          username: values.username,
          displayName: values.displayName || values.username,
          gradYear: values.gradYear,
          bio: values.bio,
          gpa: values.gpa || undefined,
          satScore: values.satScore || undefined,
          actScore: values.actScore || undefined,
          targetColleges,
          extracurriculars,
        },
      },
      {
        onSuccess: (user) => {
          setUserId(user.id);
          toast({ title: "Profile created successfully" });
          setLocation(`/profile/${user.id}`);
        },
        onError: () => {
          toast({ title: "Failed to create profile", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 animate-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-serif">Set Up Your Profile</CardTitle>
          <CardDescription>Share your stats and goals to connect with peers on the same journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="John D." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A little about yourself..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name="gradYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grad Year</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gpa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GPA (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="satScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SAT (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="actScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ACT (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="targetCollegesString"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Colleges (comma separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="Stanford, MIT, Berkeley" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="extracurricularsString"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Extracurriculars (comma separated)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Debate Team, Varsity Tennis, Robotics Club President" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={createUser.isPending}
                  className="font-bold w-full md:w-auto"
                >
                  {createUser.isPending ? "Creating..." : "Create Profile"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
