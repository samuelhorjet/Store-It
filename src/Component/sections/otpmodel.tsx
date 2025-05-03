"use client"

import React, { useState } from "react";
import Image from "next/image";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/Component/ui/alert-dialog";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/Component/ui/input-otp";
import { sendEmailOTP, verifySecret } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";

const OtpModal = ({
  accountId,
  email,
}: {
  accountId: string;
  email: string;
    }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        const sessionId = await verifySecret({ accountId, password }); // Remove the inline destructuring

      if (sessionId) {
        router.push("/");
      }
    } catch (error) {
      console.log("Failed to verify OTP:", error);
    }

    setIsLoading(false);
  };


   const handleResendOTP = async () => {
     await sendEmailOTP({ email });
   };


  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="shad-alert-dialog">
        <AlertDialogHeader className="relative flex justify-center">
          <AlertDialogTitle className="h2 text-center">
            Enter Your OTP
            <Image
              src="/public/assets/icons/close-dark.svg"
              alt="close"
              width={20}
              height={20}
              onClick={() => setIsOpen(false)}
              className="otp-close-button"
            />
          </AlertDialogTitle>
          <AlertDialogDescription className="subtitle-2 text-center text-light-100">
            We&apos;ve sent a code to {""}
            <span className="pl-1 text-brand">{email}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <InputOTP maxLength={6} value={password} onChange={setPassword}>
          <InputOTPGroup className="shad-otp">
            <InputOTPSlot index={0} className="shad-otp-slot text-brand" />
            <InputOTPSlot index={1} className="shad-otp-slot text-brand" />
            <InputOTPSlot index={2} className="shad-otp-slot text-brand" />
            <InputOTPSlot index={3} className="shad-otp-slot text-brand" />
            <InputOTPSlot index={4} className="shad-otp-slot text-brand" />
            <InputOTPSlot index={5} className="shad-otp-slot text-brand" />
          </InputOTPGroup>
        </InputOTP>

        <AlertDialogFooter>
          <div className="flex w-full flex-col gap-4">
            <AlertDialogAction
              onClick={handleSubmit}
              className="shad-submit-btn text-white h-12"
              type="button"
            >
              Submit
              {isLoading && (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full ml-2"></div>
              )}
            </AlertDialogAction>
            <div className="subtitle-2 mt-2 text-center text-light-100">
              Didn&apos;t get a code?
              <button
                type="button"
                className="pl-1 text-brand cursor-pointer"
                onClick={handleResendOTP}
              >
                Click to resend
              </button>
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OtpModal;
