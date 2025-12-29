import React, { useState } from "react"; // Đã thêm useState
import { useForm } from "react-hook-form";
import { signInSchema, signUpSchema } from "~/lib/schema";
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
import { Link, useNavigate } from "react-router"; // Đã thêm useNavigate

type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const navigate = useNavigate(); // Dùng để chuyển trang sau khi đăng ký thành công
  const [loading, setLoading] = useState(false); // Trạng thái chờ server phản hồi

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      confirmPassword: "",
    },
  });

  // Chỉnh sửa hàm handleOnSubmit để kết nối với Backend
  const handleOnSubmit = async (values: SignUpFormData) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      
      if (data.success) {
        alert("Đăng ký thành công! Hãy đăng nhập.");
        navigate("/sign-in"); // Chuyển về trang đăng nhập
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (error) {
      alert("Không thể kết nối đến Server Backend!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center mb-5">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Create an account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleOnSubmit)} className="space-y-6">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@gmail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
              />

              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Nguyen Thi Thanh Ngan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
              />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
              />

              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
              />

              {/* Thêm disabled={loading} để tránh nhấn nhiều lần */}
              <Button type="submit" className="w-full font-bold" disabled={loading}>
                {loading ? "Đang đăng ký..." : "Sign Up"}
              </Button>
            </form>
          </Form>
          <CardFooter className="flex items-center justify-center mt-5">
            <div className="flex items-center justify-center"></div>
            <p className="text-sm text-muted-foreground">
               Already have an account? {"\t"}
              <Link to="/sign-in" className="text-sm text-blue-600">Sign In</Link>
            </p>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;