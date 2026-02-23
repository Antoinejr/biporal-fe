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
import BlockByForm from "./BlockByForm";
import BlockBySearch from "./BlockBySearch";

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
          <DialogDescription>Suspend access to premises</DialogDescription>
        </DialogHeader>
        <PageSwitcher className="min-h-[250px]" defaultForm="input">
          <nav className="flex justify-center">
            <PageSwitcher.Button name="input">
              <>Block</>
            </PageSwitcher.Button>
            <PageSwitcher.Button name="search">
              <>Search</>
            </PageSwitcher.Button>
          </nav>
          <PageSwitcher.Panel name="input">
            <BlockByForm CloseBtn={CloseButton} />
          </PageSwitcher.Panel>
          <PageSwitcher.Panel name="search">
            <BlockBySearch />
          </PageSwitcher.Panel>
        </PageSwitcher>
      </DialogContent>
    </Dialog>
  );
};
export default BlockForm;
