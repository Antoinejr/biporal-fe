import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import ChooseMenu from "./ChooseMenu";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSiteEngagement } from "@/services/siteService";
import { lookupContractors } from "@/services/contractorService";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import * as z from "zod";
import { CirclePlus, Loader } from "lucide-react";
import FormError from "@/components/form-error";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
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
}

const SiteEnrollForm = ({ site }: SiteEnrollFormProps) => {
  const queryClient = useQueryClient();
  const [show, setShow] = useState(false);
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
      <DialogTrigger asChild>
        <DropdownMenuItem
          variant="default"
          onSelect={(e) => {
            e.preventDefault();
            setShow(true);
          }}
        >
          <CirclePlus className="h-4 w-4" />
          Add Contractor
        </DropdownMenuItem>
      </DialogTrigger>
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
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">
                  {mutation.isPending ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>Add</>
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
