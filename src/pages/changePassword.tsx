// import { useState } from "react";
// import { useNavigate } from "react-router";
import { AuthCard } from "../components/shared/auth-card";
import { Mail } from "lucide-react";
// import { IoEyeOutline } from "react-icons/io5";
// import { IoEyeOffOutline } from "react-icons/io5";
// import { schemaLogin } from "../schemas";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { AuthService } from "../services";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../components/ui/input";
import { ClipLoader } from "react-spinners";
// import { SESSION_STORAGE_KEY } from "../constants";
import { AxiosError } from "axios";
import { schemaChangePassword } from "../schemas";
import { useNavigate } from "react-router";

const ChangePassword = () => {
  const navigate = useNavigate();
  // const [visibility, setVisibility] = useState(false);
  const authService = new AuthService();

  type FormFields = z.infer<typeof schemaChangePassword>;

  const {
    register,
    setError,
    handleSubmit,
    setValue,
    formState: { 
      // errors
      // , 
      
      isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaChangePassword),
  });

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      const payload = {
        email: values.email,
      };

      const response = await authService.changePassword(payload);
      console.log(response);

      if (response.code === 200) {
        toast.success(response?.message);
        navigate("/auth")
      
        console.log(response)
      }
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Login failed");
      } else {
        toast.error("Login failed");
      }
      setError("root", {
        type: "deps",
        message: "Login failed",
      });
      setValue("email", "");
    }
  };

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we will send you a link to set a new one."
      footer={
        <button type="button" className="font-medium text-brand hover:underline" onClick={() => navigate("/auth")}>
          Back to log in
        </button>
      }
    >
      <form className="flex flex-col gap-1" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Email"
          className="pl-10 text-sm"
          leftIcon={<Mail size={16} className="ml-2.5 text-fg3" />}
          placeholder="example@email.com"
          id="email"
          autoComplete="username"
          {...register("email")}
        />
        <button className="v-btn v-btn-primary mt-2 h-11 w-full text-sm" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <ClipLoader color="#fff" size={14} /> Sending...
            </>
          ) : (
            "Send link"
          )}
        </button>
      </form>
    </AuthCard>
  );
};

export default ChangePassword;
