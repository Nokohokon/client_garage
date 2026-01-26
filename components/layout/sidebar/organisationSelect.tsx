"use client";

import {Button, Label, ListBox, Select} from "@heroui/react";
import { useIsOpen } from "@/store/open";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export function OrganisationSelect() {
    const isOpen = useIsOpen((state) => state.isOpen);
    const setIsOpen = useIsOpen((state) => state.setIsOpen);
    const { data: session } = authClient.useSession();
    const { data: organisations } = authClient.useListOrganizations();



  return (
    <div className="space-y-4">
      <Select
        className="w-[256px]"
        isOpen={isOpen}
        placeholder="Bitte Organisation wählen"
        onOpenChange={setIsOpen}
      >
        <Label>Organisation wechseln</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {organisations && organisations.map((org) => (
              <ListBox.Item key={org.id} id={org.id} textValue={org.name}>
                {org.name}
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  );
}