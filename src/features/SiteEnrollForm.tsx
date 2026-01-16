import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import ChooseMenu from "./ChooseMenu";
import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createSiteEngagement, lookupSites } from "@/services/siteService";
import { lookupContractors } from "@/services/contractorService";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as z from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader } from "lucide-react";
import { AxiosError } from "axios";

const { fieldContext, formContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    ChooseMenu,
    Field,
    FieldError,
  },
  formComponents: {
    FieldGroup,
    Button,
  },
});

const formSchema = z.object({
  contractorId: z.uuidv4({ message: "Not a valid uuidv4 ID" }),
  siteId: z.uuidv4("Not a valid uuidv4 ID"),
});

const SiteEnrollForm = () => {
  const queryClient = useQueryClient();
  const [show, setShow] = useState(false);
  const contractorLookupQuery = useQuery({
    queryKey: ["static-contractors"],
    queryFn: lookupContractors,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const siteLookupQuery = useQuery({
    queryKey: ["static-sites"],
    queryFn: lookupSites,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: createSiteEngagement,
    onSuccess: async () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      setShow(false);
    },
  });

  const form = useAppForm({
    defaultValues: {
      contractorId: "",
      siteId: "",
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
      console.log("Cleaned data", result.data);
      mutation.mutate(result.data);
    },
  });

  return (
    <Dialog open={show} onOpenChange={(open) => setShow(open)}>
      <DialogTrigger asChild>
        <Button variant="default">Engage</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enroll Contractor</DialogTitle>
        </DialogHeader>
        <form
          name="site-enroll-form"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.reset();
            form.handleSubmit();
          }}
        >
          <form.FieldGroup>
            {mutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {mutation.error instanceof AxiosError
                    ? `${mutation.error.message}\n${mutation.error.response ? mutation.error.response.data.message : ""}`
                    : mutation.error instanceof Error
                      ? mutation.error.message
                      : "Failed to create contractor. Please try again."}
                </AlertDescription>
              </Alert>
            )}
            <form.AppField
              name="siteId"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field>
                    <field.ChooseMenu
                      options={siteLookupQuery.data ?? []}
                      state={field.state.value}
                      label={
                        siteLookupQuery.data?.find(
                          (item) => item.value === field.state.value,
                        )?.name ?? "Select Site"
                      }
                      handleSelect={(option) => {
                        field.handleChange(option.value);
                      }}
                    />
                    {isInvalid && (
                      <field.FieldError errors={field.state.meta.errors} />
                    )}
                  </field.Field>
                );
              }}
            />
            <form.AppField
              name="contractorId"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0;
                return (
                  <field.Field>
                    <field.ChooseMenu
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
                      <field.FieldError errors={field.state.meta.errors} />
                    )}
                  </field.Field>
                );
              }}
            />
            <form.AppForm>
              <Field orientation="horizontal">
                <form.Button type="submit">
                  {mutation.isPending ? (
                    <>
                      Submitting....{" "}
                      <Loader className="ml-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>Submit</>
                  )}
                </form.Button>
                <DialogClose asChild>
                  <form.Button type="button" variant="outline">
                    Close
                  </form.Button>
                </DialogClose>
              </Field>
            </form.AppForm>
          </form.FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default SiteEnrollForm;
