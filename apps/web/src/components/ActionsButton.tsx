import {
  Button,
  Description,
  Dropdown,
  Header,
  type Key,
  Label,
} from "@heroui/react";
import { EllipsisVertical } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export type ButtonAction = {
  label: string;
  description: string;
  onClick: (id: string) => void;
  key: string;
  variant?: React.ComponentProps<typeof Dropdown.Item>["variant"];
  icon: ReactNode;
};

type ActionsButtonsProps = {
  buttons: ButtonAction[];
};

export default function ActionsButtons({ buttons }: ActionsButtonsProps) {
  const handleAction = (key: Key) => {
    const press = buttons.find((b) => b.key === key);
    press?.onClick(key as string);
  };

  return (
    <Dropdown>
      <Button isIconOnly aria-label="Menu" variant="secondary">
        <EllipsisVertical className="outline-none" />
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu onAction={handleAction}>
          <Dropdown.Section>
            <Header>Acciones</Header>
            {buttons.map((b) => (
              <Dropdown.Item
                key={b.key}
                id={b.key}
                textValue={b.description}
                variant={b.variant}
              >
                <div className="flex h-8 items-start justify-center pt-px">
                  {b.icon}
                </div>
                <div className="flex flex-col">
                  <Label>{b.label}</Label>
                  <Description>{b.description}</Description>
                </div>
              </Dropdown.Item>
            ))}

            {/**/}
            {/* <Dropdown.Item */}
            {/*   key="delete" */}
            {/*   id="delete" */}
            {/*   textValue="Desactivar cuenta veterinario" */}
            {/*   variant="danger" */}
            {/* > */}
            {/*   <div className="flex h-8 items-start justify-center pt-px"> */}
            {/*     <Trash2 className="size-4 shrink-0 text-danger" /> */}
            {/*   </div> */}
            {/*   <div className="flex flex-col"> */}
            {/*     <Label>Eliminar</Label> */}
            {/*     <Description>Eliminar elemento</Description> */}
            {/*   </div> */}
            {/* </Dropdown.Item> */}
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
