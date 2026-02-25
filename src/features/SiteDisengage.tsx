import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { SiteType } from "@/lib/siteTypes";
import { removeContractorFromSite } from "@/services/siteService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleMinus, Loader } from "lucide-react";
import { useState } from "react";

function SiteDisengage({ site }: { site: SiteType }) {
  const queryClient = useQueryClient();
  const [show, setShow] = useState(false);
  const removeContractor = useMutation({
    mutationFn: removeContractorFromSite,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sites"] });
      setShow(false);
    },
  });
  return (
    <Dialog open={show} onOpenChange={(open) => setShow(open)}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          variant="destructive"
          onSelect={(e) => {
            setShow(true);
            e.preventDefault();
          }}
        >
          <CircleMinus className="w-4 h-4" />
          <>Remove Contractor</>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Contractor</DialogTitle>
          <DialogDescription>
            This actions removes a contractor from a site.
            <br />
            Are you sure you want to remove{" "}
            <span className="font-bold>">
              {site.contractors.length > 0 ? site.contractors[0].name : "N/A"}
            </span>{" "}
            from <span className="font-bold">{site.name}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
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
              <>Yes</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SiteDisengage;
