import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router"; // Chỉ cần 1 dòng này cho react-router
import { signInSchema } from "~/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

type SignInFormData = z.infer<typeof signInSchema>;

const SignIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const form = useForm<SignInFormData>({
  });

  const handleOnSubmit = async (values: SignInFormData) => {
    setLoading(true); // Kích hoạt trạng thái loading
    try {
      const res = await fetch("http://localhost:3000/login", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (data.success) {
        alert("Đăng nhập thành công!");
        // Lưu token vào trình duyệt để hệ thống biết bạn đã đăng nhập
        localStorage.setItem("token", data.token); 
        navigate("/dashboard"); // Chuyển hướng vào trang Dashboard
      } else {
        alert(data.message); // Hiển thị lỗi "Sai email hoặc mật khẩu!"
      }
    } catch (error) {
      alert("Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center mb-5">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleOnSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@gmail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link to="/forgot-password" className="text-sm text-blue-600">
                        Forgot Password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full font-bold">
                Sign In
              </Button>
            </form>
          </Form>
          <CardFooter className="flex items-center justify-center mt-5">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to="/sign-up" className="text-sm text-blue-600">
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;