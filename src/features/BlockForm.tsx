import PageSwitcher from "@/components/page-switcher";
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
import { useState } from "react";
import BlockByLagIDForm from "./BlockByLagIDForm";

const BlockForm = () => {
  const [show, setShow] = useState<boolean>(false);

  const CloseButton = (disabled: boolean = false, onClick?: () => void) => {
    return (
      <DialogClose asChild>
        <Button
          disabled={disabled}
          type="button"
          variant="outline"
          onClick={onClick}
        >
          Cancel
        </Button>
      </DialogClose>
    );
  };

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogTrigger asChild>
        <Button variant="default">Block Person</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Block Person</DialogTitle>
          <DialogDescription>Suspend access onto premises</DialogDescription>
        </DialogHeader>
        <PageSwitcher defaultForm="lag">
          <nav>
            <PageSwitcher.Button name="lag">
              <>LagID</>
            </PageSwitcher.Button>
            <PageSwitcher.Button name="token">
              <>Token</>
            </PageSwitcher.Button>
          </nav>
          <PageSwitcher.Panel name="lag">
            <BlockByLagIDForm CloseBtn={CloseButton} />
          </PageSwitcher.Panel>
          <PageSwitcher.Panel name="token">
            <form></form>
          </PageSwitcher.Panel>
        </PageSwitcher>
      </DialogContent>
    </Dialog>
  );
};
export default BlockForm;
