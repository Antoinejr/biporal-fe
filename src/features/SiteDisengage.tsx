import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SiteType } from "@/lib/siteTypes";
import { removeContractorFromSite } from "@/services/siteService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";

function SiteDisengage({
  site,
  show,
  setShow,
}: {
  site: SiteType;
  show: boolean;
  setShow: (b: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const removeContractor = useMutation({
    mutationFn: removeContractorFromSite,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sites"] });
      setShow(false);
    },
  });
  const name = (
    site.contractors.length > 0 ? site.contractors[0].name : "N/A"
  ).toUpperCase();
  return (
    <Dialog open={show} onOpenChange={(open) => setShow(open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Contractor</DialogTitle>
          <DialogDescription>
            This actions removes a contractor from a site.
            <br />
            Are you sure you want to remove{" "}
            <span className="font-bold">{name}</span> from{" "}
            <span className="font-bold">{site.name.toUpperCase()}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={removeContractor.isPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={() => {
              removeContractor.mutate(site.contractors[0].id);
            }}
            type="button"
            variant="default"
            disabled={removeContractor.isPending}
          >
            {removeContractor.isPending ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>Confirm</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SiteDisengage;
