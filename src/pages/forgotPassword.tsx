import { useState } from "react";
// import { useNavigate } from "react-router";
import { Eye, EyeOff, Lock } from "lucide-react";
import { AuthCard } from "../components/shared/auth-card";
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
import { schemaForgotPassword } from "../schemas";
import { useNavigate, useParams } from "react-router";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [visibility, setVisibility] = useState(false);
  const { token } = useParams()
  const authService = new AuthService();

  type FormFields = z.infer<typeof schemaForgotPassword>;

  const {
    register,
    setError,
    handleSubmit,
    setValue,
    formState: {
      errors,

      isSubmitting,
    },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaForgotPassword),
  });

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      const payload = {
        token : token,
        newPassword: values.password,
        confirmPassword: values.confirmPassword,
      };

      const response = await authService.forgotPassword(payload);
      console.log(response);

      if (response?.code === 200) {
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
      setValue("password", "");
      setValue("confirmPassword", "");
    }
  };

  return (
    <AuthCard
      title="Set a new password"
      subtitle="Choose a password you have not used before."
      footer={
        <button type="button" className="font-medium text-brand hover:underline" onClick={() => navigate("/auth")}>
          Back to log in
        </button>
      }
    >
      <form className="flex flex-col gap-1" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Password"
          type={visibility ? "text" : "password"}
          {...register("password")}
          error={errors?.password?.message}
          disabled={isSubmitting}
          name="password"
          className="pl-10 pr-11 text-sm"
          leftIcon={<Lock size={16} className="ml-2.5 text-fg3" />}
          id="Password"
          placeholder="Password"
          autoComplete="new-password"
          rightIcon={
                    <button
                      onClick={() => setVisibility(!visibility)}
                      type="button"
                      aria-label={visibility ? "Hide password" : "Show password"}
                      className="grid h-8 w-8 place-items-center rounded-lg text-fg3 transition-colors hover:bg-panel-hi hover:text-fg"
                    >
                      {visibility ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  }
        />
        <Input
          label="Confirm Password"
          type={visibility ? "text" : "password"}
          {...register("confirmPassword")}
          error={errors?.confirmPassword?.message}
          disabled={isSubmitting}
          name="confirmPassword"
          className="pl-10 pr-11 text-sm"
          leftIcon={<Lock size={16} className="ml-2.5 text-fg3" />}
          id="confirmPassword"
          placeholder="Confirm Password"
          autoComplete="new-password"
          rightIcon={
                    <button
                      onClick={() => setVisibility(!visibility)}
                      type="button"
                      aria-label={visibility ? "Hide password" : "Show password"}
                      className="grid h-8 w-8 place-items-center rounded-lg text-fg3 transition-colors hover:bg-panel-hi hover:text-fg"
                    >
                      {visibility ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  }
        />
        <button className="v-btn v-btn-primary mt-2 h-11 w-full text-sm" type="submit" disabled={isSubmitting}>
          {isSubmitting ? <ClipLoader color="#fff" size={14} /> : "Submit"}
        </button>
      </form>
    </AuthCard>
  );
};

export default ForgotPassword;
