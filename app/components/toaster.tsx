import { useEffect } from "react";
import { toast as showToast } from "sonner";
import { Toast } from "#app/utils/toast.server";

export const useToast = (toast: Toast | undefined) => {
  useEffect(() => {
    if (toast) {
      setTimeout(() => {
        showToast[toast.type](toast.title, {
          id: toast.id,
          description: toast.description,
        });
      }, 0);
    }
  }, [toast]);
};
