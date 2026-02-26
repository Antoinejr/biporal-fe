import DisplayError from "@/components/error";
import FieldTextarea from "@/components/field-textarea";
import FormError from "@/components/form-error";
import DisplayLoading from "@/components/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "@/lib/utils";
import { addNote, retrieveNotes, type Note } from "@/services/blocklistService";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Loader,
  MessageSquare,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import * as z from "zod";

const { fieldContext, formContext } = createFormHookContexts();
const { useAppForm } = createFormHook({
  fieldComponents: {
    FieldGroup,
  },
  formComponents: {
    Button,
    FieldGroup,
  },
  fieldContext,
  formContext,
});

const FORM_SCHEMA = z.object({
  body: z.string().trim().min(1, { message: "Note content cannot be empty" }),
});

function List({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
        <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
        <p className="text-sm">No notes found for this record.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-6">
      <h3 className="text-sm font-medium text-muted-foreground px-1">
        Recent Notes
      </h3>
      <div className="pr-2 max-h-[350px] overflow-y-auto overflow-x-hidden space-y-3 custom-scrollbar">
        <ul className="grid gap-3">
          {notes.map((n) => (
            <ListItem key={n.id} note={n} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function ListItem({ note }: { note: Note }) {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4">
          <p className="text-md text-slate-700 leading-relaxed italic">
            "{note.reason}"
          </p>
          <div className="flex gap-1 items-center text-sm uppercase tracking-wider text-muted-foreground whitespace-nowrap">
            <Calendar className="h-4 w-4" />
            {formatDateTime(new Date(note.createdAt))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NoteForm({ body, lagId }: { body: string; lagId: string }) {
  const [show, setShow] = useState(false);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: addNote,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notes"],
      });
      form.reset();
      setShow(false);
    },
  });
  const form = useAppForm({
    defaultValues: {
      body,
    },
    validators: {
      onSubmit: FORM_SCHEMA,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate({ lagId, notes: value.body });
    },
  });

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogTrigger asChild>
        <Button
          onClick={() => {
            setShow(true);
          }}
        >
          <Plus className="h-4 w-4" /> New Note
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>
            Provide additional context for this record.
          </DialogDescription>
        </DialogHeader>
        <form
          id="noteForm"
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.FieldGroup>
            <FormError error={mutation.error} title="Could not save note" />
            <form.AppField
              name="body"
              children={(field) => {
                return <FieldTextarea field={field} />;
              }}
            />
            <form.AppForm>
              <Field
                className="flex justify-end gap-3 pt-4"
                orientation="responsive"
              >
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                  >
                    Close
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-8"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>Save Note</>
                  )}
                </Button>
              </Field>
            </form.AppForm>
          </form.FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Notes() {
  const { tid } = useParams<{ tid: string }>();
  const navigate = useNavigate();
  if (!tid) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Note TID is missing.
          <br />
          <Button onClick={() => navigate(-1)} variant="link">
            Go Back
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  const [id, lagId] = tid.split("!");
  console.log(id);
  console.log(lagId);
  const { data, isLoading, error } = useQuery({
    queryKey: ["notes", id],
    queryFn: () => retrieveNotes({ id }),
  });

  if (isLoading) {
    return <DisplayLoading />;
  }

  if (error) {
    return (
      <DisplayError description=" Failed to load notes. Please refresh the page. " />
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Notes</h2>
          <p className="text-sm text-muted-foreground">
            Internal notes and history.
          </p>
        </div>
        <NoteForm body={""} lagId={lagId!} />
      </div>

      <Separator className="my-6" />

      <List notes={data?.data ?? []} />
    </div>
  );
}

export default Notes;
