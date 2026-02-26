import FormError from "@/components/form-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogContent,
} from "@/components/ui/dialog";
import type { Person } from "@/lib/personTypes";
import { activatePerson, deactivatePerson } from "@/services/personService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";

function PersonStatusUpdate({
  person,
  show,
  setShow,
}: {
  person: Person;
  show: boolean;
  setShow: (v: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const deactivate = useMutation({
    mutationFn: deactivatePerson,
    onSuccess: async () => {
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: ["persons"] }),
        queryClient.invalidateQueries({ queryKey: ["static-residents"] }),
      ]);
      setShow(false);
    },
  });

  const activate = useMutation({
    mutationFn: activatePerson,
    onSuccess: async () => {
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: ["persons"] }),
        queryClient.invalidateQueries({ queryKey: ["static-residents"] }),
      ]);
      setShow(false);
    },
  });

  const isPending = activate.isPending || deactivate.isPending;
  const name = `${person.firstName} ${person.lastName}`;

  return (
    <Dialog open={show} onOpenChange={(open) => setShow(open)}>
      <DialogContent>
        <DialogHeader>
          {person.deletedAt ? (
            <>
              <DialogTitle> Activate {name} </DialogTitle>
              <DialogDescription>
                Activating a supervisor grants them access to premises
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle> Deactivate {name} </DialogTitle>
              <DialogDescription>
                Deactivating a supervisor revokes their access to premises
              </DialogDescription>
            </>
          )}
          {deactivate.isError && (
            <FormError error={deactivate.isError} title="Failed to update" />
          )}
          {activate.isError && (
            <FormError error={activate.isError} title="Failed to update" />
          )}
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={() => {
              if (person.deletedAt) {
                activate.mutate(person.id);
              } else {
                deactivate.mutate(person.id);
              }
            }}
            type="button"
            variant="default"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader className="w-4 h-4 animate-spin" /> Saving
              </>
            ) : (
              "Yes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default PersonStatusUpdate;
