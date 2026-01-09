import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { Person } from "@/lib/personTypes";
import { activatePerson, deactivatePerson } from "@/services/personService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { AlertCircle, Ban, CheckCircle } from "lucide-react";
import { useState } from "react";

function PersonStatusUpdate({ person }: { person: Person }) {
  const queryClient = useQueryClient();
  const [show, setShow] = useState(false);
  const removePerson = useMutation({
    mutationFn: deactivatePerson,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["persons"] });
      await queryClient.invalidateQueries({ queryKey: ["static-residents"] });
      setShow(false);
    },
  });

  const reactivePerson = useMutation({
    mutationFn: activatePerson,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["persons"] });
      await queryClient.invalidateQueries({ queryKey: ["static-residents"] });
      setShow(false);
    },
  });
  return (
    <Dialog open={show} onOpenChange={(open) => setShow(open)}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            setShow(true);
          }}
        >
          {person.deletedAt ? (
            <>
              <CheckCircle className="mr-2 w-4 h-4" />
              Activate Person
            </>
          ) : (
            <>
              <Ban className="mr-2 w-4 h-4" />
              <>Deactivate Person</>
            </>
          )}
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          {person.deletedAt ? (
            <>
              <DialogTitle> Activate Person </DialogTitle>
              <DialogDescription className="font-bold">
                Activate {person.firstName} {person.lastName}
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle> Deactivate Person </DialogTitle>
              <DialogDescription className="space-y-2">
                <span className="font-bold">
                  Deactivate {person.firstName} {person.lastName}.
                </span><br />
                <span className="text-red-700">
                  <span className="font=bold">NOTE: </span>
                  Deactivating a Resident deactivates their dependents and workers
                </span>
              </DialogDescription>
            </>
          )}
          {removePerson.isError && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                {removePerson.error instanceof AxiosError
                  ? `${removePerson.error.message}\n${
                      removePerson.error.response
                        ? removePerson.error.response.data.message
                        : ""
                    }`
                  : removePerson.error instanceof Error
                    ? removePerson.error.message
                    : "Failed to Deactivate person try again later"}
              </AlertDescription>
            </Alert>
          )}

          {reactivePerson.isError && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                {reactivePerson.error instanceof AxiosError
                  ? `${reactivePerson.error.message}\n${
                      reactivePerson.error.response
                        ? reactivePerson.error.response.data.message
                        : ""
                    }`
                  : reactivePerson.error instanceof Error
                    ? reactivePerson.error.message
                    : "Failed to Reactivate person try again later"}
              </AlertDescription>
            </Alert>
          )}
        </DialogHeader>
      <div className="flex gap-2">
        <Button
          onClick={() => {
            if (person.deletedAt) {
              reactivePerson.mutate(person.id);
            } else {
              removePerson.mutate(person.id);
            }
          }}
          type="button"
          variant="default"
          disabled={reactivePerson.isPending || removePerson.isPending}
        >
          Accept
        </Button>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
      </div>
      </DialogContent>
    </Dialog>
  );
}
export default PersonStatusUpdate;
