"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/Component/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/Component/ui/form";
import { Input } from "@/Component/ui/input";
import { useState } from "react";
import Link from "next/link";
import { createAccount } from "@/lib/actions/user.actions";

type FormType = "sign-in" | "sign-up";

const AuthFormSchema = (formType: FormType) =>
  z.object({
    email: z.string().email("Please enter a valid email address"),
    fullname:
      formType === "sign-up"
        ? z.string().min(2, "Full name too short").max(50)
        : z.string().optional(),
  });

const AuthForm = ({ type }: { type: FormType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [accountId, setAccountId] = useState<string | null>(null);

  const formSchema = AuthFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: "",
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      console.log("Submitting form with values:", values);

      const response = await createAccount({
        FullName: values.fullname || "",
        email: values.email,
      });

      console.log("Server response:", response);

      // Handle potential string response
      let result;
      try {
        result = typeof response === "string" ? JSON.parse(response) : response;
      } catch (e) {
        console.error("Error parsing response:", e);
        setErrorMessage(`Error parsing response: ${response}`);
        return;
      }

      // Check if the response contains an error
      if (result?.error) {
        console.error("Server returned an error:", result);
        setErrorMessage(`Error: ${result.details || result.error}`);
        return;
      }

      if (result?.accountId) {
        console.log("Account created successfully with ID:", result.accountId);
        setAccountId(result.accountId);
        // You should add UI to handle the successful OTP sending
      } else {
        console.error("Invalid response structure:", result);
        setErrorMessage("Failed to create account, please try again.");
      }
    } catch (error) {
      console.error("Error during account creation:", error);
      setErrorMessage(
        error instanceof Error
          ? `Error: ${error.message}`
          : "Failed to create account, please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
        <h1 className="form-title mb-8">
          {type === "sign-in" ? "Sign In" : "Sign Up"}
        </h1>

        {type === "sign-up" && (
          <FormField
            control={form.control}
            name="fullname"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item mb-8">
                  <FormLabel className="shad-form-label">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Your Full Name"
                      className="shad-input"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="shad-form-message" />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <div className="shad-form-item mb-8">
                <FormLabel className="shad-form-label">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter Your Email"
                    className="shad-input"
                    type="email"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage className="shad-form-message" />
            </FormItem>
          )}
        />

        <Button
          className="form-submit-button text-white flex items-center gap-2"
          type="submit"
          disabled={isLoading}
        >
          {type === "sign-in" ? "Sign In" : "Sign Up"}
          {isLoading && (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full ml-2"></div>
          )}
        </Button>

        {errorMessage && (
          <div className="error-message mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        {accountId && (
          <div className="success-message mt-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
            Account created successfully! Check your email for verification.
          </div>
        )}

        <div className="body-2 flex justify-center mt-8">
          <p className="text-light-100">
            {type === "sign-in"
              ? "Don't have an account?"
              : "Already have an account?"}
          </p>
          <Link
            href={type === "sign-in" ? "/sign-up" : "/sign-in"}
            className="ml-1 font-medium text-brand"
          >
            {type === "sign-in" ? "Sign Up" : "Sign In"}
          </Link>
        </div>
      </form>
    </Form>
  );
};

export default AuthForm;
