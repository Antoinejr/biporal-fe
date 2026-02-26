import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import ChooseMenu from "./ChooseMenu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSiteEngagement } from "@/services/siteService";
import { lookupContractors } from "@/services/contractorService";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import * as z from "zod";
import { Loader } from "lucide-react";
import FormError from "@/components/form-error";
import type { SiteType } from "@/lib/siteTypes";

const { fieldContext, formContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
});

const formSchema = z.object({
  contractorId: z.uuidv4({ message: "Not a valid uuidv4 ID" }),
});

interface SiteEnrollFormProps {
  site: SiteType;
  show: boolean;
  setShow: (b: boolean) => void;
}

const SiteEnrollForm = ({ site, show, setShow }: SiteEnrollFormProps) => {
  const queryClient = useQueryClient();
  const contractorLookupQuery = useQuery({
    queryKey: ["static-contractors"],
    queryFn: lookupContractors,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: createSiteEngagement,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sites"] });
      form.reset();
      setShow(false);
    },
  });

  const form = useAppForm({
    defaultValues: {
      contractorId: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const result = formSchema.safeParse(value);
      if (!result.success) {
        console.error("Failed validation", result.error);
        return;
      }
      mutation.mutate({
        siteId: site.id,
        contractorId: result.data.contractorId,
      });
    },
  });

  return (
    <Dialog open={show} onOpenChange={(open) => setShow(open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Contractor To {site.name}</DialogTitle>
          <DialogDescription>
            Grant access to contractor to use site
          </DialogDescription>
        </DialogHeader>
        <form
          name="siteEnrollForm"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.reset();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <FormError error={mutation.error} title="Failed to Create" />
            <form.AppField
              name="contractorId"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <Field>
                    <ChooseMenu
                      options={contractorLookupQuery.data ?? []}
                      state={field.state.value}
                      label={
                        contractorLookupQuery.data?.find(
                          (item) => item.value === field.state.value,
                        )?.name ?? "Select Contractor"
                      }
                      handleSelect={(option) => {
                        field.handleChange(option.value);
                      }}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.AppForm>
              <Field className="flex justify-end" orientation="horizontal">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={mutation.isPending}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>Confirm</>
                  )}
                </Button>
              </Field>
            </form.AppForm>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default SiteEnrollForm;
